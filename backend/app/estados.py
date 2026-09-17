"""Máquina de estados del caso (§5 del contexto).

Las transiciones se declaran aquí y se validan en un solo sitio: si una transición
no está en el mapa, no ocurre. Es lo que impide que un caso salte etapas o que
la pre-revisión devuelva un caso dos veces.
"""

from __future__ import annotations

from enum import StrEnum


class Estado(StrEnum):
    RECIBIDO = "RECIBIDO"
    RADICADO = "RADICADO"
    CLASIFICADO = "CLASIFICADO"
    ASIGNADO = "ASIGNADO"
    EN_ANALISIS = "EN_ANALISIS"
    PROYECTADO = "PROYECTADO"
    EN_PRE_REVISION = "EN_PRE_REVISION"
    EN_REVISION = "EN_REVISION"
    APROBADO = "APROBADO"
    PENDIENTE_RADICACION = "PENDIENTE_RADICACION"
    FIRMADO = "FIRMADO"
    NOTIFICADO = "NOTIFICADO"
    REQUERIMIENTO_CIUDADANO = "REQUERIMIENTO_CIUDADANO"
    # Terminales
    CERRADO = "CERRADO"
    CERRADO_FAVORABLE = "CERRADO_FAVORABLE"
    CERRADO_DESFAVORABLE = "CERRADO_DESFAVORABLE"
    DESISTIDO = "DESISTIDO"
    ARCHIVADO = "ARCHIVADO"
    TRASLADADO = "TRASLADADO"


TERMINALES: frozenset[Estado] = frozenset({
    Estado.CERRADO,
    Estado.CERRADO_FAVORABLE,
    Estado.CERRADO_DESFAVORABLE,
    Estado.DESISTIDO,
    Estado.ARCHIVADO,
    Estado.TRASLADADO,
})

# Flujo principal. Las ramas se manejan aparte porque tienen condiciones propias.
_FLUJO: dict[Estado, set[Estado]] = {
    Estado.RECIBIDO: {Estado.RADICADO},
    Estado.RADICADO: {Estado.CLASIFICADO},
    Estado.CLASIFICADO: {Estado.ASIGNADO},
    Estado.ASIGNADO: {Estado.EN_ANALISIS},
    Estado.EN_ANALISIS: {Estado.PROYECTADO, Estado.REQUERIMIENTO_CIUDADANO},
    Estado.PROYECTADO: {Estado.EN_PRE_REVISION},
    # El retorno al asesor es condicional (retorno_usado); ver puede_transicionar.
    Estado.EN_PRE_REVISION: {Estado.EN_REVISION, Estado.EN_ANALISIS},
    Estado.EN_REVISION: {Estado.APROBADO, Estado.EN_ANALISIS},
    Estado.APROBADO: {Estado.PENDIENTE_RADICACION, Estado.FIRMADO},
    Estado.PENDIENTE_RADICACION: {Estado.FIRMADO},
    Estado.FIRMADO: {Estado.NOTIFICADO},
    Estado.NOTIFICADO: {Estado.CERRADO, Estado.CERRADO_FAVORABLE},
    Estado.REQUERIMIENTO_CIUDADANO: {Estado.EN_ANALISIS, Estado.DESISTIDO},
}

# Un caso puede cerrarse por estado terminal desde cualquier estado no terminal:
# se traslada por falta de competencia, se archiva o se cierra desfavorable.
_CIERRES = {
    Estado.TRASLADADO,
    Estado.ARCHIVADO,
    Estado.CERRADO_DESFAVORABLE,
}


class TransicionInvalida(Exception):
    """La transición pedida no existe o no se cumple su condición."""


def transiciones_validas(actual: Estado, *, retorno_usado: bool = False) -> set[Estado]:
    """Estados a los que el caso puede pasar desde `actual`."""
    if actual in TERMINALES:
        return set()

    destinos = set(_FLUJO.get(actual, set())) | _CIERRES

    # Retorno interno único (§4.5): la pre-revisión y la revisión solo devuelven
    # al asesor si el caso no gastó ya su retorno.
    if retorno_usado:
        destinos.discard(Estado.EN_ANALISIS)

    return destinos


def puede_transicionar(actual: Estado, destino: Estado, *, retorno_usado: bool = False) -> bool:
    return destino in transiciones_validas(actual, retorno_usado=retorno_usado)


def exigir_transicion(actual: Estado, destino: Estado, *, retorno_usado: bool = False) -> None:
    """Valida la transición o explica por qué no procede."""
    if actual in TERMINALES:
        raise TransicionInvalida(
            f"El caso está en {actual}, que es un estado terminal, y no admite más cambios."
        )

    if puede_transicionar(actual, destino, retorno_usado=retorno_usado):
        return

    # Mensaje específico para el caso que más se va a intentar.
    if destino == Estado.EN_ANALISIS and retorno_usado:
        raise TransicionInvalida(
            "Este caso ya tuvo un retorno interno al asesor y solo se permite uno. "
            "Debe resolverse en revisión."
        )

    raise TransicionInvalida(f"No se puede pasar de {actual} a {destino}.")


def es_retorno_interno(actual: Estado, destino: Estado) -> bool:
    """Devolver al asesor desde pre-revisión o revisión.

    Importa por dos motivos (§4.5 y §13.5-6): gasta el retorno único, y no se le
    muestra al ciudadano ni reinicia el reloj.
    """
    return destino == Estado.EN_ANALISIS and actual in {
        Estado.EN_PRE_REVISION,
        Estado.EN_REVISION,
    }
