"""Datos iniciales, todos ficticios (§10 y §13.9).

El extracto real trae cédulas y teléfonos de ciudadanos en cuerpos de correos, así
que no se usa como semilla. Nombres de comunidades, personas y documentos son
inventados; los municipios sí son reales, y las coordenadas son del centroide del
municipio, nunca de la comunidad.

Cubre los tres escenarios de §12: caso limpio, caso con hallazgo y ruta especial.
"""

from __future__ import annotations

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from .modelos import (
    Comunidad,
    EstadoRegistro,
    Representante,
    Rol,
    TipoComunidad,
    TipoTramite,
    Usuario,
)
from .seguridad import hashear

CLAVE_DEMO = "demo1234"  # solo para la demostración

TIPOS = [
    {
        "codigo": "representante",
        "nombre": "Cambio de representante legal",
        "nombre_ciudadano": "Cambió nuestro representante legal",
        "categoria_interna": "Registro/actualización de consejos comunitarios",
        "termino_dias_habiles": 15,
        "campos_requeridos": ["representante_nombre", "representante_documento", "fecha_acta"],
        "documentos_requeridos": ["Acta de asamblea", "Documento de identidad del representante"],
    },
    {
        "codigo": "junta",
        "nombre": "Registro de nueva junta directiva",
        "nombre_ciudadano": "Elegimos una nueva junta directiva",
        "categoria_interna": "Registro/actualización de consejos comunitarios",
        "termino_dias_habiles": 15,
        "campos_requeridos": ["fecha_acta", "junta_integrantes"],
        "documentos_requeridos": ["Acta de asamblea", "Listado de la junta"],
    },
    {
        "codigo": "censo",
        "nombre": "Actualización del censo de integrantes",
        "nombre_ciudadano": "Actualizar cuántos somos",
        "categoria_interna": "Registro/actualización de consejos comunitarios",
        "termino_dias_habiles": 20,
        "campos_requeridos": ["fecha_censo", "censo_total", "censo_hombres", "censo_mujeres"],
        "documentos_requeridos": ["Listado censal"],
    },
    {
        "codigo": "linderos",
        "nombre": "Actualización de linderos del territorio",
        "nombre_ciudadano": "Cambiaron los linderos de nuestro territorio",
        "categoria_interna": "Registro/actualización de consejos comunitarios",
        "termino_dias_habiles": 30,
        "campos_requeridos": ["fecha_acta", "descripcion_linderos"],
        "documentos_requeridos": ["Acta de asamblea", "Plano o descripción técnica"],
    },
]

# Municipios reales; coordenadas del centroide municipal (§10).
COMUNIDADES = [
    ("Consejo Comunitario Guapi Abajo Unidos", TipoComunidad.CONSEJO_COMUNITARIO, "Guapi", "Cauca", EstadoRegistro.EN_ACTUALIZACION, 2.5694, -77.8869, "Resolución 2210 de 2005", date(2005, 3, 14), date(2024, 2, 2)),
    ("Consejo Comunitario del Río Naya", TipoComunidad.CONSEJO_COMUNITARIO, "Buenaventura", "Valle del Cauca", EstadoRegistro.EN_ACTUALIZACION, 3.8801, -77.0312, "Resolución 1180 de 2008", date(2008, 6, 10), date(2023, 9, 1)),
    ("Consejo Comunitario del Bajo Baudó", TipoComunidad.CONSEJO_COMUNITARIO, "Bajo Baudó", "Chocó", EstadoRegistro.VIGENTE, 4.95, -77.36, "Resolución 0904 de 2006", date(2006, 2, 20), date(2022, 11, 15)),
    ("Consejo Comunitario Río Barbacoas Alto", TipoComunidad.CONSEJO_COMUNITARIO, "Barbacoas", "Nariño", EstadoRegistro.VIGENTE, 1.6821, -78.15, "Resolución 3312 de 2007", date(2007, 8, 3), date(2023, 4, 12)),
    ("Consejo Comunitario Manglares de Tumaco Sur", TipoComunidad.CONSEJO_COMUNITARIO, "Tumaco", "Nariño", EstadoRegistro.DESACTUALIZADO, 1.7986, -78.7822, "Resolución 1502 de 2004", date(2004, 5, 18), date(2019, 7, 30)),
    ("Organización de Base Manos de Palenque", TipoComunidad.ORGANIZACION_BASE, "Mahates", "Bolívar", EstadoRegistro.VIGENTE, 10.2333, -75.1889, "Resolución 2740 de 2012", date(2012, 9, 5), date(2024, 1, 20)),
    ("Organización de Base Mujeres del Atrato", TipoComunidad.ORGANIZACION_BASE, "Quibdó", "Chocó", EstadoRegistro.VIGENTE, 5.6947, -76.6611, "Resolución 3090 de 2015", date(2015, 3, 11), date(2023, 12, 4)),
    ("Forma y expresión organizativa Tambores de Buenaventura", TipoComunidad.FORMA_EXPRESION, "Buenaventura", "Valle del Cauca", EstadoRegistro.VIGENTE, 3.8801, -77.0312, "Resolución 4410 de 2018", date(2018, 10, 22), date(2024, 5, 9)),
    ("Consejo Comunitario Timbiquí Costa Adentro", TipoComunidad.CONSEJO_COMUNITARIO, "Timbiquí", "Cauca", EstadoRegistro.VIGENTE, 2.7719, -77.6656, "Resolución 1998 de 2009", date(2009, 7, 14), date(2023, 2, 27)),
    ("Organización de Base Raizal Old Providence Roots", TipoComunidad.ORGANIZACION_BASE, "San Andrés", "Archipiélago de San Andrés", EstadoRegistro.VIGENTE, 12.5847, -81.7006, "Resolución 0755 de 2016", date(2016, 4, 8), date(2024, 3, 19)),
]

# Un usuario puede tener varios roles: no se duplican cuentas (§7).
USUARIOS = [
    ("Sandra Molano", "sandra.molano@mininterior.gov.co", [Rol.CLASIFICADOR], None),
    ("Marta Rincón", "marta.rincon@mininterior.gov.co", [Rol.MESA, Rol.COORDINADOR], None),
    ("Daniel Perea", "daniel.perea@mininterior.gov.co", [Rol.ASESOR], "Cauca"),
    ("María Zapata", "maria.zapata@mininterior.gov.co", [Rol.ASESOR], "Nariño"),
    ("Carlos Rentería", "carlos.renteria@mininterior.gov.co", [Rol.ASESOR], "Chocó"),
    ("Elena Vargas", "elena.vargas@mininterior.gov.co", [Rol.REVISOR, Rol.FIRMANTE], None),
    ("Jorge Ibarra", "jorge.ibarra@mininterior.gov.co", [Rol.VENTANILLA], None),
    ("Lucía Ospina", "lucia.ospina@mininterior.gov.co", [Rol.ADMIN_FUNCIONAL, Rol.ADMIN_TECNICO], None),
    ("Rosalba Mosquera", "rosalba.mosquera@correo.com", [Rol.CIUDADANO], None),
]

# Representantes vigentes. Los documentos son inventados.
REPRESENTANTES = [
    ("Consejo Comunitario Guapi Abajo Unidos", "Aurelio Grueso Caicedo", "10610001", date(2019, 5, 12), "Resolución 2890 de 2019"),
    ("Consejo Comunitario del Río Naya", "Aníbal Angulo Caicedo", "10610002", date(2021, 3, 8), "Resolución 3150 de 2021"),
    ("Consejo Comunitario del Bajo Baudó", "Édison Mosquera Palacios", "10610003", date(2020, 8, 17), "Resolución 2990 de 2020"),
    ("Consejo Comunitario Manglares de Tumaco Sur", "Yolanda Quiñones", "10610004", date(2018, 2, 26), "Resolución 2610 de 2018"),
]


def sembrar(db: Session) -> dict:
    """Idempotente: si ya hay datos, no los duplica."""
    if db.execute(select(TipoTramite)).scalars().first():
        return {"creado": False, "motivo": "La base ya tiene datos."}

    for t in TIPOS:
        db.add(TipoTramite(**t, vigente_desde=date(2026, 1, 1), aprobado_por="Dirección NARP"))

    comunidades: dict[str, Comunidad] = {}
    for nombre, tipo, mun, dep, estado, lat, lng, res, inicial, ultima in COMUNIDADES:
        c = Comunidad(
            nombre_oficial=nombre, tipo=tipo, municipio=mun, departamento=dep,
            estado_registro=estado, lat=lat, lng=lng, resolucion_vigente=res,
            fecha_registro_inicial=inicial, fecha_ultima_actualizacion=ultima,
        )
        db.add(c)
        comunidades[nombre] = c
    db.flush()

    for nombre_com, nombre, doc, desde, acto in REPRESENTANTES:
        db.add(Representante(
            comunidad_id=comunidades[nombre_com].id, nombre=nombre,
            numero_documento=doc, vigente_desde=desde, acto_administrativo=acto,
        ))

    clave = hashear(CLAVE_DEMO)
    for nombre, correo, roles, territorio in USUARIOS:
        db.add(Usuario(
            nombre=nombre, correo=correo, clave_hash=clave,
            roles=[r.value for r in roles], territorio=territorio,
        ))

    db.commit()
    return {
        "creado": True,
        "tipos_tramite": len(TIPOS),
        "comunidades": len(COMUNIDADES),
        "usuarios": len(USUARIOS),
        "clave_demo": CLAVE_DEMO,
    }


if __name__ == "__main__":
    from .db import Sesion, crear_tablas

    crear_tablas()
    with Sesion() as s:
        print(sembrar(s))
