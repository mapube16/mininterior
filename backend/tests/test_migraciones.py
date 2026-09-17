"""Las columnas nuevas deben llegar a una base que ya existe.

Sin esto, desplegar un modelo con un campo nuevo deja la base atrás y la API
falla con "column does not exist", que es exactamente lo que pasó en producción.
"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.pool import StaticPool

from app.migraciones import COLUMNAS, aplicar
from app.modelos import Base


def _motor():
    return create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )


def test_anade_la_columna_que_falta():
    motor = _motor()
    # Simula la base vieja: una tabla `caso` sin la columna que el modelo ya declara.
    with motor.begin() as con:
        con.execute(text("CREATE TABLE caso (id VARCHAR(36) PRIMARY KEY, numero_seguimiento VARCHAR(60))"))
    assert "solicitante_id" not in {c["name"] for c in inspect(motor).get_columns("caso")}

    assert aplicar(motor) == ["caso.solicitante_id"]
    assert "solicitante_id" in {c["name"] for c in inspect(motor).get_columns("caso")}


def test_es_idempotente():
    motor = _motor()
    Base.metadata.create_all(motor)
    # La columna ya está: no hay nada que aplicar y no debe fallar.
    assert aplicar(motor) == []
    assert aplicar(motor) == []


def test_solo_columnas_aditivas():
    # Una migración que borre o reescriba datos no puede vivir aquí.
    for tabla, columna, tipo in COLUMNAS:
        assert tabla and columna and tipo
        assert "DROP" not in tipo.upper()
