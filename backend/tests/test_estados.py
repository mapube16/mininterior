"""La máquina de estados es la que hace cumplir el retorno único y el orden del flujo."""

import pytest

from app.estados import (
    Estado,
    TERMINALES,
    TransicionInvalida,
    es_retorno_interno,
    exigir_transicion,
    puede_transicionar,
    transiciones_validas,
)


def test_recorrido_completo_del_caso():
    # El camino feliz del escenario A: radicar y llegar a cerrado.
    camino = [
        Estado.RECIBIDO, Estado.RADICADO, Estado.CLASIFICADO, Estado.ASIGNADO,
        Estado.EN_ANALISIS, Estado.PROYECTADO, Estado.EN_PRE_REVISION,
        Estado.EN_REVISION, Estado.APROBADO, Estado.FIRMADO,
        Estado.NOTIFICADO, Estado.CERRADO_FAVORABLE,
    ]
    for actual, destino in zip(camino, camino[1:]):
        exigir_transicion(actual, destino)


def test_no_se_pueden_saltar_etapas():
    # Radicar no lleva directo a firma: el caso pasa por todas las etapas.
    assert not puede_transicionar(Estado.RADICADO, Estado.FIRMADO)
    with pytest.raises(TransicionInvalida):
        exigir_transicion(Estado.RADICADO, Estado.FIRMADO)


def test_retorno_interno_solo_una_vez():
    # Sin retorno usado, la pre-revisión puede devolver al asesor.
    exigir_transicion(Estado.EN_PRE_REVISION, Estado.EN_ANALISIS, retorno_usado=False)

    # Una vez usado, ya no.
    with pytest.raises(TransicionInvalida, match="ya tuvo un retorno interno"):
        exigir_transicion(Estado.EN_PRE_REVISION, Estado.EN_ANALISIS, retorno_usado=True)


def test_el_revisor_tambien_agota_el_retorno():
    # La regla es del caso, no de la etapa: aplica igual desde revisión.
    exigir_transicion(Estado.EN_REVISION, Estado.EN_ANALISIS, retorno_usado=False)
    with pytest.raises(TransicionInvalida):
        exigir_transicion(Estado.EN_REVISION, Estado.EN_ANALISIS, retorno_usado=True)


def test_con_retorno_usado_el_caso_sigue_avanzando():
    # Agotar el retorno no bloquea el caso: sigue pudiendo aprobarse.
    destinos = transiciones_validas(Estado.EN_REVISION, retorno_usado=True)
    assert Estado.APROBADO in destinos
    assert Estado.EN_ANALISIS not in destinos


def test_los_terminales_no_admiten_nada():
    for terminal in TERMINALES:
        assert transiciones_validas(terminal) == set()
        with pytest.raises(TransicionInvalida, match="terminal"):
            exigir_transicion(terminal, Estado.EN_ANALISIS)


def test_traslado_desde_cualquier_estado():
    # La falta de competencia puede detectarse en cualquier momento (§6.2).
    for origen in (Estado.RADICADO, Estado.EN_ANALISIS, Estado.EN_REVISION):
        exigir_transicion(origen, Estado.TRASLADADO)


def test_requerimiento_al_ciudadano_y_desistimiento():
    exigir_transicion(Estado.EN_ANALISIS, Estado.REQUERIMIENTO_CIUDADANO)
    # Si responde, vuelve a análisis; si vence el plazo, desiste.
    exigir_transicion(Estado.REQUERIMIENTO_CIUDADANO, Estado.EN_ANALISIS)
    exigir_transicion(Estado.REQUERIMIENTO_CIUDADANO, Estado.DESISTIDO)


def test_pendiente_radicacion_cuando_falla_el_documental():
    # §6 y §9: si ControlDoc no responde, el caso espera y luego se firma.
    exigir_transicion(Estado.APROBADO, Estado.PENDIENTE_RADICACION)
    exigir_transicion(Estado.PENDIENTE_RADICACION, Estado.FIRMADO)


def test_identifica_el_retorno_interno():
    assert es_retorno_interno(Estado.EN_PRE_REVISION, Estado.EN_ANALISIS)
    assert es_retorno_interno(Estado.EN_REVISION, Estado.EN_ANALISIS)
    # Volver de un requerimiento no es retorno interno: lo movió el ciudadano.
    assert not es_retorno_interno(Estado.REQUERIMIENTO_CIUDADANO, Estado.EN_ANALISIS)
    # Avanzar nunca es retorno.
    assert not es_retorno_interno(Estado.EN_REVISION, Estado.APROBADO)
