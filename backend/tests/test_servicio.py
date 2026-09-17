"""Relojes, retorno único, traza e idempotencia del radicado."""

from datetime import date, timedelta

import pytest

from app.estados import Estado, TransicionInvalida
from app.habiles import sumar_habiles
from app.modelos import Reloj
from app.servicio import (
    cambiar_reloj,
    dias_restantes,
    esta_vencido,
    mover,
    publicar_radicado,
    radicar,
)


def test_radicar_fija_el_termino(db, caso):
    radicar(db, caso)
    assert caso.estado is Estado.RADICADO
    assert caso.fecha_vencimiento == sumar_habiles(date.today(), 15)
    assert caso.reloj_activo is Reloj.MINISTERIO
    # El primer evento queda en la traza y el ciudadano puede verlo.
    assert caso.eventos[-1].estado_destino is Estado.RADICADO
    assert caso.eventos[-1].visible_ciudadano


def test_cada_estado_deja_responsable(db, caso):
    # Ningún caso puede quedar sin dueño (§13.7).
    radicar(db, caso)
    for destino in (Estado.CLASIFICADO, Estado.ASIGNADO, Estado.EN_ANALISIS):
        mover(db, caso, destino, motivo="prueba")
        assert caso.rol_responsable is not None, destino


def test_retorno_interno_una_sola_vez(db, caso, asesor):
    radicar(db, caso)
    for d in (Estado.CLASIFICADO, Estado.ASIGNADO, Estado.EN_ANALISIS,
              Estado.PROYECTADO, Estado.EN_PRE_REVISION):
        mover(db, caso, d, motivo="avanza")

    # Primer retorno: permitido.
    mover(db, caso, Estado.EN_ANALISIS, motivo="faltan datos")
    assert caso.retorno_usado is True

    # Segundo retorno: rechazado.
    mover(db, caso, Estado.PROYECTADO, motivo="reproyecta")
    mover(db, caso, Estado.EN_PRE_REVISION, motivo="vuelve a pre-revisión")
    with pytest.raises(TransicionInvalida, match="ya tuvo un retorno interno"):
        mover(db, caso, Estado.EN_ANALISIS, motivo="segundo intento")


def test_el_retorno_no_se_le_muestra_al_ciudadano(db, caso):
    radicar(db, caso)
    for d in (Estado.CLASIFICADO, Estado.ASIGNADO, Estado.EN_ANALISIS,
              Estado.PROYECTADO, Estado.EN_PRE_REVISION):
        mover(db, caso, d, motivo="avanza")
    mover(db, caso, Estado.EN_ANALISIS, motivo="devuelto al asesor")

    retorno = caso.eventos[-1]
    assert retorno.estado_destino is Estado.EN_ANALISIS
    assert retorno.visible_ciudadano is False  # §13.6


def test_el_retorno_no_reinicia_el_reloj(db, caso):
    radicar(db, caso)
    vencimiento = caso.fecha_vencimiento
    for d in (Estado.CLASIFICADO, Estado.ASIGNADO, Estado.EN_ANALISIS,
              Estado.PROYECTADO, Estado.EN_PRE_REVISION, Estado.EN_ANALISIS):
        mover(db, caso, d, motivo="x")
    # §13.5: el término sigue siendo el mismo.
    assert caso.fecha_vencimiento == vencimiento


def test_los_dos_relojes_van_separados(db, caso):
    radicar(db, caso)
    # Simula que pasaron días con el caso en manos del Ministerio.
    caso.reloj_desde = date.today() - timedelta(days=7)

    cambiar_reloj(caso, Reloj.CIUDADANO)
    assert caso.dias_ministerio > 0
    assert caso.dias_ciudadano == 0

    ministerio = caso.dias_ministerio
    caso.reloj_desde = date.today() - timedelta(days=7)
    cambiar_reloj(caso, Reloj.MINISTERIO)
    # Lo que corrió en manos del ciudadano no se le suma al Ministerio.
    assert caso.dias_ministerio == ministerio
    assert caso.dias_ciudadano > 0


def test_el_caso_terminal_detiene_el_reloj(db, caso):
    radicar(db, caso)
    mover(db, caso, Estado.TRASLADADO, motivo="no es competencia")
    assert caso.reloj_activo is Reloj.DETENIDO
    assert caso.responsable_actual_id is None
    assert dias_restantes(caso) is None


def test_dias_restantes_y_vencimiento(db, caso):
    radicar(db, caso)
    assert dias_restantes(caso) == 15
    assert not esta_vencido(caso)

    caso.fecha_vencimiento = date.today() - timedelta(days=10)
    assert dias_restantes(caso) < 0
    assert esta_vencido(caso)


def test_publicacion_del_radicado_es_idempotente(db, caso):
    radicar(db, caso)
    primera = publicar_radicado(db, caso, forzar_fallo=False)
    assert primera.estado == "publicado"
    radicado = primera.radicado_externo

    # Reintentar no puede generar un acto administrativo nuevo (§9).
    segunda = publicar_radicado(db, caso, forzar_fallo=False)
    assert segunda.radicado_externo == radicado
    assert segunda.intentos == 1  # no volvió a intentar: ya estaba publicado


def test_si_controldoc_falla_el_caso_queda_pendiente(db, caso):
    radicar(db, caso)
    pub = publicar_radicado(db, caso, forzar_fallo=True)
    assert pub.estado == "pendiente"
    assert pub.radicado_externo is None

    # Y al reintentar con el servicio arriba, se publica una sola vez.
    ok = publicar_radicado(db, caso, forzar_fallo=False)
    assert ok.estado == "publicado"
    assert ok.radicado_externo is not None
    assert ok.intentos == 2


def test_la_traza_distingue_sugerencia_de_decision(db, caso, asesor):
    # §4.8: cada evento registra qué propuso el sistema y qué decidió la persona.
    radicar(db, caso)
    mover(
        db, caso, Estado.CLASIFICADO,
        motivo="Clasificación confirmada",
        actor=asesor,
        sugerencia_ia={"categoria": "Cambio de representante legal", "origen": "preclasificador"},
        decision_humana={"categoria": "Cambio de representante legal", "confirmada": True},
    )
    ev = caso.eventos[-1]
    assert ev.sugerencia_ia["origen"] == "preclasificador"
    assert ev.decision_humana["confirmada"] is True
    assert ev.actor_nombre == "Daniel Perea"
