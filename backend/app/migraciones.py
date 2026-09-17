"""Ajustes de esquema al arrancar.

`create_all` crea las tablas que faltan pero **no** añade columnas a una tabla que
ya existe: al desplegar un modelo con un campo nuevo, la base queda atrás y la API
revienta con "column does not exist".

Alembic es la respuesta completa y está en las dependencias, pero mientras el MVP
itera rápido esto aplica los cambios aditivos que faltan, sin tocar datos. Cada
ajuste es idempotente: si la columna ya está, no hace nada.

Cuando el esquema se estabilice, esto se reemplaza por migraciones de Alembic.
"""

from __future__ import annotations

import logging

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

log = logging.getLogger(__name__)

# (tabla, columna, definición SQL). Solo cambios ADITIVOS: nada que borre o
# reescriba datos existentes puede ir aquí.
COLUMNAS = [
    ("caso", "solicitante_id", "VARCHAR(36)"),
]


def aplicar(motor: Engine) -> list[str]:
    """Añade las columnas que falten. Devuelve lo que aplicó."""
    aplicados: list[str] = []
    inspector = inspect(motor)

    for tabla, columna, tipo in COLUMNAS:
        if tabla not in inspector.get_table_names():
            continue
        existentes = {c["name"] for c in inspector.get_columns(tabla)}
        if columna in existentes:
            continue

        with motor.begin() as con:
            con.execute(text(f"ALTER TABLE {tabla} ADD COLUMN {columna} {tipo}"))
        aplicados.append(f"{tabla}.{columna}")
        log.info("Columna añadida: %s.%s", tabla, columna)

    return aplicados
