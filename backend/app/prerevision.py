"""Pre-revisión (§6.4).

Dos límites que no se negocian:

  - No emite veredicto, ni score, ni porcentaje de confianza (§6.4, §13.1).
    Solo hallazgos y verificaciones superadas. Un "aprobado" produce sesgo de
    automatización y el revisor deja de revisar.
  - No bloquea el avance (§4.4). Si la capa 2 falla, se entrega la capa 1 con
    aviso y el caso sigue. Ningún componente de IA detiene un trámite.

El contrato de salida es el de §6.4 y está cubierto por `contrato_valido`, que se
usa para validar lo que devuelva la capa 2 antes de confiar en ello.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from .estados import TERMINALES
from .modelos import (
    Caso,
    Documento,
    EstadoRegistro,
    Proyeccion,
    Representante,
    Severidad,
)

# Marcador que deja la proyección donde falta un dato (§4, P11 del diseño).
MARCADOR = "[VERIFICAR"


@dataclass
class Verificacion:
    regla_id: str
    enunciado: str
    severidad: Severidad
    superada: bool
    descripcion: str = ""
    evidencia: str | None = None
    ubicacion: str | None = None


@dataclass
class Salida:
    """Contrato de §6.4. Deliberadamente no tiene veredicto ni puntaje."""

    hallazgos: list[dict] = field(default_factory=list)
    verificaciones_superadas: list[str] = field(default_factory=list)
    capa_2_disponible: bool = True
    aviso: str | None = None

    def dict(self) -> dict:
        d = {
            "hallazgos": self.hallazgos,
            "verificaciones_superadas": self.verificaciones_superadas,
        }
        if not self.capa_2_disponible:
            d["capa_2_disponible"] = False
            d["aviso"] = self.aviso
        return d


def contrato_valido(datos: object) -> bool:
    """Valida la salida de la capa 2 antes de usarla.

    Rechaza cualquier cosa que parezca un veredicto: si el modelo se sale del
    contrato, se descarta y se entrega solo la capa 1.
    """
    if not isinstance(datos, dict):
        return False
    if not isinstance(datos.get("hallazgos"), list):
        return False
    if not isinstance(datos.get("verificaciones_superadas"), list):
        return False

    prohibidos = {"veredicto", "score", "puntaje", "confianza", "aprobado", "porcentaje"}
    if prohibidos & {k.lower() for k in datos}:
        return False

    for h in datos["hallazgos"]:
        if not isinstance(h, dict):
            return False
        if not {"regla_id", "severidad", "descripcion"} <= set(h):
            return False
        if h["severidad"] not in (Severidad.BLOQUEANTE.value, Severidad.ADVERTENCIA.value):
            return False
    return True


def capa_1(db: Session, caso: Caso) -> list[Verificacion]:
    """Verificaciones determinísticas de §6.4. Sin IA, siempre disponibles."""
    v: list[Verificacion] = []
    tipo = caso.tipo_tramite
    datos = caso.datos or {}

    # Documentos requeridos presentes.
    presentes = {
        d.tipo for d in db.execute(
            select(Documento).where(Documento.caso_id == caso.id)
        ).scalars().all()
    }
    faltan = [d for d in (tipo.documentos_requeridos or []) if d not in presentes]
    v.append(Verificacion(
        "documentos_requeridos", "Todos los documentos requeridos están presentes",
        Severidad.BLOQUEANTE, not faltan,
        descripcion=f"Faltan: {', '.join(faltan)}." if faltan else "",
        ubicacion="Documentos del expediente",
    ))

    # Representante propuesto sin vigencia en otra comunidad.
    doc = datos.get("representante_documento")
    conflicto = None
    if doc:
        conflicto = db.execute(
            select(Representante)
            .where(Representante.numero_documento == str(doc))
            .where(Representante.vigente_hasta.is_(None))
            .where(Representante.comunidad_id != (caso.comunidad_id or ""))
        ).scalars().first()
    v.append(Verificacion(
        "representante_sin_conflicto",
        "El representante propuesto no está vigente en otra comunidad",
        Severidad.BLOQUEANTE, conflicto is None,
        descripcion=(
            f"El documento {doc} figura como representante vigente de otra comunidad "
            f"registrada." if conflicto else ""
        ),
        evidencia=conflicto.comunidad_id if conflicto else None,
        ubicacion="Datos del representante",
    ))

    # Fecha del acta posterior al último acto.
    fecha_acta = _fecha(datos.get("fecha_acta"))
    ultima = caso.comunidad.fecha_ultima_actualizacion if caso.comunidad else None
    ok_fecha = not (fecha_acta and ultima and fecha_acta < ultima)
    v.append(Verificacion(
        "fecha_acta_posterior", "La fecha del acta es posterior al último acto administrativo",
        Severidad.BLOQUEANTE, ok_fecha,
        descripcion=(
            f"El acta es del {fecha_acta:%d/%m/%Y} y el último acto registrado es del "
            f"{ultima:%d/%m/%Y}." if not ok_fecha else ""
        ),
        ubicacion="Datos del cambio",
    ))

    # La comunidad existe y su estado permite el trámite.
    habilitada = bool(caso.comunidad) and caso.comunidad.estado_registro is not EstadoRegistro.SUSPENDIDO
    v.append(Verificacion(
        "comunidad_habilitada", "La comunidad existe y su estado permite el trámite",
        Severidad.BLOQUEANTE, habilitada,
        descripcion="" if habilitada else "El registro de la comunidad está suspendido o no existe.",
    ))

    # Sin otra solicitud abierta por el mismo motivo.
    otro = db.execute(
        select(Caso)
        .where(Caso.comunidad_id == caso.comunidad_id)
        .where(Caso.tipo_tramite_id == caso.tipo_tramite_id)
        .where(Caso.id != caso.id)
        .where(Caso.estado.not_in(list(TERMINALES)))
    ).scalars().first()
    v.append(Verificacion(
        "sin_duplicado_abierto", "No hay otra solicitud abierta por el mismo motivo",
        Severidad.BLOQUEANTE, otro is None,
        descripcion=f"Coincide con {otro.numero_seguimiento}." if otro else "",
        evidencia=otro.numero_seguimiento if otro else None,
    ))

    # Proyección sin marcadores pendientes.
    proy = db.execute(
        select(Proyeccion)
        .where(Proyeccion.caso_id == caso.id)
        .order_by(Proyeccion.version.desc())
    ).scalars().first()
    pendientes = list(proy.marcadores_pendientes or []) if proy else []
    if proy and MARCADOR in (proy.contenido or "") and not pendientes:
        pendientes = ["Hay marcadores sin resolver en el texto."]
    v.append(Verificacion(
        "sin_marcadores_pendientes", "La proyección no tiene marcadores pendientes",
        Severidad.BLOQUEANTE, bool(proy) and not pendientes,
        descripcion=(
            "No hay proyección todavía." if not proy
            else f"Quedan {len(pendientes)} marcadores por resolver." if pendientes else ""
        ),
        ubicacion="Texto de la proyección",
    ))

    # Listado censal consistente (advertencia, no bloquea).
    total, hombres, mujeres = (datos.get(k) for k in ("censo_total", "censo_hombres", "censo_mujeres"))
    censo_ok = True
    detalle = ""
    if total is not None and hombres is not None and mujeres is not None:
        suma = int(hombres) + int(mujeres)
        censo_ok = suma == int(total)
        detalle = "" if censo_ok else f"El listado suma {suma} y se declararon {total}."
    v.append(Verificacion(
        "censo_consistente", "El listado censal es internamente consistente",
        Severidad.ADVERTENCIA, censo_ok, descripcion=detalle, ubicacion="Censo",
    ))

    return v


def ejecutar(db: Session, caso: Caso, *, salida_capa_2: dict | None = None) -> Salida:
    """Corre la capa 1 y suma la capa 2 si vino y respeta el contrato.

    La capa 2 es opcional a propósito: si no llega o no valida, el resultado sigue
    siendo útil y el caso no se detiene.
    """
    verificaciones = capa_1(db, caso)

    salida = Salida(
        hallazgos=[
            {
                "regla_id": x.regla_id,
                "severidad": x.severidad.value,
                "descripcion": x.descripcion or x.enunciado,
                "evidencia": x.evidencia,
                "ubicacion": x.ubicacion,
                "capa": 1,
            }
            for x in verificaciones if not x.superada
        ],
        verificaciones_superadas=[x.regla_id for x in verificaciones if x.superada],
    )

    if salida_capa_2 is None:
        return salida

    if not contrato_valido(salida_capa_2):
        # §6.4: 2 reintentos y, si persiste, solo capa 1 con aviso al revisor.
        salida.capa_2_disponible = False
        salida.aviso = (
            "El verificador de coherencia no devolvió un resultado válido. "
            "Se muestran únicamente las verificaciones determinísticas."
        )
        return salida

    for h in salida_capa_2["hallazgos"]:
        salida.hallazgos.append({**h, "capa": 2})
    salida.verificaciones_superadas.extend(salida_capa_2["verificaciones_superadas"])
    return salida


def _fecha(valor) -> date | None:
    if isinstance(valor, date):
        return valor
    if isinstance(valor, str) and valor.strip():
        try:
            return date.fromisoformat(valor[:10])
        except ValueError:
            return None
    return None
