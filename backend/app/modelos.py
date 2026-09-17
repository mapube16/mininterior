"""Modelo de datos (§5 y §10 del contexto).

La clasificación de datos vive aquí, en el modelo, no en la capa de presentación:
cada campo restringido queda marcado en NIVEL_CAMPO y la serialización pública se
construye a partir de esa lista, para que no dependa de que cada endpoint recuerde
ocultar lo que toca.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime, timezone
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .estados import Estado


def _uuid() -> str:
    return str(uuid.uuid4())


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


# --------------------------------------------------------------------------
# Enumeraciones del dominio
# --------------------------------------------------------------------------

class TipoComunidad(StrEnum):
    CONSEJO_COMUNITARIO = "consejo_comunitario"
    ORGANIZACION_BASE = "organizacion_base"
    FORMA_EXPRESION = "forma_expresion"


class EstadoRegistro(StrEnum):
    VIGENTE = "vigente"
    EN_ACTUALIZACION = "en_actualizacion"
    DESACTUALIZADO = "desactualizado"
    SUSPENDIDO = "suspendido"


class TipoDocumento(StrEnum):
    CC = "CC"
    NIT = "NIT"
    CE = "CE"
    PA = "PA"


class Canal(StrEnum):
    PORTAL = "portal"
    CORREO = "correo"
    PRESENCIAL = "presencial"
    MENSAJERIA = "mensajeria"
    ASISTIDA = "asistida"


class RutaEspecial(StrEnum):
    NINGUNA = "ninguna"
    TUTELA = "tutela"
    ENTE_CONTROL = "ente_control"
    CONGRESO = "congreso"
    DISCIPLINARIO = "disciplinario"
    CONTENCIOSO = "contencioso"


class Reloj(StrEnum):
    MINISTERIO = "ministerio"
    CIUDADANO = "ciudadano"
    DETENIDO = "detenido"


class Rol(StrEnum):
    CIUDADANO = "ciudadano"
    CLASIFICADOR = "clasificador"
    MESA = "mesa"
    ASESOR = "asesor"
    REVISOR = "revisor"
    FIRMANTE = "firmante"
    COORDINADOR = "coordinador"
    ADMIN_FUNCIONAL = "admin_funcional"
    ADMIN_TECNICO = "admin_tecnico"
    VENTANILLA = "ventanilla"


class ActorTipo(StrEnum):
    USUARIO = "usuario"
    SISTEMA = "sistema"
    IA = "ia"


class Severidad(StrEnum):
    BLOQUEANTE = "bloqueante"
    ADVERTENCIA = "advertencia"


class EstadoHallazgo(StrEnum):
    PENDIENTE = "pendiente"
    CORREGIDO = "corregido"
    JUSTIFICADO = "justificado"


# --------------------------------------------------------------------------
# Comunidad y representante
# --------------------------------------------------------------------------

class Comunidad(Base):
    __tablename__ = "comunidad"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    nombre_oficial: Mapped[str] = mapped_column(String(300))
    nombres_alternos: Mapped[list] = mapped_column(JSON, default=list)
    tipo: Mapped[TipoComunidad] = mapped_column(SAEnum(TipoComunidad))
    municipio: Mapped[str] = mapped_column(String(120))
    departamento: Mapped[str] = mapped_column(String(120))
    codigo_divipola: Mapped[str | None] = mapped_column(String(10), default=None)
    estado_registro: Mapped[EstadoRegistro] = mapped_column(
        SAEnum(EstadoRegistro), default=EstadoRegistro.VIGENTE
    )
    resolucion_vigente: Mapped[str | None] = mapped_column(String(120), default=None)
    fecha_registro_inicial: Mapped[date | None] = mapped_column(Date, default=None)
    fecha_ultima_actualizacion: Mapped[date | None] = mapped_column(Date, default=None)

    # Centroide del municipio, nunca la ubicación real de la comunidad (§10).
    lat: Mapped[float | None] = mapped_column(default=None)
    lng: Mapped[float | None] = mapped_column(default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora, onupdate=ahora)

    representantes: Mapped[list[Representante]] = relationship(back_populates="comunidad")
    casos: Mapped[list[Caso]] = relationship(back_populates="comunidad")

    # Lo único que sale sin cuenta (§10). El resto exige autenticación o rol.
    CAMPOS_PUBLICOS = (
        "id", "nombre_oficial", "tipo", "municipio", "departamento",
        "estado_registro", "resolucion_vigente", "fecha_registro_inicial", "lat", "lng",
    )

    def publico(self) -> dict:
        return {c: getattr(self, c) for c in self.CAMPOS_PUBLICOS}


class Representante(Base):
    __tablename__ = "representante"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    comunidad_id: Mapped[str] = mapped_column(ForeignKey("comunidad.id"))
    nombre: Mapped[str] = mapped_column(String(200))
    tipo_documento: Mapped[TipoDocumento] = mapped_column(SAEnum(TipoDocumento), default=TipoDocumento.CC)
    numero_documento: Mapped[str] = mapped_column(String(40))  # dato restringido (§10)
    vigente_desde: Mapped[date] = mapped_column(Date)
    vigente_hasta: Mapped[date | None] = mapped_column(Date, default=None)
    acto_administrativo: Mapped[str | None] = mapped_column(String(120), default=None)

    comunidad: Mapped[Comunidad] = relationship(back_populates="representantes")

    @property
    def vigente(self) -> bool:
        return self.vigente_hasta is None


# --------------------------------------------------------------------------
# Usuarios
# --------------------------------------------------------------------------

class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    nombre: Mapped[str] = mapped_column(String(200))
    correo: Mapped[str] = mapped_column(String(200), unique=True)
    clave_hash: Mapped[str] = mapped_column(String(200))
    # Un usuario puede tener varios roles; no se duplican cuentas (§7).
    roles: Mapped[list] = mapped_column(JSON, default=list)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    # Territorio y especialidad alimentan el algoritmo de asignación (§6.3).
    territorio: Mapped[str | None] = mapped_column(String(120), default=None)
    wip_maximo: Mapped[int] = mapped_column(Integer, default=8)
    comunidad_id: Mapped[str | None] = mapped_column(ForeignKey("comunidad.id"), default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)

    def tiene_rol(self, rol: Rol) -> bool:
        return rol.value in (self.roles or [])


class ConflictoInteres(Base):
    """Asesor que no puede tomar casos de una comunidad (§6.3.1)."""

    __tablename__ = "conflicto_interes"
    __table_args__ = (UniqueConstraint("usuario_id", "comunidad_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuario.id"))
    comunidad_id: Mapped[str] = mapped_column(ForeignKey("comunidad.id"))
    motivo: Mapped[str | None] = mapped_column(Text, default=None)


# --------------------------------------------------------------------------
# Tipo de trámite: datos, no código (§5)
# --------------------------------------------------------------------------

class TipoTramite(Base):
    __tablename__ = "tipo_tramite"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    codigo: Mapped[str] = mapped_column(String(60), unique=True)
    nombre: Mapped[str] = mapped_column(String(200))            # interno, el de la resolución
    nombre_ciudadano: Mapped[str] = mapped_column(String(200))  # el que ve el ciudadano
    categoria_interna: Mapped[str | None] = mapped_column(String(200), default=None)
    termino_dias_habiles: Mapped[int] = mapped_column(Integer, default=15)
    campos_requeridos: Mapped[list] = mapped_column(JSON, default=list)
    documentos_requeridos: Mapped[list] = mapped_column(JSON, default=list)
    reglas_validacion: Mapped[list] = mapped_column(JSON, default=list)
    plantilla_acto: Mapped[str | None] = mapped_column(Text, default=None)
    version: Mapped[int] = mapped_column(Integer, default=1)
    vigente_desde: Mapped[date | None] = mapped_column(Date, default=None)
    aprobado_por: Mapped[str | None] = mapped_column(String(200), default=None)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)


# --------------------------------------------------------------------------
# Caso
# --------------------------------------------------------------------------

class Caso(Base):
    __tablename__ = "caso"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    radicado_externo: Mapped[str | None] = mapped_column(String(60), unique=True, default=None)
    numero_seguimiento: Mapped[str] = mapped_column(String(60), unique=True)

    comunidad_id: Mapped[str | None] = mapped_column(ForeignKey("comunidad.id"), default=None)
    tipo_tramite_id: Mapped[str] = mapped_column(ForeignKey("tipo_tramite.id"))
    canal: Mapped[Canal] = mapped_column(SAEnum(Canal), default=Canal.PORTAL)

    estado: Mapped[Estado] = mapped_column(SAEnum(Estado), default=Estado.RECIBIDO)
    responsable_actual_id: Mapped[str | None] = mapped_column(ForeignKey("usuario.id"), default=None)
    rol_responsable: Mapped[Rol | None] = mapped_column(SAEnum(Rol), default=None)
    prioridad: Mapped[str] = mapped_column(String(20), default="normal")
    ruta_especial: Mapped[RutaEspecial] = mapped_column(SAEnum(RutaEspecial), default=RutaEspecial.NINGUNA)

    datos: Mapped[dict] = mapped_column(JSON, default=dict)  # los campos del tipo de trámite

    fecha_radicacion: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    fecha_vencimiento: Mapped[date | None] = mapped_column(Date, default=None)

    # Dos relojes separados (§4.6): uno corre en manos del Ministerio y otro
    # en manos del ciudadano. Se acumulan al cambiar de reloj.
    dias_ministerio: Mapped[int] = mapped_column(Integer, default=0)
    dias_ciudadano: Mapped[int] = mapped_column(Integer, default=0)
    reloj_activo: Mapped[Reloj] = mapped_column(SAEnum(Reloj), default=Reloj.MINISTERIO)
    reloj_desde: Mapped[date | None] = mapped_column(Date, default=None)

    retorno_usado: Mapped[bool] = mapped_column(Boolean, default=False)
    marcado_prioritario: Mapped[bool] = mapped_column(Boolean, default=False)

    # Lo que registra el asesor ANTES de proyectar (§13.2).
    sentido: Mapped[str | None] = mapped_column(String(40), default=None)
    fundamento: Mapped[str | None] = mapped_column(Text, default=None)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora, onupdate=ahora)

    comunidad: Mapped[Comunidad | None] = relationship(back_populates="casos")
    tipo_tramite: Mapped[TipoTramite] = relationship()
    eventos: Mapped[list[EventoCaso]] = relationship(
        back_populates="caso", order_by="EventoCaso.timestamp"
    )
    documentos: Mapped[list[Documento]] = relationship(back_populates="caso")
    proyecciones: Mapped[list[Proyeccion]] = relationship(back_populates="caso")
    hallazgos: Mapped[list[Hallazgo]] = relationship(back_populates="caso")


class EventoCaso(Base):
    """Traza inmutable. Registra qué sugirió el sistema y qué decidió la persona (§4.8)."""

    __tablename__ = "evento_caso"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)

    actor_id: Mapped[str | None] = mapped_column(ForeignKey("usuario.id"), default=None)
    actor_tipo: Mapped[ActorTipo] = mapped_column(SAEnum(ActorTipo), default=ActorTipo.USUARIO)
    actor_nombre: Mapped[str | None] = mapped_column(String(200), default=None)

    estado_origen: Mapped[Estado | None] = mapped_column(SAEnum(Estado), default=None)
    estado_destino: Mapped[Estado | None] = mapped_column(SAEnum(Estado), default=None)
    motivo: Mapped[str | None] = mapped_column(Text, default=None)

    sugerencia_ia: Mapped[dict | None] = mapped_column(JSON, default=None)
    decision_humana: Mapped[dict | None] = mapped_column(JSON, default=None)

    # Los retornos internos no se le muestran al ciudadano (§13.6).
    visible_ciudadano: Mapped[bool] = mapped_column(Boolean, default=True)
    # Marca los eventos que tocan datos restringidos, para la auditoría (§9).
    dato_restringido: Mapped[bool] = mapped_column(Boolean, default=False)

    caso: Mapped[Caso] = relationship(back_populates="eventos")


class Documento(Base):
    __tablename__ = "documento"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"))
    tipo: Mapped[str] = mapped_column(String(120))
    nombre_archivo: Mapped[str] = mapped_column(String(300))
    contenido: Mapped[bytes | None] = mapped_column(default=None)
    ocr_texto: Mapped[str | None] = mapped_column(Text, default=None)
    legible: Mapped[bool] = mapped_column(Boolean, default=True)
    datos_extraidos: Mapped[dict] = mapped_column(JSON, default=dict)
    validado: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)

    caso: Mapped[Caso] = relationship(back_populates="documentos")


class Proyeccion(Base):
    __tablename__ = "proyeccion"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"))
    version: Mapped[int] = mapped_column(Integer, default=1)
    contenido: Mapped[str] = mapped_column(Text)
    generado_por_ia: Mapped[bool] = mapped_column(Boolean, default=True)
    marcadores_pendientes: Mapped[list] = mapped_column(JSON, default=list)
    autor_id: Mapped[str | None] = mapped_column(ForeignKey("usuario.id"), default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)

    caso: Mapped[Caso] = relationship(back_populates="proyecciones")


class Hallazgo(Base):
    __tablename__ = "hallazgo"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"))
    proyeccion_id: Mapped[str | None] = mapped_column(ForeignKey("proyeccion.id"), default=None)
    regla_id: Mapped[str] = mapped_column(String(80))
    severidad: Mapped[Severidad] = mapped_column(SAEnum(Severidad))
    descripcion: Mapped[str] = mapped_column(Text)
    evidencia: Mapped[str | None] = mapped_column(Text, default=None)
    ubicacion: Mapped[str | None] = mapped_column(String(200), default=None)
    estado: Mapped[EstadoHallazgo] = mapped_column(SAEnum(EstadoHallazgo), default=EstadoHallazgo.PENDIENTE)
    justificacion: Mapped[str | None] = mapped_column(Text, default=None)
    justificado_por_id: Mapped[str | None] = mapped_column(ForeignKey("usuario.id"), default=None)
    # Capa 1 (determinística) o capa 2 (agente), para distinguir en la traza.
    capa: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)

    caso: Mapped[Caso] = relationship(back_populates="hallazgos")


class Requerimiento(Base):
    __tablename__ = "requerimiento"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"))
    texto: Mapped[str] = mapped_column(Text)
    solicitado_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)
    plazo_hasta: Mapped[date] = mapped_column(Date)
    respondido_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    respuesta: Mapped[str | None] = mapped_column(Text, default=None)


class Notificacion(Base):
    __tablename__ = "notificacion"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"))
    canal: Mapped[str] = mapped_column(String(40))
    destinatario: Mapped[str] = mapped_column(String(200))
    asunto: Mapped[str | None] = mapped_column(String(300), default=None)
    cuerpo: Mapped[str | None] = mapped_column(Text, default=None)
    enviado_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    entregado_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    confirmado_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None)
    intentos: Mapped[int] = mapped_column(Integer, default=0)
    estado: Mapped[str] = mapped_column(String(40), default="pendiente")


class PublicacionRadicado(Base):
    """Outbox de la publicación en ControlDoc (§9).

    Existe para que el reintento sea idempotente: un reintento mal hecho genera
    actos administrativos duplicados, así que la clave es el caso y se consulta
    antes de volver a publicar.
    """

    __tablename__ = "publicacion_radicado"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    caso_id: Mapped[str] = mapped_column(ForeignKey("caso.id"), unique=True)
    clave_idempotencia: Mapped[str] = mapped_column(String(80), unique=True)
    radicado_externo: Mapped[str | None] = mapped_column(String(60), default=None)
    estado: Mapped[str] = mapped_column(String(40), default="pendiente")
    intentos: Mapped[int] = mapped_column(Integer, default=0)
    ultimo_error: Mapped[str | None] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora, onupdate=ahora)
