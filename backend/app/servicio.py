"""Servicio del caso: transiciones, relojes y traza.

Toda transición pasa por `mover`, que valida contra la máquina de estados, acumula
los relojes y deja el evento. Es el único punto donde cambia el estado de un caso,
para que ninguna ruta pueda saltarse una regla por olvido.
"""

from __future__ import annotations

import secrets
from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import config
from .estados import Estado, TERMINALES, es_retorno_interno, exigir_transicion
from .habiles import contar_habiles, sumar_habiles
from .modelos import (
    ActorTipo,
    Caso,
    EventoCaso,
    PublicacionRadicado,
    Reloj,
    Rol,
    Usuario,
    ahora,
)

# Rol que queda a cargo al entrar en cada estado. Sin esto, un caso puede quedar
# sin dueño, que es exactamente el fallo de los 8.740 casos en mesa de entrada.
ROL_POR_ESTADO: dict[Estado, Rol | None] = {
    Estado.RECIBIDO: Rol.VENTANILLA,
    Estado.RADICADO: Rol.CLASIFICADOR,
    Estado.CLASIFICADO: Rol.MESA,
    Estado.ASIGNADO: Rol.ASESOR,
    Estado.EN_ANALISIS: Rol.ASESOR,
    Estado.PROYECTADO: Rol.ASESOR,
    Estado.EN_PRE_REVISION: Rol.REVISOR,
    Estado.EN_REVISION: Rol.REVISOR,
    Estado.APROBADO: Rol.FIRMANTE,
    Estado.PENDIENTE_RADICACION: Rol.FIRMANTE,
    Estado.FIRMADO: Rol.FIRMANTE,
    Estado.NOTIFICADO: None,
}


def numero_seguimiento(db: Session) -> str:
    """Número propio del sistema. El radicado oficial lo sigue generando ControlDoc (§2)."""
    anio = date.today().year
    n = db.execute(select(func.count(Caso.id))).scalar_one() + 1
    return f"RUPN-{anio}-{n:06d}"


def registrar_evento(
    db: Session,
    caso: Caso,
    *,
    motivo: str,
    actor: Usuario | None = None,
    actor_tipo: ActorTipo = ActorTipo.USUARIO,
    estado_origen: Estado | None = None,
    estado_destino: Estado | None = None,
    sugerencia_ia: dict | None = None,
    decision_humana: dict | None = None,
    visible_ciudadano: bool = True,
    dato_restringido: bool = False,
) -> EventoCaso:
    ev = EventoCaso(
        caso_id=caso.id,
        actor_id=actor.id if actor else None,
        actor_nombre=actor.nombre if actor else "Sistema",
        actor_tipo=actor_tipo,
        estado_origen=estado_origen,
        estado_destino=estado_destino,
        motivo=motivo,
        sugerencia_ia=sugerencia_ia,
        decision_humana=decision_humana,
        visible_ciudadano=visible_ciudadano,
        dato_restringido=dato_restringido,
    )
    db.add(ev)
    return ev


def _acumular_reloj(caso: Caso, hasta: date | None = None) -> None:
    """Pasa a los contadores los días hábiles corridos desde el último cambio.

    Los dos relojes van separados (§4.6): el del Ministerio y el del ciudadano
    no se mezclan, para poder mostrar cuánto tiempo estuvo cada parte.
    """
    hasta = hasta or date.today()
    if not caso.reloj_desde:
        caso.reloj_desde = hasta
        return

    corridos = contar_habiles(caso.reloj_desde, hasta)
    if corridos:
        if caso.reloj_activo is Reloj.MINISTERIO:
            caso.dias_ministerio += corridos
        elif caso.reloj_activo is Reloj.CIUDADANO:
            caso.dias_ciudadano += corridos
    caso.reloj_desde = hasta


def cambiar_reloj(caso: Caso, destino: Reloj) -> None:
    _acumular_reloj(caso)
    caso.reloj_activo = destino


def mover(
    db: Session,
    caso: Caso,
    destino: Estado,
    *,
    motivo: str,
    actor: Usuario | None = None,
    responsable: Usuario | None = None,
    sugerencia_ia: dict | None = None,
    decision_humana: dict | None = None,
) -> Caso:
    """Única puerta para cambiar el estado de un caso."""
    origen = caso.estado
    exigir_transicion(origen, destino, retorno_usado=caso.retorno_usado)

    retorno = es_retorno_interno(origen, destino)
    if retorno:
        # Gasta el retorno único (§4.5) y no reinicia el reloj (§13.5).
        caso.retorno_usado = True

    _acumular_reloj(caso)
    caso.estado = destino

    if destino in TERMINALES:
        caso.reloj_activo = Reloj.DETENIDO
        caso.responsable_actual_id = None
        caso.rol_responsable = None
    else:
        rol = ROL_POR_ESTADO.get(destino)
        caso.rol_responsable = rol
        if responsable is not None:
            caso.responsable_actual_id = responsable.id
        elif retorno:
            # Vuelve al mismo asesor que lo trabajó: conoce el expediente.
            pass
        elif rol != caso.rol_responsable:
            caso.responsable_actual_id = None

    registrar_evento(
        db, caso,
        motivo=motivo,
        actor=actor,
        estado_origen=origen,
        estado_destino=destino,
        sugerencia_ia=sugerencia_ia,
        decision_humana=decision_humana,
        # Los retornos internos no se le muestran al ciudadano (§13.6):
        # ver la barra retroceder genera llamadas.
        visible_ciudadano=not retorno,
    )
    db.flush()
    return caso


def radicar(db: Session, caso: Caso, *, actor: Usuario | None = None) -> Caso:
    """Fija el término y arranca el reloj del Ministerio."""
    hoy = date.today()
    dias = caso.tipo_tramite.termino_dias_habiles or config().termino_dias_habiles

    caso.fecha_radicacion = ahora()
    caso.fecha_vencimiento = sumar_habiles(hoy, dias)
    caso.reloj_activo = Reloj.MINISTERIO
    caso.reloj_desde = hoy

    return mover(
        db, caso, Estado.RADICADO,
        motivo=f"Solicitud radicada. Término de {dias} días hábiles: vence el {caso.fecha_vencimiento:%d/%m/%Y}.",
        actor=actor,
    )


def dias_restantes(caso: Caso) -> int | None:
    """Días hábiles que faltan para el vencimiento. Negativo si ya venció."""
    if not caso.fecha_vencimiento or caso.estado in TERMINALES:
        return None
    hoy = date.today()
    if caso.fecha_vencimiento >= hoy:
        return contar_habiles(hoy, caso.fecha_vencimiento)
    return -contar_habiles(caso.fecha_vencimiento, hoy)


def esta_vencido(caso: Caso) -> bool:
    d = dias_restantes(caso)
    return d is not None and d < 0


# --------------------------------------------------------------------------
# Publicación del radicado: idempotente (§9)
# --------------------------------------------------------------------------

def publicar_radicado(db: Session, caso: Caso, *, forzar_fallo: bool | None = None) -> PublicacionRadicado:
    """Publica en ControlDoc con clave de idempotencia.

    Un reintento mal hecho genera actos administrativos duplicados, así que la
    publicación se guarda por caso: si ya salió bien, reintentar devuelve lo mismo
    en vez de publicar otra vez.
    """
    pub = db.execute(
        select(PublicacionRadicado).where(PublicacionRadicado.caso_id == caso.id)
    ).scalars().first()

    if pub is None:
        pub = PublicacionRadicado(
            caso_id=caso.id,
            clave_idempotencia=f"{caso.numero_seguimiento}:radicado",
        )
        db.add(pub)
        db.flush()

    # Ya publicado: no se vuelve a publicar, se devuelve el mismo radicado.
    if pub.estado == "publicado":
        return pub

    pub.intentos += 1
    falla = config().controldoc_falla if forzar_fallo is None else forzar_fallo

    if falla:
        pub.estado = "pendiente"
        pub.ultimo_error = "ControlDoc no respondió."
        return pub

    pub.radicado_externo = _radicado_controldoc()
    pub.estado = "publicado"
    pub.ultimo_error = None
    caso.radicado_externo = pub.radicado_externo
    return pub


def _radicado_controldoc() -> str:
    """Mock del radicado oficial (§11: ControlDoc se simula en el MVP)."""
    return f"EXT-{date.today().year}-{secrets.randbelow(900000) + 100000}"
