"""Enrutamiento por competencia y asignación (§6.2 y §6.3).

Estas dos piezas son la corrección del hallazgo central del análisis: hoy 854
demandas y 2.374 tutelas caen en la misma bandeja genérica y se quedan ahí, y
8.740 casos (84 % del rezago) están en una mesa de entrada sin dueño.

De ahí las dos invariantes: lo que no es competencia se desvía apenas se clasifica,
y ningún caso queda sin responsable — si no hay asesor elegible, entra a una cola
con alerta explícita, nunca a un limbo.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .estados import TERMINALES, Estado
from .modelos import Caso, ConflictoInteres, Rol, RutaEspecial, Usuario

# Palabras de la tipología que desvían el caso fuera del flujo estándar.
# El orden importa: la primera que coincide manda.
_RUTAS = [
    (RutaEspecial.TUTELA, "Jurídica · término judicial", ("tutela", "accion de tutela", "acción de tutela")),
    (RutaEspecial.CONTENCIOSO, "Grupo de lo Contencioso", ("demanda", "proceso judicial", "contencioso")),
    (RutaEspecial.ENTE_CONTROL, "Dependencia competente con copia a la OCI", ("ente de control", "procuraduria", "procuraduría", "contraloria", "contraloría", "personeria", "personería")),
    (RutaEspecial.DISCIPLINARIO, "Control Disciplinario", ("corrupcion", "corrupción", "denuncia disciplinaria")),
    (RutaEspecial.CONGRESO, "Asuntos Legislativos", ("congreso", "proposicion", "proposición", "senado", "camara de representantes", "cámara de representantes")),
]

# Asuntos que son de otra dirección: no son ruta especial del caso, pero tampoco
# competencia de la Dirección NARP, así que se trasladan.
_OTRAS_DIRECCIONES = [
    ("Dirección de Consulta Previa", ("consulta previa",)),
    ("Dirección de Asuntos Indígenas, ROM y Minorías", ("indigena", "indígena", "rom", "gitano")),
]


@dataclass
class Enrutamiento:
    ruta: RutaEspecial
    destino: str | None          # a dónde va si no es el flujo estándar
    es_competencia: bool         # False => se traslada (§6.2)
    motivo: str

    def dict(self) -> dict:
        return {
            "ruta": self.ruta.value,
            "destino": self.destino,
            "es_competencia": self.es_competencia,
            "motivo": self.motivo,
        }


def enrutar(*, tipologia: str | None, asunto: str | None = None) -> Enrutamiento:
    """Determinístico, se ejecuta apenas se clasifica. Sin IA."""
    texto = " ".join(p for p in (tipologia, asunto) if p).lower()

    for ruta, destino, claves in _RUTAS:
        if any(c in texto for c in claves):
            return Enrutamiento(
                ruta=ruta,
                destino=destino,
                es_competencia=False,
                motivo=f"La tipología corresponde a {destino}, con término propio.",
            )

    for destino, claves in _OTRAS_DIRECCIONES:
        if any(c in texto for c in claves):
            return Enrutamiento(
                ruta=RutaEspecial.NINGUNA,
                destino=destino,
                es_competencia=False,
                motivo=f"El asunto es competencia de la {destino}.",
            )

    return Enrutamiento(
        ruta=RutaEspecial.NINGUNA,
        destino=None,
        es_competencia=True,
        motivo="Es competencia de la Dirección NARP y sigue el flujo estándar.",
    )


# --------------------------------------------------------------------------
# Asignación
# --------------------------------------------------------------------------

@dataclass
class Propuesta:
    asesor: Usuario | None
    justificacion: str
    alerta: str | None = None   # se llena cuando no hay asesor elegible

    def dict(self) -> dict:
        return {
            "asesor_id": self.asesor.id if self.asesor else None,
            "asesor_nombre": self.asesor.nombre if self.asesor else None,
            "justificacion": self.justificacion,
            "alerta": self.alerta,
        }


def carga_activa(db: Session, usuario_id: str) -> int:
    """Casos vivos en manos de un asesor."""
    return db.execute(
        select(func.count(Caso.id))
        .where(Caso.responsable_actual_id == usuario_id)
        .where(Caso.estado.not_in(list(TERMINALES)))
    ).scalar_one()


def proponer_asesor(db: Session, caso: Caso) -> Propuesta:
    """Propone, no impone (§4.3): la mesa confirma o cambia con motivo.

    Criterios en el orden de §6.3: sin conflicto de interés, con historial en la
    comunidad, por territorio, y entre los elegibles el de menor carga, respetando
    el WIP.
    """
    candidatos = db.execute(
        select(Usuario).where(Usuario.activo.is_(True))
    ).scalars().all()
    candidatos = [u for u in candidatos if u.tiene_rol(Rol.ASESOR)]

    if not candidatos:
        return Propuesta(None, "No hay asesores registrados.",
                         alerta="El caso queda en cola: no hay ningún asesor activo.")

    # 1. Excluir conflicto de interés declarado sobre esa comunidad.
    if caso.comunidad_id:
        con_conflicto = set(db.execute(
            select(ConflictoInteres.usuario_id)
            .where(ConflictoInteres.comunidad_id == caso.comunidad_id)
        ).scalars().all())
        candidatos = [u for u in candidatos if u.id not in con_conflicto]

    if not candidatos:
        return Propuesta(None, "Todos los asesores tienen conflicto de interés declarado sobre esta comunidad.",
                         alerta="El caso queda en cola y requiere decisión del coordinador.")

    cargas = {u.id: carga_activa(db, u.id) for u in candidatos}

    # 5. Respetar el WIP. Si nadie tiene cupo, se dice explícitamente.
    con_cupo = [u for u in candidatos if cargas[u.id] < u.wip_maximo]
    if not con_cupo:
        menor = min(candidatos, key=lambda u: cargas[u.id])
        return Propuesta(
            None,
            "Todos los asesores están en su límite de trabajo en curso.",
            alerta=(
                f"El caso queda en cola: ningún asesor tiene cupo. El de menor carga "
                f"es {menor.nombre} con {cargas[menor.id]} casos."
            ),
        )

    # 2. Continuidad: quien ya trabajó esa comunidad conoce el expediente.
    if caso.comunidad_id:
        previos = set(db.execute(
            select(Caso.responsable_actual_id)
            .where(Caso.comunidad_id == caso.comunidad_id)
            .where(Caso.id != caso.id)
            .where(Caso.responsable_actual_id.is_not(None))
        ).scalars().all())
        con_historial = [u for u in con_cupo if u.id in previos]
        if con_historial:
            elegido = min(con_historial, key=lambda u: cargas[u.id])
            return Propuesta(
                elegido,
                f"Ya llevó otros casos de esta comunidad y tiene {cargas[elegido.id]} "
                f"casos activos de {elegido.wip_maximo}.",
            )

    # 3. Territorio.
    if caso.comunidad and caso.comunidad.departamento:
        del_territorio = [
            u for u in con_cupo
            if u.territorio and u.territorio.lower() == caso.comunidad.departamento.lower()
        ]
        if del_territorio:
            elegido = min(del_territorio, key=lambda u: cargas[u.id])
            return Propuesta(
                elegido,
                f"Atiende {elegido.territorio} y tiene {cargas[elegido.id]} "
                f"casos activos de {elegido.wip_maximo}.",
            )

    # 4. Menor carga entre los elegibles.
    elegido = min(con_cupo, key=lambda u: cargas[u.id])
    return Propuesta(
        elegido,
        f"Es el asesor con menor carga: {cargas[elegido.id]} casos activos "
        f"de {elegido.wip_maximo}.",
    )
