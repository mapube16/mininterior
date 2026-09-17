"""Lectura de documentos con Gemini.

Extrae los campos de un acta, un listado censal o una cédula para que el funcionario
de ventanilla no los transcriba a mano. **Propone, no decide**: lo extraído se le
muestra a una persona que corrige y confirma antes de que entre al expediente.

Tres límites, que vienen del contexto del proyecto:

- Ningún fallo de IA detiene un trámite (§4.4). Si no hay clave, si el servicio no
  responde o si devuelve algo que no valida, se marca el documento como ilegible con
  `marcado_prioritario` y el caso sigue por vía manual.
- Lo extraído nunca se da por bueno: `validado` queda en False hasta que un humano
  confirma.
- El documento sale a un tercero, así que esto solo corre sobre lo que el ciudadano
  adjunta a su propio trámite, nunca sobre el expediente completo.
"""

from __future__ import annotations

import base64
import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass, field

from .config import config

log = logging.getLogger(__name__)

URL = "https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={clave}"
TIEMPO_LIMITE = 60
# §9: 2 reintentos y, si persiste, se permite enviar con marca prioritaria.
REINTENTOS = 2

# Qué pedirle a cada tipo de documento. Las claves son las del modelo de datos, para
# que lo extraído encaje directo en `caso.datos` sin traducción.
CAMPOS = {
    "Acta de asamblea": [
        "representante_nombre", "representante_documento", "fecha_acta",
        "comunidad", "municipio",
    ],
    "Listado censal": [
        "fecha_censo", "censo_total", "censo_hombres", "censo_mujeres", "comunidad",
    ],
    "Documento de identidad del representante": [
        "representante_nombre", "representante_documento",
    ],
    "Listado de la junta": ["fecha_acta", "junta_integrantes", "comunidad"],
    "Plano o descripción técnica": ["descripcion_linderos", "comunidad"],
}

_INSTRUCCION = (
    "Eres un asistente de una entidad pública colombiana que lee documentos de trámites.\n"
    "Extrae ÚNICAMENTE los campos pedidos y devuelve un objeto JSON.\n"
    "Reglas:\n"
    "- Si un campo no aparece en el documento, ponlo en null. No lo inventes ni lo deduzcas.\n"
    "- Las fechas van en formato AAAA-MM-DD. Si están escritas en letras, conviértelas.\n"
    "- Los números de documento van sin puntos ni espacios.\n"
    "- Los conteos van como número entero, no como texto.\n"
    "- No agregues comentarios ni campos que no se pidieron.\n"
)


@dataclass
class Lectura:
    """Lo que se sacó del documento, más si se pudo leer."""

    legible: bool
    campos: dict = field(default_factory=dict)
    texto: str | None = None
    error: str | None = None
    modelo: str | None = None

    def dict(self) -> dict:
        return {
            "legible": self.legible,
            "campos": self.campos,
            "error": self.error,
            "modelo": self.modelo,
            # Nunca viene confirmado: lo revisa una persona (§4.3).
            "validado": False,
        }


def disponible() -> bool:
    return config().hay_gemini


def leer(contenido: bytes, *, tipo_documento: str, mime: str = "application/pdf") -> Lectura:
    """Lee un documento y devuelve los campos que encuentre.

    Nunca lanza: un fallo se devuelve como `legible=False` para que quien llame
    siga adelante por vía manual.
    """
    cfg = config()
    if not cfg.hay_gemini:
        return Lectura(False, error="No hay lectura automática configurada.")

    campos = CAMPOS.get(tipo_documento)
    if not campos:
        # Un tipo que no sabemos leer no es un error: simplemente se transcribe a mano.
        return Lectura(False, error=f"No hay extracción definida para «{tipo_documento}».")

    peticion = {
        "contents": [{
            "parts": [
                {"text": f"{_INSTRUCCION}\nCampos a extraer: {', '.join(campos)}."},
                {"inline_data": {
                    "mime_type": mime,
                    "data": base64.b64encode(contenido).decode(),
                }},
            ]
        }],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0},
    }

    url = URL.format(modelo=cfg.gemini_modelo, clave=cfg.gemini_api_key)
    ultimo = None

    for intento in range(1, REINTENTOS + 2):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(peticion).encode(),
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=TIEMPO_LIMITE) as r:
                datos = json.load(r)

            texto = datos["candidates"][0]["content"]["parts"][0]["text"]
            crudo = json.loads(texto)
            if not isinstance(crudo, dict):
                raise ValueError("La respuesta no es un objeto JSON.")

            # Solo se conserva lo que se pidió y trae valor: así una alucinación de
            # campos extra no entra al expediente.
            limpio = {k: crudo[k] for k in campos if crudo.get(k) not in (None, "", [])}
            return Lectura(True, campos=limpio, texto=texto, modelo=cfg.gemini_modelo)

        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as e:
            ultimo = f"El servicio de lectura no respondió ({e})."
            log.warning("OCR intento %s/%s: %s", intento, REINTENTOS + 1, e)
        except (KeyError, ValueError, json.JSONDecodeError) as e:
            ultimo = f"La lectura no devolvió un resultado utilizable ({e})."
            log.warning("OCR intento %s/%s, respuesta inválida: %s", intento, REINTENTOS + 1, e)

    # Agotados los reintentos: el documento se marca ilegible y el caso sigue.
    return Lectura(False, error=ultimo, modelo=cfg.gemini_modelo)
