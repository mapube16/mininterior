"""Base en memoria y datos mínimos para las pruebas."""

from datetime import date

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.modelos import (
    Base,
    Caso,
    Comunidad,
    EstadoRegistro,
    Representante,
    TipoComunidad,
    TipoTramite,
    Usuario,
)
from app.servicio import numero_seguimiento


@pytest.fixture
def db():
    motor = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(motor)
    sesion = sessionmaker(bind=motor, expire_on_commit=False)()
    try:
        yield sesion
    finally:
        sesion.close()


@pytest.fixture
def tipo(db) -> TipoTramite:
    t = TipoTramite(
        codigo="representante",
        nombre="Cambio de representante legal",
        nombre_ciudadano="Cambió nuestro representante legal",
        termino_dias_habiles=15,
        campos_requeridos=["representante_nombre", "representante_documento", "fecha_acta"],
        documentos_requeridos=["Acta de asamblea", "Documento de identidad"],
    )
    db.add(t)
    db.flush()
    return t


@pytest.fixture
def comunidad(db) -> Comunidad:
    c = Comunidad(
        nombre_oficial="Consejo Comunitario Guapi Abajo Unidos",
        tipo=TipoComunidad.CONSEJO_COMUNITARIO,
        municipio="Guapi",
        departamento="Cauca",
        estado_registro=EstadoRegistro.EN_ACTUALIZACION,
        fecha_ultima_actualizacion=date(2024, 2, 2),
        lat=2.5694,
        lng=-77.8869,
    )
    db.add(c)
    db.flush()
    return c


@pytest.fixture
def asesor(db) -> Usuario:
    u = Usuario(
        nombre="Daniel Perea",
        correo="daniel.perea@mininterior.gov.co",
        clave_hash="x",
        roles=["asesor"],
        territorio="Cauca",
        wip_maximo=8,
    )
    db.add(u)
    db.flush()
    return u


@pytest.fixture
def caso(db, tipo, comunidad) -> Caso:
    c = Caso(
        numero_seguimiento=numero_seguimiento(db),
        tipo_tramite_id=tipo.id,
        comunidad_id=comunidad.id,
        datos={
            "representante_nombre": "Rosalba Mosquera",
            "representante_documento": "1061700000",
            "fecha_acta": "2026-08-01",
        },
    )
    db.add(c)
    db.flush()
    return c
