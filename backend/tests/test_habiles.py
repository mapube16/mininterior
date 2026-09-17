"""Los festivos se contrastan con fechas reales del calendario colombiano.

Si esto falla, todos los términos del sistema vencen en la fecha equivocada.
"""

from datetime import date

from app.habiles import (
    contar_habiles,
    domingo_pascua,
    es_habil,
    festivos,
    sumar_habiles,
)


def test_pascua_conocida():
    # Fechas verificables del calendario litúrgico.
    assert domingo_pascua(2024) == date(2024, 3, 31)
    assert domingo_pascua(2025) == date(2025, 4, 20)
    assert domingo_pascua(2026) == date(2026, 4, 5)


def test_colombia_tiene_18_festivos():
    # Colombia tiene 18 festivos al año, pero dos pueden caer en la misma fecha
    # tras el traslado y entonces hay 17 fechas distintas: en 2025 San Pedro
    # (domingo 29 de junio -> lunes 30) coincide con el Sagrado Corazón.
    for anio in (2024, 2025, 2026):
        assert len(festivos(anio)) in (17, 18), anio
    assert len(festivos(2025)) == 17
    assert date(2025, 6, 30) in festivos(2025)


def test_festivos_reales_de_2026():
    f = festivos(2026)
    # Fijos.
    assert date(2026, 1, 1) in f
    assert date(2026, 7, 20) in f
    assert date(2026, 12, 25) in f
    # Ley Emiliani: Reyes es el 6 de enero (martes) -> se corre al lunes 12.
    assert date(2026, 1, 12) in f
    assert date(2026, 1, 6) not in f
    # San José: 19 de marzo (jueves) -> lunes 23.
    assert date(2026, 3, 23) in f
    # Semana Santa de 2026: Pascua el 5 de abril.
    assert date(2026, 4, 2) in f  # Jueves Santo
    assert date(2026, 4, 3) in f  # Viernes Santo


def test_festivo_que_ya_cae_lunes_no_se_mueve():
    # En 2027 Reyes (6 de enero) cae miércoles; en 2025 cae lunes y se queda.
    assert date(2025, 1, 6).weekday() == 0
    assert date(2025, 1, 6) in festivos(2025)


def test_es_habil():
    assert es_habil(date(2026, 9, 16))       # miércoles corriente
    assert not es_habil(date(2026, 9, 19))   # sábado
    assert not es_habil(date(2026, 9, 20))   # domingo
    assert not es_habil(date(2026, 12, 25))  # Navidad


def test_sumar_habiles_salta_fin_de_semana():
    # Viernes 18 de septiembre de 2026 + 1 hábil = lunes 21.
    assert date(2026, 9, 18).weekday() == 4
    assert sumar_habiles(date(2026, 9, 18), 1) == date(2026, 9, 21)


def test_sumar_habiles_salta_festivo():
    # Jueves 31 de diciembre de 2026 + 1 hábil salta el 1 de enero (festivo)
    # y el fin de semana: cae el lunes 4 de enero de 2027.
    assert sumar_habiles(date(2026, 12, 31), 1) == date(2027, 1, 4)


def test_termino_de_15_dias_del_tramite():
    # El término publicado en GOV.CO es de 15 días hábiles (§2 del contexto).
    # Radicado el miércoles 12 de agosto de 2026: entre medias cae la Asunción
    # (sábado 15 -> lunes 17), así que vence el jueves 3 de septiembre, no el 2.
    assert date(2026, 8, 17) in festivos(2026)
    vence = sumar_habiles(date(2026, 8, 12), 15)
    assert vence == date(2026, 9, 3)
    assert es_habil(vence)


def test_sumar_cero_es_el_mismo_dia():
    assert sumar_habiles(date(2026, 9, 16), 0) == date(2026, 9, 16)


def test_contar_habiles():
    # De lunes a viernes de la misma semana hay 4 días hábiles.
    assert contar_habiles(date(2026, 9, 14), date(2026, 9, 18)) == 4
    # Un fin de semana no suma nada.
    assert contar_habiles(date(2026, 9, 18), date(2026, 9, 20)) == 0
    # El reloj no corre hacia atrás.
    assert contar_habiles(date(2026, 9, 18), date(2026, 9, 14)) == 0


def test_ida_y_vuelta():
    # Sumar N hábiles y contarlos de vuelta da N.
    for n in (1, 5, 15, 30):
        inicio = date(2026, 8, 12)
        assert contar_habiles(inicio, sumar_habiles(inicio, n)) == n
