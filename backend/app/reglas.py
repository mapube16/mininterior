"""Validación en origen (§6.1).

Es la única compuerta que bloquea, y está ANTES de radicar: ahí todavía no corren
términos, así que devolverle algo al ciudadano no le cuesta tiempo legal a nadie.
Una vez radicado, el caso se resuelve; no se devuelve (§4.2).

Todas son determinísticas, sin IA, y la misma definición se expone al frontend
por /api/casos/validar para que cliente y servidor validen igual.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from .estados import TERMINALES
from .modelos import (
    Caso,
    Comunidad,
    EstadoRegistro,
    Representante,
    Severidad,
    TipoTramite,
)


@dataclass
class Incumplimiento:
    regla_id: str
    severidad: Severidad
    mensaje: str          # redactado para el ciudadano, en segunda persona
    campo: str | None = None

    def dict(self) -> dict:
        return {
            "regla_id": self.regla_id,
            "severidad": self.severidad.value,
            "mensaje": self.mensaje,
            "campo": self.campo,
        }


@dataclass
class Resultado:
    incumplimientos: list[Incumplimiento] = field(default_factory=list)

    @property
    def bloqueantes(self) -> list[Incumplimiento]:
        return [i for i in self.incumplimientos if i.severidad is Severidad.BLOQUEANTE]

    @property
    def puede_radicar(self) -> bool:
        return not self.bloqueantes

    def dict(self) -> dict:
        return {
            "puede_radicar": self.puede_radicar,
            "incumplimientos": [i.dict() for i in self.incumplimientos],
        }


def _falta(datos: dict, campo: str) -> bool:
    valor = datos.get(campo)
    return valor is None or (isinstance(valor, str) and not valor.strip())


def validar(
    db: Session,
    *,
    tipo: TipoTramite,
    comunidad: Comunidad | None,
    datos: dict,
    documentos: list[str],
    caso_id_excluir: str | None = None,
) -> Resultado:
    """Corre las siete reglas de §6.1 sobre una solicitud aún no radicada."""
    res = Resultado()
    add = res.incumplimientos.append

    # campos_completos
    for campo in tipo.campos_requeridos or []:
        nombre = campo if isinstance(campo, str) else campo.get("campo")
        etiqueta = nombre if isinstance(campo, str) else campo.get("etiqueta", nombre)
        if _falta(datos, nombre):
            add(Incumplimiento(
                "campos_completos", Severidad.BLOQUEANTE,
                f"Falta {etiqueta}.", nombre,
            ))

    # documentos_presentes
    faltantes = [d for d in (tipo.documentos_requeridos or []) if d not in documentos]
    for d in faltantes:
        add(Incumplimiento(
            "documentos_presentes", Severidad.BLOQUEANTE,
            f"Falta el documento: {d}.", "documentos",
        ))

    # fechas_coherentes
    fecha_acta = _fecha(datos.get("fecha_acta"))
    if fecha_acta:
        if fecha_acta > date.today():
            add(Incumplimiento(
                "fechas_coherentes", Severidad.BLOQUEANTE,
                "La fecha del acta no puede ser posterior a hoy.", "fecha_acta",
            ))
        elif comunidad and comunidad.fecha_ultima_actualizacion and fecha_acta < comunidad.fecha_ultima_actualizacion:
            add(Incumplimiento(
                "fechas_coherentes", Severidad.BLOQUEANTE,
                "La fecha del acta es anterior al último acto administrativo registrado "
                f"({comunidad.fecha_ultima_actualizacion:%d/%m/%Y}).",
                "fecha_acta",
            ))

    # comunidad_habilitada
    if comunidad and comunidad.estado_registro is EstadoRegistro.SUSPENDIDO:
        add(Incumplimiento(
            "comunidad_habilitada", Severidad.BLOQUEANTE,
            "El registro de esta comunidad está suspendido y no admite trámites. "
            "Llama al 01 8000 000 000 para saber qué sigue.",
        ))

    # representante_sin_conflicto: no puede estar vigente en otra comunidad (§5).
    doc = datos.get("representante_documento")
    if doc:
        otro = db.execute(
            select(Representante)
            .where(Representante.numero_documento == str(doc))
            .where(Representante.vigente_hasta.is_(None))
        ).scalars().first()
        if otro and (not comunidad or otro.comunidad_id != comunidad.id):
            add(Incumplimiento(
                "representante_sin_conflicto", Severidad.BLOQUEANTE,
                "La persona que proponen ya figura como representante legal vigente "
                "de otra comunidad registrada. Una persona no puede representar a dos.",
                "representante_documento",
            ))

    # sin_duplicado_abierto
    if comunidad:
        consulta = (
            select(Caso)
            .where(Caso.comunidad_id == comunidad.id)
            .where(Caso.tipo_tramite_id == tipo.id)
            .where(Caso.estado.not_in(list(TERMINALES)))
        )
        if caso_id_excluir:
            consulta = consulta.where(Caso.id != caso_id_excluir)
        abierto = db.execute(consulta).scalars().first()
        if abierto:
            add(Incumplimiento(
                "sin_duplicado_abierto", Severidad.BLOQUEANTE,
                f"Ya tienes una solicitud abierta de este mismo trámite "
                f"({abierto.numero_seguimiento}). Espera la respuesta antes de radicar otra.",
            ))

    # censo_consistente: los totales del listado tienen que cuadrar.
    total = datos.get("censo_total")
    if total is not None:
        partes = [datos.get("censo_hombres"), datos.get("censo_mujeres")]
        if all(p is not None for p in partes):
            suma = sum(int(p) for p in partes)
            if suma != int(total):
                add(Incumplimiento(
                    "censo_consistente", Severidad.BLOQUEANTE,
                    f"Los totales del censo no cuadran: {suma} personas sumadas "
                    f"frente a {total} declaradas.",
                    "censo_total",
                ))

    return res


def _fecha(valor) -> date | None:
    if isinstance(valor, date):
        return valor
    if isinstance(valor, str) and valor.strip():
        try:
            return date.fromisoformat(valor[:10])
        except ValueError:
            return None
    return None
