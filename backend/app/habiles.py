"""Días hábiles colombianos.

Los términos del trámite se cuentan en días hábiles (§6.5 del contexto), así que
esto define cuándo vence un caso: si está mal, todo vencimiento del sistema está mal.

Colombia tiene tres clases de festivo:
  - fijos: siempre la misma fecha;
  - trasladables (Ley 51 de 1983, "Ley Emiliani"): se corren al lunes siguiente;
  - móviles: dependen de la Pascua, y algunos además se trasladan.

Se calculan, no se listan, porque una tabla escrita a mano caduca cada año.
"""

from __future__ import annotations

from datetime import date, timedelta
from functools import lru_cache

# (mes, día) de los festivos que no se mueven nunca.
_FIJOS = [
    (1, 1),    # Año Nuevo
    (5, 1),    # Día del Trabajo
    (7, 20),   # Independencia
    (8, 7),    # Batalla de Boyacá
    (12, 8),   # Inmaculada Concepción
    (12, 25),  # Navidad
]

# (mes, día) de los que se trasladan al lunes siguiente si no caen en lunes.
_TRASLADABLES = [
    (1, 6),    # Reyes Magos
    (3, 19),   # San José
    (6, 29),   # San Pedro y San Pablo
    (8, 15),   # Asunción
    (10, 12),  # Día de la Raza
    (11, 1),   # Todos los Santos
    (11, 11),  # Independencia de Cartagena
]

# Días de diferencia respecto al Domingo de Pascua, y si el festivo se traslada.
_PASCUA = [
    (-3, False),  # Jueves Santo
    (-2, False),  # Viernes Santo
    (43, True),   # Ascensión
    (64, True),   # Corpus Christi
    (71, True),   # Sagrado Corazón
]


def domingo_pascua(anio: int) -> date:
    """Domingo de Pascua por el algoritmo de Butcher (calendario gregoriano)."""
    a = anio % 19
    b, c = divmod(anio, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    lun = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * lun) // 451
    mes, dia = divmod(h + lun - 7 * m + 114, 31)
    return date(anio, mes, dia + 1)


def _al_lunes(d: date) -> date:
    """Ley Emiliani: si no cae lunes, se corre al lunes siguiente."""
    return d + timedelta(days=(7 - d.weekday()) % 7)


@lru_cache(maxsize=32)
def festivos(anio: int) -> frozenset[date]:
    """Festivos nacionales de un año. Cacheado: se consulta en cada cálculo de término."""
    dias = {date(anio, m, d) for m, d in _FIJOS}
    dias |= {_al_lunes(date(anio, m, d)) for m, d in _TRASLADABLES}

    pascua = domingo_pascua(anio)
    for offset, traslada in _PASCUA:
        f = pascua + timedelta(days=offset)
        dias.add(_al_lunes(f) if traslada else f)

    return frozenset(dias)


def es_habil(d: date) -> bool:
    """Hábil = de lunes a viernes y no festivo nacional."""
    return d.weekday() < 5 and d not in festivos(d.year)


def sumar_habiles(inicio: date, dias: int) -> date:
    """Fecha resultante de sumar `dias` hábiles a `inicio`.

    El día de inicio no cuenta: radicar un lunes con término de 1 día vence el martes.
    Con `dias=0` devuelve el propio día de inicio.
    """
    if dias < 0:
        raise ValueError("El término no puede ser negativo")
    d = inicio
    restantes = dias
    while restantes > 0:
        d += timedelta(days=1)
        if es_habil(d):
            restantes -= 1
    return d


def contar_habiles(desde: date, hasta: date) -> int:
    """Días hábiles transcurridos entre dos fechas, sin contar `desde` y contando `hasta`.

    Si `hasta` es anterior a `desde` devuelve 0: un reloj no corre hacia atrás.
    """
    if hasta <= desde:
        return 0
    total = 0
    d = desde
    while d < hasta:
        d += timedelta(days=1)
        if es_habil(d):
            total += 1
    return total
