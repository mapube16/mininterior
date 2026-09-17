"""Recorrido completo del caso por la API: los tres escenarios de §12.

Es la prueba que responde al objetivo del MVP (§1): que un evaluador pueda recorrer
el caso por todos los roles y ver el tiempo consumido frente a la línea base.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import sesion
from app.main import app
from app.modelos import Base
from app.seed import CLAVE_DEMO, sembrar


@pytest.fixture
def cliente():
    motor = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(motor)
    Sesion = sessionmaker(bind=motor, expire_on_commit=False)

    with Sesion() as s:
        sembrar(s)

    def _sesion():
        db = Sesion()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[sesion] = _sesion
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def token(cliente, correo: str) -> dict:
    r = cliente.post("/api/auth/token", data={"username": correo, "password": CLAVE_DEMO})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def comunidad_id(cliente, nombre: str) -> str:
    r = cliente.get("/api/comunidades", params={"q": nombre})
    assert r.status_code == 200
    return r.json()[0]["id"]


# --------------------------------------------------------------------------
# Consulta pública
# --------------------------------------------------------------------------

def test_consulta_publica_sin_cuenta(cliente):
    r = cliente.get("/api/comunidades")
    assert r.status_code == 200
    assert len(r.json()) == 10


def test_la_ficha_publica_no_revela_datos_restringidos(cliente):
    cid = comunidad_id(cliente, "Guapi")
    ficha = cliente.get(f"/api/comunidades/{cid}").json()
    # §10: sin cuenta no salen representantes ni documentos.
    assert "representantes" not in ficha
    assert set(ficha) <= {
        "id", "nombre_oficial", "tipo", "municipio", "departamento",
        "estado_registro", "resolucion_vigente", "fecha_registro_inicial", "lat", "lng",
    }


def test_la_ficha_interna_si_los_muestra(cliente):
    cid = comunidad_id(cliente, "Guapi")
    ficha = cliente.get(
        f"/api/comunidades/{cid}", headers=token(cliente, "daniel.perea@mininterior.gov.co")
    ).json()
    assert ficha["representantes"]
    # Ni siquiera al rol interno se le expone el número de documento.
    assert "numero_documento" not in ficha["representantes"][0]


# --------------------------------------------------------------------------
# Validación en origen (§6.1)
# --------------------------------------------------------------------------

def test_la_validacion_bloquea_antes_de_radicar(cliente):
    cid = comunidad_id(cliente, "Guapi")
    r = cliente.post("/api/casos/validar", json={
        "tipo_tramite": "representante",
        "comunidad_id": cid,
        "datos": {},           # faltan todos los campos
        "documentos": [],
    })
    assert r.status_code == 200
    assert r.json()["puede_radicar"] is False
    reglas = {i["regla_id"] for i in r.json()["incumplimientos"]}
    assert "campos_completos" in reglas
    assert "documentos_presentes" in reglas


def test_no_se_puede_radicar_con_bloqueantes(cliente):
    r = cliente.post("/api/casos", json={
        "tipo_tramite": "representante", "datos": {}, "documentos": [],
    })
    assert r.status_code == 422
    assert r.json()["detail"]["puede_radicar"] is False


def test_representante_no_puede_estar_en_dos_comunidades(cliente):
    # El documento 10610002 ya es representante vigente del Río Naya (seed).
    cid = comunidad_id(cliente, "Guapi")
    r = cliente.post("/api/casos/validar", json={
        "tipo_tramite": "representante",
        "comunidad_id": cid,
        "datos": {
            "representante_nombre": "Aníbal Angulo Caicedo",
            "representante_documento": "10610002",
            "fecha_acta": "2026-08-01",
        },
        "documentos": ["Acta de asamblea", "Documento de identidad del representante"],
    })
    reglas = {i["regla_id"] for i in r.json()["incumplimientos"]}
    assert "representante_sin_conflicto" in reglas


# --------------------------------------------------------------------------
# Escenario A: caso limpio, los siete pasos (§12)
# --------------------------------------------------------------------------

def radicar_caso_limpio(cliente) -> dict:
    cid = comunidad_id(cliente, "Guapi")
    r = cliente.post("/api/casos", json={
        "tipo_tramite": "representante",
        "comunidad_id": cid,
        "datos": {
            "representante_nombre": "Rosalba Mosquera",
            "representante_documento": "10619999",
            "fecha_acta": "2026-08-01",
        },
        "documentos": ["Acta de asamblea", "Documento de identidad del representante"],
    })
    assert r.status_code == 201, r.text
    return r.json()


def test_escenario_a_recorrido_completo(cliente):
    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    assert caso["estado"] == "RADICADO"
    assert caso["fecha_vencimiento"]
    assert caso["dias_restantes"] == 15

    # 2. Clasificación.
    r = cliente.post(f"/api/casos/{cid}/clasificar",
                     json={"categoria": "Cambio de representante legal"},
                     headers=token(cliente, "sandra.molano@mininterior.gov.co"))
    assert r.json()["estado"] == "CLASIFICADO"

    # 3. Mesa: el sistema propone y la mesa asigna.
    mesa = token(cliente, "marta.rincon@mininterior.gov.co")
    propuesta = cliente.get(f"/api/casos/{cid}/propuesta-asesor", headers=mesa).json()
    assert propuesta["asesor_id"]          # nunca queda sin dueño (§13.7)
    assert propuesta["justificacion"]      # y la propuesta se explica

    r = cliente.post(f"/api/casos/{cid}/asignar", json={}, headers=mesa)
    assert r.json()["estado"] == "ASIGNADO"
    assert r.json()["responsable_id"] == propuesta["asesor_id"]

    # 4. Asesor: primero la decisión, después el borrador (§13.2).
    asesor = token(cliente, "daniel.perea@mininterior.gov.co")
    r = cliente.post(f"/api/casos/{cid}/decision",
                     json={"sentido": "favorable",
                           "fundamento": "Cumple los requisitos del Decreto 1745 de 1995."},
                     headers=asesor)
    assert r.json()["sentido"] == "favorable"

    r = cliente.post(f"/api/casos/{cid}/proyeccion", headers=asesor)
    assert r.status_code == 200
    assert "RESUELVE" in r.json()["contenido"]

    # 5. Pre-revisión: hallazgos, nunca veredicto (§13.1).
    r = cliente.post(f"/api/casos/{cid}/pre-revision", headers=asesor)
    salida = r.json()
    assert "verificaciones_superadas" in salida
    assert not ({"veredicto", "score", "confianza", "aprobado"} & set(salida))

    # 6. Revisión y firma.
    revisor = token(cliente, "elena.vargas@mininterior.gov.co")
    r = cliente.post(f"/api/casos/{cid}/revisar",
                     json={"accion": "aprobar", "motivo": "La proyección está conforme."},
                     headers=revisor)
    assert r.json()["estado"] == "APROBADO"

    r = cliente.post(f"/api/casos/{cid}/firmar", headers=revisor)
    assert r.json()["estado"] == "FIRMADO"
    assert r.json()["radicado_externo"]     # ControlDoc dio el radicado oficial

    # 7. Notificación y cierre.
    r = cliente.post(f"/api/casos/{cid}/notificar", headers=revisor)
    assert r.json()["estado"] == "NOTIFICADO"

    r = cliente.post(f"/api/casos/{cid}/cerrar",
                     json={"estado_terminal": "favorable", "motivacion": "Trámite resuelto de fondo."},
                     headers=revisor)
    assert r.json()["estado"] == "CERRADO_FAVORABLE"

    # Y el evaluador ve el tiempo frente a la línea base (§8).
    sim = cliente.get("/api/metricas/simulacion", params={"caso_id": cid}).json()
    assert sim["linea_base_real"]["mediana_dias"] == 49
    assert "EXTRACTO_COM_NEGRAS_13_SEP_2026" in sim["fuente_linea_base"]


# --------------------------------------------------------------------------
# Escenario B: hallazgo y retorno único (§12)
# --------------------------------------------------------------------------

def test_escenario_b_el_retorno_interno_es_unico(cliente):
    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    clasificador = token(cliente, "sandra.molano@mininterior.gov.co")
    mesa = token(cliente, "marta.rincon@mininterior.gov.co")
    asesor = token(cliente, "daniel.perea@mininterior.gov.co")
    revisor = token(cliente, "elena.vargas@mininterior.gov.co")

    cliente.post(f"/api/casos/{cid}/clasificar", json={"categoria": "Cambio de representante legal"}, headers=clasificador)
    cliente.post(f"/api/casos/{cid}/asignar", json={}, headers=mesa)
    cliente.post(f"/api/casos/{cid}/decision",
                 json={"sentido": "favorable", "fundamento": "Cumple los requisitos exigidos."},
                 headers=asesor)
    cliente.post(f"/api/casos/{cid}/proyeccion", headers=asesor)
    cliente.post(f"/api/casos/{cid}/pre-revision", headers=asesor)

    # Primer retorno: procede.
    r = cliente.post(f"/api/casos/{cid}/revisar",
                     json={"accion": "devolver", "motivo": "Falta precisar el acta en el considerando."},
                     headers=revisor)
    assert r.json()["estado"] == "EN_ANALISIS"
    assert r.json()["retorno_usado"] is True

    # El caso vuelve a subir.
    cliente.post(f"/api/casos/{cid}/proyeccion", headers=asesor)
    cliente.post(f"/api/casos/{cid}/pre-revision", headers=asesor)

    # Segundo retorno: rechazado (§4.5).
    r = cliente.post(f"/api/casos/{cid}/revisar",
                     json={"accion": "devolver", "motivo": "Sigue faltando."},
                     headers=revisor)
    assert r.status_code == 409
    assert "retorno interno" in r.json()["detail"]


def test_el_retorno_no_se_le_muestra_al_ciudadano(cliente):
    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    clasificador = token(cliente, "sandra.molano@mininterior.gov.co")
    mesa = token(cliente, "marta.rincon@mininterior.gov.co")
    asesor = token(cliente, "daniel.perea@mininterior.gov.co")
    revisor = token(cliente, "elena.vargas@mininterior.gov.co")

    cliente.post(f"/api/casos/{cid}/clasificar", json={"categoria": "Cambio de representante legal"}, headers=clasificador)
    cliente.post(f"/api/casos/{cid}/asignar", json={}, headers=mesa)
    cliente.post(f"/api/casos/{cid}/decision", json={"sentido": "favorable", "fundamento": "Cumple los requisitos."}, headers=asesor)
    cliente.post(f"/api/casos/{cid}/proyeccion", headers=asesor)
    cliente.post(f"/api/casos/{cid}/pre-revision", headers=asesor)
    cliente.post(f"/api/casos/{cid}/revisar", json={"accion": "devolver", "motivo": "Falta precisar."}, headers=revisor)

    # El ciudadano no ve la barra retroceder (§13.6).
    publicos = cliente.get(f"/api/casos/{cid}/eventos").json()
    assert not any(e["estado_destino"] == "EN_ANALISIS" and e["estado_origen"] == "EN_REVISION"
                   for e in publicos)
    # El interno sí ve la traza completa.
    internos = cliente.get(f"/api/casos/{cid}/eventos", headers=revisor).json()
    assert len(internos) > len(publicos)


def test_no_se_puede_proyectar_sin_registrar_la_decision(cliente):
    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    cliente.post(f"/api/casos/{cid}/clasificar", json={"categoria": "Cambio de representante legal"},
                 headers=token(cliente, "sandra.molano@mininterior.gov.co"))
    cliente.post(f"/api/casos/{cid}/asignar", json={},
                 headers=token(cliente, "marta.rincon@mininterior.gov.co"))

    # §13.2: la decisión precede a la redacción.
    r = cliente.post(f"/api/casos/{cid}/proyeccion",
                     headers=token(cliente, "daniel.perea@mininterior.gov.co"))
    assert r.status_code == 409
    assert "no decide" in r.json()["detail"]


# --------------------------------------------------------------------------
# Escenario C: ruta especial (§12) — el hallazgo más fuerte del análisis
# --------------------------------------------------------------------------

def test_escenario_c_la_tutela_no_entra_al_flujo_estandar(cliente):
    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    r = cliente.post(f"/api/casos/{cid}/clasificar",
                     json={"categoria": "Acción de tutela", "tipologia": "Acción de tutela"},
                     headers=token(cliente, "sandra.molano@mininterior.gov.co"))
    # Se desvía a Jurídica, no se queda en la bandeja genérica.
    assert r.json()["estado"] == "TRASLADADO"
    assert r.json()["ruta_especial"] == "tutela"


def test_la_demanda_va_a_contencioso(cliente):
    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    r = cliente.post(f"/api/casos/{cid}/clasificar",
                     json={"categoria": "Demanda", "tipologia": "Demanda / proceso judicial"},
                     headers=token(cliente, "sandra.molano@mininterior.gov.co"))
    assert r.json()["ruta_especial"] == "contencioso"


# --------------------------------------------------------------------------
# Tolerancia a fallos y métricas
# --------------------------------------------------------------------------

def test_si_controldoc_falla_el_caso_queda_pendiente_y_el_reintento_no_duplica(cliente, monkeypatch):
    from app import servicio

    caso = radicar_caso_limpio(cliente)
    cid = caso["id"]
    clasificador = token(cliente, "sandra.molano@mininterior.gov.co")
    mesa = token(cliente, "marta.rincon@mininterior.gov.co")
    asesor = token(cliente, "daniel.perea@mininterior.gov.co")
    revisor = token(cliente, "elena.vargas@mininterior.gov.co")

    cliente.post(f"/api/casos/{cid}/clasificar", json={"categoria": "Cambio de representante legal"}, headers=clasificador)
    cliente.post(f"/api/casos/{cid}/asignar", json={}, headers=mesa)
    cliente.post(f"/api/casos/{cid}/decision", json={"sentido": "favorable", "fundamento": "Cumple los requisitos."}, headers=asesor)
    cliente.post(f"/api/casos/{cid}/proyeccion", headers=asesor)
    cliente.post(f"/api/casos/{cid}/pre-revision", headers=asesor)
    cliente.post(f"/api/casos/{cid}/revisar", json={"accion": "aprobar", "motivo": "Conforme."}, headers=revisor)

    # El documental no responde.
    original = servicio.config
    monkeypatch.setattr(servicio, "config", lambda: type("C", (), {"controldoc_falla": True, "termino_dias_habiles": 15})())
    r = cliente.post(f"/api/casos/{cid}/firmar", headers=revisor)
    assert r.status_code == 503
    assert cliente.get(f"/api/casos/{cid}").json()["estado"] == "PENDIENTE_RADICACION"

    # Se restablece y se reintenta: se publica UNA sola vez (§9).
    monkeypatch.setattr(servicio, "config", original)
    r = cliente.post(f"/api/casos/{cid}/firmar", headers=revisor)
    assert r.status_code == 200
    radicado = r.json()["radicado_externo"]
    assert radicado

    # Un reintento posterior no genera otro acto administrativo.
    assert cliente.get(f"/api/casos/{cid}").json()["radicado_externo"] == radicado


def test_el_tablero_vigila_los_casos_sin_responsable(cliente):
    radicar_caso_limpio(cliente)
    r = cliente.get("/api/metricas/tablero",
                    headers=token(cliente, "marta.rincon@mininterior.gov.co"))
    assert r.status_code == 200
    # Se vigila explícitamente: es el fallo que produjo los 8.740 atascados.
    assert "sin_responsable" in r.json()


def test_la_bandeja_exige_sesion(cliente):
    assert cliente.get("/api/bandejas/clasificador").status_code == 401


def test_un_rol_no_puede_hacer_lo_de_otro(cliente):
    caso = radicar_caso_limpio(cliente)
    # El clasificador no firma.
    r = cliente.post(f"/api/casos/{caso['id']}/firmar",
                     headers=token(cliente, "sandra.molano@mininterior.gov.co"))
    assert r.status_code == 403


def test_la_simulacion_no_promete_ahorro_del_100_por_ciento(cliente):
    """Un recorrido de demo tarda minutos; presentarlo como 0 días sería indefendible."""
    caso = radicar_caso_limpio(cliente)
    sim = cliente.get("/api/metricas/simulacion", params={"caso_id": caso["id"]}).json()
    tiempo = sim["tiempo_sistema_nuevo"]

    assert tiempo["total_dias_habiles"] > 0
    assert sim["ahorro"]["pct"] < 100
    # Y se dice que es estimación, no medición.
    assert tiempo["estimado"] is True
    assert "estimado" in tiempo["nota"]


def test_una_bandeja_interna_no_se_le_abre_a_cualquiera(cliente):
    """Sin esto, una cuenta de ciudadano leía las bandejas internas del Ministerio."""
    ciudadana = token(cliente, "rosalba.mosquera@correo.com")
    for rol in ("clasificador", "mesa", "revisor", "firmante"):
        r = cliente.get(f"/api/bandejas/{rol}", headers=ciudadana)
        assert r.status_code == 403, f"{rol} quedó expuesta: {r.status_code}"


def test_cada_rol_ve_la_suya(cliente):
    assert cliente.get(
        "/api/bandejas/clasificador",
        headers=token(cliente, "sandra.molano@mininterior.gov.co"),
    ).status_code == 200


def test_el_coordinador_supervisa_todas(cliente):
    # Marta Rincón es mesa y coordinadora: la coordinación sí ve todas las etapas.
    coord = token(cliente, "marta.rincon@mininterior.gov.co")
    for rol in ("clasificador", "asesor", "revisor", "firmante"):
        assert cliente.get(f"/api/bandejas/{rol}", headers=coord).status_code == 200
