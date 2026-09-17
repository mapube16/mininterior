"""La lectura de documentos propone; nunca decide ni bloquea.

Lo que más importa aquí no es que extraiga bien —eso depende del modelo— sino que
cuando falla el trámite pueda seguir por vía manual.
"""

import json
from unittest.mock import patch

import pytest

from app import ocr
from app.config import Config


def _cfg(clave="x"):
    return Config(gemini_api_key=clave, gemini_modelo="gemini-3.6-flash")


def _respuesta(payload: dict):
    """Simula lo que devuelve la API."""
    cuerpo = {"candidates": [{"content": {"parts": [{"text": json.dumps(payload)}]}}]}

    class R:
        def read(self):
            return json.dumps(cuerpo).encode()

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    return R()


def test_sin_clave_no_intenta_leer():
    with patch.object(ocr, "config", lambda: _cfg("")):
        r = ocr.leer(b"x", tipo_documento="Acta de asamblea")
    assert r.legible is False
    assert "No hay lectura automática" in r.error


def test_extrae_los_campos_pedidos():
    with patch.object(ocr, "config", lambda: _cfg()), patch.object(
        ocr.urllib.request, "urlopen",
        return_value=_respuesta({
            "representante_nombre": "Rosalba Mosquera",
            "representante_documento": "1061700000",
            "fecha_acta": "2026-08-15",
            "comunidad": "Consejo Comunitario Guapi Abajo Unidos",
            "municipio": "Guapi",
        }),
    ):
        r = ocr.leer(b"pdf", tipo_documento="Acta de asamblea")

    assert r.legible is True
    assert r.campos["representante_nombre"] == "Rosalba Mosquera"
    assert r.campos["fecha_acta"] == "2026-08-15"
    # Lo extraído NUNCA llega validado: lo confirma una persona (§4.3).
    assert r.dict()["validado"] is False


def test_descarta_campos_que_nadie_pidio():
    # Si el modelo inventa campos, no entran al expediente.
    with patch.object(ocr, "config", lambda: _cfg()), patch.object(
        ocr.urllib.request, "urlopen",
        return_value=_respuesta({
            "representante_nombre": "Rosalba Mosquera",
            "salario": "5000000",           # nadie pidió esto
            "observacion_inventada": "...",
        }),
    ):
        r = ocr.leer(b"pdf", tipo_documento="Acta de asamblea")

    assert "salario" not in r.campos
    assert "observacion_inventada" not in r.campos
    assert r.campos == {"representante_nombre": "Rosalba Mosquera"}


def test_los_campos_nulos_no_se_inventan():
    with patch.object(ocr, "config", lambda: _cfg()), patch.object(
        ocr.urllib.request, "urlopen",
        return_value=_respuesta({
            "representante_nombre": "Rosalba Mosquera",
            "representante_documento": None,
            "fecha_acta": "",
        }),
    ):
        r = ocr.leer(b"pdf", tipo_documento="Acta de asamblea")

    assert "representante_documento" not in r.campos
    assert "fecha_acta" not in r.campos


def test_si_el_servicio_falla_el_tramite_sigue():
    """§4.4: ningún componente de IA puede detener un trámite."""
    with patch.object(ocr, "config", lambda: _cfg()), patch.object(
        ocr.urllib.request, "urlopen", side_effect=TimeoutError("sin respuesta")
    ):
        r = ocr.leer(b"pdf", tipo_documento="Acta de asamblea")

    # No lanza: devuelve ilegible para que el funcionario transcriba a mano.
    assert r.legible is False
    assert r.error
    assert r.campos == {}


def test_reintenta_antes_de_rendirse():
    intentos = []

    def falla(*a, **k):
        intentos.append(1)
        raise TimeoutError("sin respuesta")

    with patch.object(ocr, "config", lambda: _cfg()), patch.object(
        ocr.urllib.request, "urlopen", side_effect=falla
    ):
        ocr.leer(b"pdf", tipo_documento="Acta de asamblea")

    assert len(intentos) == ocr.REINTENTOS + 1


def test_una_respuesta_corrupta_no_rompe():
    class Basura:
        def read(self):
            return b"esto no es json"

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    with patch.object(ocr, "config", lambda: _cfg()), patch.object(
        ocr.urllib.request, "urlopen", return_value=Basura()
    ):
        r = ocr.leer(b"pdf", tipo_documento="Acta de asamblea")

    assert r.legible is False


def test_un_tipo_desconocido_no_es_un_error():
    with patch.object(ocr, "config", lambda: _cfg()):
        r = ocr.leer(b"pdf", tipo_documento="Carta de recomendación")
    assert r.legible is False
    assert "extracción definida" in r.error


def test_cada_tipo_pide_sus_campos():
    assert "censo_total" in ocr.CAMPOS["Listado censal"]
    assert "representante_documento" in ocr.CAMPOS["Acta de asamblea"]
    # Al documento de identidad no se le piden datos del trámite.
    assert "fecha_acta" not in ocr.CAMPOS["Documento de identidad del representante"]
