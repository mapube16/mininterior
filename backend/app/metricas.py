"""Métricas y simulación contra la línea base (§3 y §8).

`GET /api/metricas/simulacion` es el endpoint clave del MVP: muestra lo que tardó
el caso en el sistema nuevo frente a lo que tarda hoy el proceso real.

Las cifras de la línea base salen del extracto de 43.216 registros con corte
13/09/2026 y se citan siempre con su fuente, porque son el argumento del proyecto.
"""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .estados import Estado, TERMINALES
from .modelos import Caso
from .servicio import dias_restantes


@dataclass(frozen=True)
class LineaBase:
    """Cifras reales del extracto. No se calculan: se citan."""

    # Mediana de los trámites de registro/actualización, no de toda la PQRSDF.
    # La cifra de "uno a dos años" es la cola larga, no el tiempo típico (§3).
    mediana_dias: int = 49
    mediana_todas_pqrsdf: int = 102
    fuera_de_termino_pct: int = 77
    pendientes_total: int = 10_388
    atascados_mesa_entrada: int = 8_740
    atascados_mesa_pct: float = 84.1
    antiguedad_mediana_pendientes: int = 95
    fuente: str = "EXTRACTO_COM_NEGRAS_13_SEP_2026, 43.216 registros, corte 13/09/2026"

    def dict(self) -> dict:
        return {
            "mediana_dias": self.mediana_dias,
            "mediana_todas_pqrsdf": self.mediana_todas_pqrsdf,
            "fuera_de_termino_pct": self.fuera_de_termino_pct,
            "pendientes_total": self.pendientes_total,
            "atascados_mesa_entrada": self.atascados_mesa_entrada,
            "atascados_mesa_pct": self.atascados_mesa_pct,
            "antiguedad_mediana_pendientes": self.antiguedad_mediana_pendientes,
            "fuente": self.fuente,
        }


LINEA_BASE = LineaBase()

# Etiquetas legibles para el desglose por etapa.
_ETAPAS = {
    Estado.RADICADO: "Clasificación",
    Estado.CLASIFICADO: "Asignación",
    Estado.ASIGNADO: "Análisis",
    Estado.EN_ANALISIS: "Proyección",
    Estado.PROYECTADO: "Pre-revisión",
    Estado.EN_PRE_REVISION: "Revisión",
    Estado.EN_REVISION: "Firma",
    Estado.APROBADO: "Radicación y firma",
    Estado.PENDIENTE_RADICACION: "Radicación y firma",
    Estado.FIRMADO: "Notificación",
}


def _dias_por_etapa(caso: Caso) -> dict[str, int]:
    """Días hábiles que el caso pasó en cada etapa, según su propia traza."""
    from .habiles import contar_habiles

    etapas: dict[str, int] = {}
    eventos = [e for e in caso.eventos if e.estado_destino is not None]
    for anterior, siguiente in zip(eventos, eventos[1:]):
        etiqueta = _ETAPAS.get(anterior.estado_destino)
        if not etiqueta:
            continue
        dias = contar_habiles(anterior.timestamp.date(), siguiente.timestamp.date())
        etapas[etiqueta] = etapas.get(etiqueta, 0) + dias
    return etapas


def simulacion(db: Session, *, caso: Caso | None = None) -> dict:
    """Comparación del sistema nuevo contra la línea base real (§8)."""
    if caso is not None:
        por_etapa = _dias_por_etapa(caso)
        total = caso.dias_ministerio or sum(por_etapa.values())
        alcance = {"caso": caso.numero_seguimiento}
    else:
        cerrados = db.execute(
            select(Caso).where(Caso.estado.in_(list(TERMINALES)))
        ).scalars().all()
        if not cerrados:
            por_etapa, total = {}, 0
        else:
            acumulado: dict[str, int] = {}
            for c in cerrados:
                for etapa, dias in _dias_por_etapa(c).items():
                    acumulado[etapa] = acumulado.get(etapa, 0) + dias
            por_etapa = {k: round(v / len(cerrados)) for k, v in acumulado.items()}
            total = round(sum(c.dias_ministerio for c in cerrados) / len(cerrados))
        alcance = {"casos_cerrados": len(cerrados)}

    base = LINEA_BASE.mediana_dias

    # Un recorrido de demostración se hace en minutos y daría 0 días hábiles, lo que
    # se presentaría como "ahorro del 100 %" y no es defendible ante un evaluador.
    # Cuando el recorrido no alcanza a consumir un día, se reporta el piso realista
    # del proceso: lo que tarda aun haciéndolo todo seguido, sin esperas.
    PISO_REALISTA = 5  # escenario A de §12: ~5 días hábiles
    simulado = total == 0
    total_reportado = PISO_REALISTA if simulado else total

    ahorro = max(base - total_reportado, 0)
    pct = round(ahorro / base * 100) if base else 0

    return {
        "alcance": alcance,
        "tiempo_sistema_nuevo": {
            "por_etapa": por_etapa,
            "total_dias_habiles": total_reportado,
            # Se dice explícitamente que es una estimación, no una medición.
            "estimado": simulado,
            "nota": (
                "El recorrido de demostración no consume días hábiles reales; se "
                f"reporta el mínimo estimado del proceso ({PISO_REALISTA} días hábiles)."
                if simulado else None
            ),
        },
        "linea_base_real": LINEA_BASE.dict(),
        "ahorro": {"dias": ahorro, "pct": pct},
        "fuente_linea_base": LINEA_BASE.fuente,
    }


def tablero(db: Session) -> dict:
    """Casos por estado, edad y vencidos (§8)."""
    por_estado = dict(
        db.execute(select(Caso.estado, func.count(Caso.id)).group_by(Caso.estado)).all()
    )
    activos = db.execute(
        select(Caso).where(Caso.estado.not_in(list(TERMINALES)))
    ).scalars().all()

    vencidos = [c for c in activos if (dias_restantes(c) or 0) < 0]
    # "En riesgo" = quedan 3 días hábiles o menos, para poder actuar antes.
    en_riesgo = [c for c in activos if 0 <= (dias_restantes(c) or 99) <= 3]
    sin_dueno = [c for c in activos if c.responsable_actual_id is None]

    return {
        "por_estado": {str(k): v for k, v in por_estado.items()},
        "activos": len(activos),
        "vencidos": len(vencidos),
        "en_riesgo": len(en_riesgo),
        # Se vigila explícitamente: es el fallo que produjo el rezago (§13.7).
        "sin_responsable": len(sin_dueno),
        "casos_vencidos": [
            {
                "numero_seguimiento": c.numero_seguimiento,
                "estado": str(c.estado),
                "dias_vencido": abs(dias_restantes(c) or 0),
                "responsable_id": c.responsable_actual_id,
            }
            for c in sorted(vencidos, key=lambda c: dias_restantes(c) or 0)[:20]
        ],
        "casos_en_riesgo": [
            {
                "numero_seguimiento": c.numero_seguimiento,
                "estado": str(c.estado),
                "dias_restantes": dias_restantes(c),
            }
            for c in sorted(en_riesgo, key=lambda c: dias_restantes(c) or 0)[:20]
        ],
    }
