"""Esquemas de entrada y salida de la API."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field

from .estados import Estado
from .modelos import Canal, EstadoRegistro, Severidad, TipoComunidad


# --------------------------------------------------------------------------
# Autenticación
# --------------------------------------------------------------------------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nombre: str
    roles: list[str]


# --------------------------------------------------------------------------
# Comunidades
# --------------------------------------------------------------------------

class ComunidadPublica(BaseModel):
    """Lo único que sale sin cuenta (§10)."""

    id: str
    nombre_oficial: str
    tipo: TipoComunidad
    municipio: str
    departamento: str
    estado_registro: EstadoRegistro
    resolucion_vigente: str | None = None
    fecha_registro_inicial: date | None = None
    # Centroide del municipio, nunca la ubicación de la comunidad (§10).
    lat: float | None = None
    lng: float | None = None


class RepresentanteOut(BaseModel):
    id: str
    nombre: str
    vigente_desde: date
    vigente_hasta: date | None = None
    acto_administrativo: str | None = None
    # numero_documento es dato restringido y no se expone aquí.


class ComunidadInterna(ComunidadPublica):
    """Ficha interna: incluye lo restringido y su acceso queda auditado."""

    nombres_alternos: list[str] = Field(default_factory=list)
    codigo_divipola: str | None = None
    fecha_ultima_actualizacion: date | None = None
    representantes: list[RepresentanteOut] = Field(default_factory=list)


# --------------------------------------------------------------------------
# Casos
# --------------------------------------------------------------------------

class SolicitudRadicar(BaseModel):
    tipo_tramite: str = Field(description="Código del tipo de trámite")
    comunidad_id: str | None = None
    canal: Canal = Canal.PORTAL
    datos: dict = Field(default_factory=dict)
    documentos: list[str] = Field(default_factory=list, description="Tipos de documento adjuntados")


class IncumplimientoOut(BaseModel):
    regla_id: str
    severidad: Severidad
    mensaje: str
    campo: str | None = None


class ValidacionOut(BaseModel):
    puede_radicar: bool
    incumplimientos: list[IncumplimientoOut]


class CasoOut(BaseModel):
    id: str
    numero_seguimiento: str
    radicado_externo: str | None
    estado: Estado
    tipo_tramite: str
    tipo_tramite_ciudadano: str
    comunidad_id: str | None
    comunidad: str | None
    canal: Canal
    fecha_radicacion: datetime | None
    fecha_vencimiento: date | None
    dias_restantes: int | None
    vencido: bool
    dias_ministerio: int
    dias_ciudadano: int
    reloj_activo: str
    responsable_id: str | None
    rol_responsable: str | None
    retorno_usado: bool
    ruta_especial: str
    sentido: str | None
    fundamento: str | None
    datos: dict


class EventoOut(BaseModel):
    timestamp: datetime
    actor_nombre: str | None
    actor_tipo: str
    estado_origen: Estado | None
    estado_destino: Estado | None
    motivo: str | None
    sugerencia_ia: dict | None
    decision_humana: dict | None


class Clasificacion(BaseModel):
    categoria: str
    tipologia: str | None = None
    asunto: str | None = None
    corregida: bool = False
    motivo: str | None = None


class Asignacion(BaseModel):
    asesor_id: str | None = None
    motivo: str | None = None


class Decision(BaseModel):
    """El asesor registra sentido y fundamento ANTES de proyectar (§13.2)."""

    sentido: str = Field(description="favorable | desfavorable")
    fundamento: str = Field(min_length=10)


class ProyeccionIn(BaseModel):
    contenido: str
    marcadores_pendientes: list[str] = Field(default_factory=list)


class ProyeccionOut(BaseModel):
    id: str
    version: int
    contenido: str
    generado_por_ia: bool
    marcadores_pendientes: list[str]


class HallazgoOut(BaseModel):
    id: str
    regla_id: str
    severidad: Severidad
    descripcion: str
    evidencia: str | None
    ubicacion: str | None
    estado: str
    capa: int


class Justificacion(BaseModel):
    justificacion: str = Field(min_length=10)


class Revision(BaseModel):
    accion: str = Field(description="aprobar | devolver | cambiar_sentido")
    motivo: str = Field(min_length=5)
    nuevo_sentido: str | None = None


class Cierre(BaseModel):
    estado_terminal: str = Field(description="desfavorable | desistida | archivada | trasladada")
    motivacion: str = Field(min_length=10)


class RequerimientoIn(BaseModel):
    texto: str = Field(min_length=10)
    dias_habiles: int = 10
