"""API del sistema de gestión de trámites NARP (§8)."""

from __future__ import annotations

from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import metricas, prerevision, reglas
from .db import crear_tablas, sesion
from .enrutamiento import enrutar, proponer_asesor
from .esquemas import (
    Asignacion,
    CasoOut,
    Cierre,
    Clasificacion,
    ComunidadInterna,
    ComunidadPublica,
    Decision,
    EventoOut,
    HallazgoOut,
    Justificacion,
    ProyeccionIn,
    ProyeccionOut,
    RequerimientoIn,
    Revision,
    SolicitudRadicar,
    Token,
    ValidacionOut,
)
from .estados import Estado, TERMINALES, TransicionInvalida
from .habiles import sumar_habiles
from .modelos import (
    ActorTipo,
    Caso,
    Comunidad,
    Documento,
    EstadoHallazgo,
    Hallazgo,
    Proyeccion,
    Reloj,
    Requerimiento,
    Rol,
    RutaEspecial,
    TipoTramite,
    Usuario,
)
from .seguridad import (
    crear_token,
    exigir_rol,
    usuario_actual,
    usuario_opcional,
    verificar_clave,
)
from .servicio import (
    cambiar_reloj,
    dias_restantes,
    esta_vencido,
    mover,
    numero_seguimiento,
    publicar_radicado,
    radicar,
    registrar_evento,
)

app = FastAPI(
    title="RUPN NARP — API de gestión de trámites",
    description=(
        "Backend del Registro Público Único Nacional de comunidades negras, "
        "afrocolombianas, raizales y palenqueras (Ministerio del Interior)."
    ),
    version="0.1.0",
)

# El portal se sirve desde otro origen (Railway); en el MVP no restringimos.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def preparar() -> None:
    crear_tablas()


@app.exception_handler(TransicionInvalida)
def _transicion_invalida(_, exc: TransicionInvalida):
    from fastapi.responses import JSONResponse

    return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"detail": str(exc)})


# --------------------------------------------------------------------------
# Salud y autenticación
# --------------------------------------------------------------------------

@app.get("/api/salud", tags=["salud"])
def salud() -> dict:
    return {"estado": "ok"}


@app.post("/api/admin/sembrar", tags=["salud"])
def sembrar_datos(db: Session = Depends(sesion)) -> dict:
    """Carga los datos iniciales ficticios. Idempotente: si ya hay, no duplica."""
    from .seed import sembrar

    return sembrar(db)


@app.post("/api/auth/token", response_model=Token, tags=["auth"])
def entrar(
    datos: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(sesion),
) -> Token:
    usuario = db.execute(
        select(Usuario).where(Usuario.correo == datos.username)
    ).scalars().first()
    if not usuario or not usuario.activo or not verificar_clave(datos.password, usuario.clave_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Correo o contraseña incorrectos.")
    return Token(
        access_token=crear_token(usuario), nombre=usuario.nombre, roles=usuario.roles or []
    )


@app.get("/api/auth/yo", tags=["auth"])
def yo(usuario: Usuario = Depends(usuario_actual)) -> dict:
    return {"id": usuario.id, "nombre": usuario.nombre, "roles": usuario.roles or []}


# --------------------------------------------------------------------------
# Consulta pública (§10: solo campos públicos, sin cuenta)
# --------------------------------------------------------------------------

@app.get("/api/comunidades", response_model=list[ComunidadPublica], tags=["comunidades"])
def listar_comunidades(
    q: str | None = None,
    departamento: str | None = None,
    municipio: str | None = None,
    tipo: str | None = None,
    estado: str | None = None,
    db: Session = Depends(sesion),
) -> list[Comunidad]:
    consulta = select(Comunidad)
    if q:
        patron = f"%{q.lower()}%"
        consulta = consulta.where(
            Comunidad.nombre_oficial.ilike(patron) | Comunidad.municipio.ilike(patron)
        )
    if departamento:
        consulta = consulta.where(Comunidad.departamento == departamento)
    if municipio:
        consulta = consulta.where(Comunidad.municipio == municipio)
    if tipo:
        consulta = consulta.where(Comunidad.tipo == tipo)
    if estado:
        consulta = consulta.where(Comunidad.estado_registro == estado)
    return db.execute(consulta.order_by(Comunidad.nombre_oficial)).scalars().all()


@app.get("/api/comunidades/{comunidad_id}", tags=["comunidades"])
def ver_comunidad(
    comunidad_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario | None = Depends(usuario_opcional),
):
    """Ficha pública o interna según quién pregunte (§10).

    Sin cuenta salen solo los campos públicos. Con rol interno sale la ficha
    completa y el acceso queda marcado como consulta de dato restringido.
    """
    comunidad = db.get(Comunidad, comunidad_id)
    if not comunidad:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos esa comunidad.")

    internos = {Rol.ASESOR, Rol.REVISOR, Rol.MESA, Rol.CLASIFICADOR, Rol.FIRMANTE,
                Rol.COORDINADOR, Rol.ADMIN_FUNCIONAL, Rol.ADMIN_TECNICO, Rol.VENTANILLA}
    if usuario and any(usuario.tiene_rol(r) for r in internos):
        return ComunidadInterna(
            **comunidad.publico(),
            nombres_alternos=comunidad.nombres_alternos or [],
            codigo_divipola=comunidad.codigo_divipola,
            fecha_ultima_actualizacion=comunidad.fecha_ultima_actualizacion,
            representantes=[
                {
                    "id": r.id,
                    "nombre": r.nombre,
                    "vigente_desde": r.vigente_desde,
                    "vigente_hasta": r.vigente_hasta,
                    "acto_administrativo": r.acto_administrativo,
                }
                for r in comunidad.representantes
            ],
        )
    return ComunidadPublica(**comunidad.publico())


# --------------------------------------------------------------------------
# Tipos de trámite
# --------------------------------------------------------------------------

@app.get("/api/tipos-tramite", tags=["tramites"])
def tipos_tramite(db: Session = Depends(sesion)) -> list[dict]:
    tipos = db.execute(
        select(TipoTramite).where(TipoTramite.activo.is_(True))
    ).scalars().all()
    return [
        {
            "codigo": t.codigo,
            "nombre": t.nombre,
            "nombre_ciudadano": t.nombre_ciudadano,
            "termino_dias_habiles": t.termino_dias_habiles,
            "campos_requeridos": t.campos_requeridos,
            "documentos_requeridos": t.documentos_requeridos,
        }
        for t in tipos
    ]


# --------------------------------------------------------------------------
# Radicación
# --------------------------------------------------------------------------

def _tipo_o_404(db: Session, codigo: str) -> TipoTramite:
    tipo = db.execute(
        select(TipoTramite).where(TipoTramite.codigo == codigo)
    ).scalars().first()
    if not tipo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No existe el trámite '{codigo}'.")
    return tipo


@app.post("/api/casos/validar", response_model=ValidacionOut, tags=["casos"])
def validar_solicitud(datos: SolicitudRadicar, db: Session = Depends(sesion)) -> dict:
    """Valida sin persistir: la misma definición que corre el cliente (§6.1)."""
    tipo = _tipo_o_404(db, datos.tipo_tramite)
    comunidad = db.get(Comunidad, datos.comunidad_id) if datos.comunidad_id else None
    return reglas.validar(
        db, tipo=tipo, comunidad=comunidad, datos=datos.datos, documentos=datos.documentos
    ).dict()


@app.post("/api/casos", response_model=CasoOut, status_code=status.HTTP_201_CREATED, tags=["casos"])
def radicar_caso(
    datos: SolicitudRadicar,
    db: Session = Depends(sesion),
    usuario: Usuario | None = Depends(usuario_opcional),
) -> dict:
    """Radica. La validación en origen es la única compuerta que bloquea (§4.1)."""
    tipo = _tipo_o_404(db, datos.tipo_tramite)
    comunidad = db.get(Comunidad, datos.comunidad_id) if datos.comunidad_id else None

    validacion = reglas.validar(
        db, tipo=tipo, comunidad=comunidad, datos=datos.datos, documentos=datos.documentos
    )
    if not validacion.puede_radicar:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "mensaje": "La solicitud todavía no se puede radicar.",
                **validacion.dict(),
            },
        )

    caso = Caso(
        numero_seguimiento=numero_seguimiento(db),
        tipo_tramite_id=tipo.id,
        comunidad_id=comunidad.id if comunidad else None,
        canal=datos.canal,
        datos=datos.datos,
        solicitante_id=usuario.id if usuario else None,
    )
    db.add(caso)
    db.flush()

    # Los documentos que el ciudadano adjuntó quedan en el expediente: si no se
    # guardan aquí, la pre-revisión los da por faltantes y bloquea el caso.
    for tipo_doc in datos.documentos:
        db.add(Documento(caso_id=caso.id, tipo=tipo_doc, nombre_archivo=f"{tipo_doc}.pdf"))

    radicar(db, caso, actor=usuario)
    db.commit()
    return _caso_out(caso)


# --------------------------------------------------------------------------
# Consulta del caso
# --------------------------------------------------------------------------

def _caso_o_404(db: Session, id_o_numero: str) -> Caso:
    caso = db.get(Caso, id_o_numero)
    if caso is None:
        caso = db.execute(
            select(Caso).where(Caso.numero_seguimiento == id_o_numero)
        ).scalars().first()
    if caso is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos ese caso.")
    return caso


def _caso_out(caso: Caso) -> dict:
    return {
        "id": caso.id,
        "numero_seguimiento": caso.numero_seguimiento,
        "radicado_externo": caso.radicado_externo,
        "estado": caso.estado,
        "tipo_tramite": caso.tipo_tramite.nombre,
        "tipo_tramite_ciudadano": caso.tipo_tramite.nombre_ciudadano,
        "comunidad_id": caso.comunidad_id,
        "comunidad": caso.comunidad.nombre_oficial if caso.comunidad else None,
        "canal": caso.canal,
        "fecha_radicacion": caso.fecha_radicacion,
        "fecha_vencimiento": caso.fecha_vencimiento,
        "dias_restantes": dias_restantes(caso),
        "vencido": esta_vencido(caso),
        "dias_ministerio": caso.dias_ministerio,
        "dias_ciudadano": caso.dias_ciudadano,
        "reloj_activo": str(caso.reloj_activo),
        "responsable_id": caso.responsable_actual_id,
        "rol_responsable": str(caso.rol_responsable) if caso.rol_responsable else None,
        "retorno_usado": caso.retorno_usado,
        "ruta_especial": str(caso.ruta_especial),
        "sentido": caso.sentido,
        "fundamento": caso.fundamento,
        "datos": caso.datos or {},
    }


@app.get("/api/mis-solicitudes", response_model=list[CasoOut], tags=["casos"])
def mis_solicitudes(
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(usuario_actual),
) -> list[dict]:
    """Las solicitudes del ciudadano conectado, de la más reciente a la más antigua."""
    casos = db.execute(
        select(Caso)
        .where(Caso.solicitante_id == usuario.id)
        .order_by(Caso.created_at.desc())
    ).scalars().all()
    return [_caso_out(c) for c in casos]


@app.get("/api/casos/{caso_id}", response_model=CasoOut, tags=["casos"])
def ver_caso(caso_id: str, db: Session = Depends(sesion)) -> dict:
    return _caso_out(_caso_o_404(db, caso_id))


@app.get("/api/casos/{caso_id}/eventos", response_model=list[EventoOut], tags=["casos"])
def eventos_caso(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario | None = Depends(usuario_opcional),
):
    """Trazabilidad. Al ciudadano se le ocultan los retornos internos (§13.6)."""
    caso = _caso_o_404(db, caso_id)
    eventos = caso.eventos
    es_interno = usuario and not usuario.tiene_rol(Rol.CIUDADANO)
    if not es_interno:
        eventos = [e for e in eventos if e.visible_ciudadano]
    return [
        {
            "timestamp": e.timestamp,
            "actor_nombre": e.actor_nombre,
            "actor_tipo": str(e.actor_tipo),
            "estado_origen": e.estado_origen,
            "estado_destino": e.estado_destino,
            "motivo": e.motivo,
            "sugerencia_ia": e.sugerencia_ia if es_interno else None,
            "decision_humana": e.decision_humana if es_interno else None,
        }
        for e in eventos
    ]


@app.get("/api/casos/{caso_id}/expediente", tags=["casos"])
def expediente(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR, Rol.MESA, Rol.REVISOR, Rol.COORDINADOR)),
) -> dict:
    """Antecedentes de la comunidad, armados automáticamente (§6.3)."""
    caso = _caso_o_404(db, caso_id)
    if not caso.comunidad_id:
        return {"antecedentes": [], "representantes": []}

    antecedentes = db.execute(
        select(Caso)
        .where(Caso.comunidad_id == caso.comunidad_id)
        .where(Caso.id != caso.id)
        .order_by(Caso.created_at.desc())
    ).scalars().all()

    registrar_evento(
        db, caso,
        motivo="Consulta del expediente de la comunidad.",
        actor=usuario, dato_restringido=True, visible_ciudadano=False,
    )
    db.commit()

    return {
        "antecedentes": [
            {
                "numero_seguimiento": a.numero_seguimiento,
                "tipo": a.tipo_tramite.nombre,
                "estado": str(a.estado),
                "fecha": a.fecha_radicacion,
            }
            for a in antecedentes
        ],
        "representantes": [
            {
                "nombre": r.nombre,
                "vigente_desde": r.vigente_desde,
                "vigente_hasta": r.vigente_hasta,
                "acto_administrativo": r.acto_administrativo,
            }
            for r in (caso.comunidad.representantes if caso.comunidad else [])
        ],
    }


# --------------------------------------------------------------------------
# Bandejas
# --------------------------------------------------------------------------

_ESTADOS_POR_ROL = {
    Rol.CLASIFICADOR: [Estado.RADICADO],
    Rol.MESA: [Estado.CLASIFICADO],
    Rol.ASESOR: [Estado.ASIGNADO, Estado.EN_ANALISIS, Estado.PROYECTADO],
    Rol.REVISOR: [Estado.EN_PRE_REVISION, Estado.EN_REVISION],
    Rol.FIRMANTE: [Estado.APROBADO, Estado.PENDIENTE_RADICACION],
    Rol.VENTANILLA: [Estado.RECIBIDO],
}


@app.get("/api/bandejas/{rol}", tags=["bandejas"])
def bandeja(
    rol: Rol,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(usuario_actual),
    solo_mios: bool = Query(False),
) -> list[dict]:
    """Bandeja del rol, del más antiguo al más reciente."""
    estados = _ESTADOS_POR_ROL.get(rol)
    if not estados:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"No hay bandeja para el rol {rol}.")

    consulta = select(Caso).where(Caso.estado.in_(estados))
    if solo_mios or rol is Rol.ASESOR:
        consulta = consulta.where(Caso.responsable_actual_id == usuario.id)

    casos = db.execute(consulta.order_by(Caso.fecha_radicacion)).scalars().all()
    return [
        {
            **_caso_out(c),
            # Marca de retorno para la bandeja del asesor (P9 del diseño).
            "tiene_retorno": c.retorno_usado,
        }
        for c in casos
    ]


# --------------------------------------------------------------------------
# Clasificación y asignación
# --------------------------------------------------------------------------

@app.post("/api/casos/{caso_id}/clasificar", response_model=CasoOut, tags=["flujo"])
def clasificar(
    caso_id: str,
    datos: Clasificacion,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.CLASIFICADOR, Rol.MESA, Rol.COORDINADOR)),
) -> dict:
    """El humano confirma o corrige; el enrutamiento por competencia es automático."""
    caso = _caso_o_404(db, caso_id)
    ruta = enrutar(tipologia=datos.tipologia or datos.categoria, asunto=datos.asunto)

    caso.ruta_especial = ruta.ruta
    caso.datos = {**(caso.datos or {}), "categoria": datos.categoria}

    if not ruta.es_competencia:
        # §6.2: lo que no es competencia se desvía apenas se clasifica.
        mover(
            db, caso, Estado.TRASLADADO,
            motivo=f"{ruta.motivo} Destino: {ruta.destino}.",
            actor=usuario,
            sugerencia_ia=ruta.dict(),
            decision_humana={"categoria": datos.categoria, "corregida": datos.corregida},
        )
        db.commit()
        return _caso_out(caso)

    mover(
        db, caso, Estado.CLASIFICADO,
        motivo=f"Clasificado como «{datos.categoria}»." + (f" {datos.motivo}" if datos.motivo else ""),
        actor=usuario,
        sugerencia_ia=ruta.dict(),
        decision_humana={"categoria": datos.categoria, "corregida": datos.corregida},
    )
    db.commit()
    return _caso_out(caso)


@app.get("/api/casos/{caso_id}/propuesta-asesor", tags=["flujo"])
def propuesta_asesor(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.MESA, Rol.COORDINADOR)),
) -> dict:
    """El sistema propone con justificación; la mesa decide (§4.3)."""
    return proponer_asesor(db, _caso_o_404(db, caso_id)).dict()


@app.post("/api/casos/{caso_id}/asignar", response_model=CasoOut, tags=["flujo"])
def asignar(
    caso_id: str,
    datos: Asignacion,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.MESA, Rol.COORDINADOR)),
) -> dict:
    caso = _caso_o_404(db, caso_id)
    propuesta = proponer_asesor(db, caso)

    asesor = db.get(Usuario, datos.asesor_id) if datos.asesor_id else propuesta.asesor
    if asesor is None:
        # Nunca queda en una bandeja genérica sin dueño (§13.7).
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={"mensaje": "No hay asesor elegible.", "alerta": propuesta.alerta},
        )

    mover(
        db, caso, Estado.ASIGNADO,
        motivo=f"Asignado a {asesor.nombre}." + (f" {datos.motivo}" if datos.motivo else ""),
        actor=usuario,
        responsable=asesor,
        sugerencia_ia=propuesta.dict(),
        decision_humana={"asesor_id": asesor.id, "acepto_propuesta": asesor.id == (propuesta.asesor.id if propuesta.asesor else None)},
    )
    db.commit()
    return _caso_out(caso)


# --------------------------------------------------------------------------
# Asesor: decisión y proyección
# --------------------------------------------------------------------------

@app.post("/api/casos/{caso_id}/decision", response_model=CasoOut, tags=["flujo"])
def registrar_decision(
    caso_id: str,
    datos: Decision,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR)),
) -> dict:
    """El asesor registra sentido y fundamento ANTES de que exista borrador (§13.2)."""
    caso = _caso_o_404(db, caso_id)
    if caso.estado is Estado.ASIGNADO:
        mover(db, caso, Estado.EN_ANALISIS, motivo="El asesor tomó el caso.",
              actor=usuario, responsable=usuario)

    caso.sentido = datos.sentido
    caso.fundamento = datos.fundamento
    registrar_evento(
        db, caso,
        motivo=f"El asesor registró el sentido: {datos.sentido}.",
        actor=usuario,
        decision_humana={"sentido": datos.sentido, "fundamento": datos.fundamento},
    )
    db.commit()
    return _caso_out(caso)


@app.post("/api/casos/{caso_id}/proyeccion", response_model=ProyeccionOut, tags=["flujo"])
def generar_proyeccion(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR)),
) -> dict:
    """Genera el borrador. Exige que la decisión esté registrada (§13.2)."""
    caso = _caso_o_404(db, caso_id)
    if not caso.sentido or not caso.fundamento:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Primero registra el sentido y el fundamento de la decisión. "
            "El sistema redacta, pero no decide.",
        )

    version = len(caso.proyecciones) + 1
    contenido, marcadores = _redactar(caso)
    proy = Proyeccion(
        caso_id=caso.id,
        version=version,
        contenido=contenido,
        generado_por_ia=True,
        marcadores_pendientes=marcadores,
        autor_id=usuario.id,
    )
    db.add(proy)

    if caso.estado is Estado.EN_ANALISIS:
        mover(db, caso, Estado.PROYECTADO, motivo=f"Proyección versión {version} generada.",
              actor=usuario, responsable=usuario,
              sugerencia_ia={"marcadores_pendientes": marcadores})
    db.commit()
    return {
        "id": proy.id, "version": proy.version, "contenido": proy.contenido,
        "generado_por_ia": proy.generado_por_ia,
        "marcadores_pendientes": proy.marcadores_pendientes,
    }


def _redactar(caso: Caso) -> tuple[str, list[str]]:
    """Borrador a partir de la plantilla del trámite.

    Deja marcadores [VERIFICAR: ...] donde falta un dato, en vez de inventarlo:
    el sistema llena lo que sabe y señala lo que no.
    """
    datos = caso.datos or {}
    comunidad = caso.comunidad.nombre_oficial if caso.comunidad else "[VERIFICAR: comunidad]"
    marcadores: list[str] = []

    def campo(clave: str, etiqueta: str) -> str:
        valor = datos.get(clave)
        if valor:
            return str(valor)
        marcadores.append(f"Falta {etiqueta}.")
        return f"[VERIFICAR: {etiqueta}]"

    plantilla = caso.tipo_tramite.plantilla_acto or (
        "RESOLUCIÓN\n\n"
        "Por la cual se resuelve la solicitud {numero} presentada por {comunidad}.\n\n"
        "CONSIDERANDO:\n\n"
        "Que {comunidad}, inscrita en el Registro Público Único Nacional, presentó "
        "solicitud de {tramite} el {fecha_radicacion}.\n\n"
        "Que se aportó acta de asamblea de fecha {fecha_acta}, en la que consta la "
        "designación de {representante}.\n\n"
        "Que revisados los requisitos, el sentido de la decisión es {sentido}, con "
        "fundamento en: {fundamento}\n\n"
        "RESUELVE:\n\n"
        "ARTÍCULO PRIMERO: Inscribir en el registro la novedad solicitada.\n"
        "ARTÍCULO SEGUNDO: Notificar la presente decisión al solicitante."
    )

    texto = plantilla.format(
        numero=caso.numero_seguimiento,
        comunidad=comunidad,
        tramite=caso.tipo_tramite.nombre.lower(),
        fecha_radicacion=(caso.fecha_radicacion.strftime("%d/%m/%Y") if caso.fecha_radicacion else "[VERIFICAR: fecha de radicación]"),
        fecha_acta=campo("fecha_acta", "la fecha del acta"),
        representante=campo("representante_nombre", "el nombre del representante"),
        sentido=caso.sentido or "[VERIFICAR: sentido]",
        fundamento=caso.fundamento or "[VERIFICAR: fundamento]",
    )
    return texto, marcadores


@app.put("/api/casos/{caso_id}/proyeccion", response_model=ProyeccionOut, tags=["flujo"])
def editar_proyeccion(
    caso_id: str,
    datos: ProyeccionIn,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR)),
) -> dict:
    caso = _caso_o_404(db, caso_id)
    version = len(caso.proyecciones) + 1
    proy = Proyeccion(
        caso_id=caso.id, version=version, contenido=datos.contenido,
        generado_por_ia=False,  # la editó una persona
        marcadores_pendientes=datos.marcadores_pendientes, autor_id=usuario.id,
    )
    db.add(proy)
    registrar_evento(db, caso, motivo=f"Proyección editada (versión {version}).", actor=usuario)
    db.commit()
    return {
        "id": proy.id, "version": proy.version, "contenido": proy.contenido,
        "generado_por_ia": proy.generado_por_ia,
        "marcadores_pendientes": proy.marcadores_pendientes,
    }


# --------------------------------------------------------------------------
# Pre-revisión
# --------------------------------------------------------------------------

@app.post("/api/casos/{caso_id}/pre-revision", tags=["flujo"])
def ejecutar_pre_revision(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR, Rol.REVISOR)),
) -> dict:
    """Verificaciones y hallazgos. Nunca veredicto ni puntaje (§6.4, §13.1)."""
    caso = _caso_o_404(db, caso_id)
    salida = prerevision.ejecutar(db, caso)

    # Los hallazgos quedan guardados para poder justificarlos uno a uno.
    db.query(Hallazgo).filter(
        Hallazgo.caso_id == caso.id, Hallazgo.estado == EstadoHallazgo.PENDIENTE
    ).delete()
    for h in salida.hallazgos:
        db.add(Hallazgo(
            caso_id=caso.id, regla_id=h["regla_id"], severidad=h["severidad"],
            descripcion=h["descripcion"], evidencia=h.get("evidencia"),
            ubicacion=h.get("ubicacion"), capa=h.get("capa", 1),
        ))

    if caso.estado is Estado.PROYECTADO:
        mover(db, caso, Estado.EN_PRE_REVISION,
              motivo=f"Enviado a pre-revisión: {len(salida.hallazgos)} hallazgos.",
              actor=usuario, sugerencia_ia=salida.dict())
    db.commit()

    return {
        **salida.dict(),
        "hallazgos_guardados": [
            {
                "id": h.id, "regla_id": h.regla_id, "severidad": str(h.severidad),
                "descripcion": h.descripcion, "evidencia": h.evidencia,
                "ubicacion": h.ubicacion, "estado": str(h.estado), "capa": h.capa,
            }
            for h in db.execute(select(Hallazgo).where(Hallazgo.caso_id == caso.id)).scalars().all()
        ],
    }


@app.get("/api/casos/{caso_id}/hallazgos", response_model=list[HallazgoOut], tags=["flujo"])
def listar_hallazgos(caso_id: str, db: Session = Depends(sesion)) -> list[dict]:
    caso = _caso_o_404(db, caso_id)
    return [
        {
            "id": h.id, "regla_id": h.regla_id, "severidad": h.severidad,
            "descripcion": h.descripcion, "evidencia": h.evidencia,
            "ubicacion": h.ubicacion, "estado": str(h.estado), "capa": h.capa,
        }
        for h in caso.hallazgos
    ]


@app.post("/api/casos/{caso_id}/hallazgos/{hallazgo_id}/justificar", tags=["flujo"])
def justificar_hallazgo(
    caso_id: str,
    hallazgo_id: str,
    datos: Justificacion,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR)),
) -> dict:
    caso = _caso_o_404(db, caso_id)
    hallazgo = db.get(Hallazgo, hallazgo_id)
    if not hallazgo or hallazgo.caso_id != caso.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontramos ese hallazgo.")

    hallazgo.estado = EstadoHallazgo.JUSTIFICADO
    hallazgo.justificacion = datos.justificacion
    hallazgo.justificado_por_id = usuario.id
    registrar_evento(
        db, caso,
        motivo=f"Hallazgo «{hallazgo.regla_id}» justificado.",
        actor=usuario,
        decision_humana={"hallazgo": hallazgo.regla_id, "justificacion": datos.justificacion},
    )
    db.commit()
    return {"id": hallazgo.id, "estado": str(hallazgo.estado)}


# --------------------------------------------------------------------------
# Revisión, firma y cierre
# --------------------------------------------------------------------------

@app.post("/api/casos/{caso_id}/revisar", response_model=CasoOut, tags=["flujo"])
def revisar(
    caso_id: str,
    datos: Revision,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.REVISOR, Rol.COORDINADOR)),
) -> dict:
    """Decisión humana. El retorno al asesor solo procede una vez (§4.5)."""
    caso = _caso_o_404(db, caso_id)

    if caso.estado is Estado.EN_PRE_REVISION:
        mover(db, caso, Estado.EN_REVISION, motivo="En revisión.", actor=usuario,
              responsable=usuario)

    if datos.accion == "aprobar":
        bloqueantes = [
            h for h in caso.hallazgos
            if h.severidad == "bloqueante" and h.estado == EstadoHallazgo.PENDIENTE
        ]
        if bloqueantes:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                f"Quedan {len(bloqueantes)} hallazgos bloqueantes sin atender.",
            )
        mover(db, caso, Estado.APROBADO, motivo=datos.motivo, actor=usuario,
              decision_humana={"accion": "aprobar", "motivo": datos.motivo})

    elif datos.accion == "devolver":
        # La máquina de estados rechaza el segundo retorno.
        mover(db, caso, Estado.EN_ANALISIS, motivo=datos.motivo, actor=usuario,
              decision_humana={"accion": "devolver", "motivo": datos.motivo})

    elif datos.accion == "cambiar_sentido":
        anterior = caso.sentido
        caso.sentido = datos.nuevo_sentido
        registrar_evento(
            db, caso,
            motivo=f"El revisor cambió el sentido de {anterior} a {datos.nuevo_sentido}. {datos.motivo}",
            actor=usuario,
            decision_humana={"accion": "cambiar_sentido", "de": anterior, "a": datos.nuevo_sentido},
        )
    else:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Acción desconocida: {datos.accion}")

    db.commit()
    return _caso_out(caso)


@app.post("/api/casos/{caso_id}/firmar", response_model=CasoOut, tags=["flujo"])
def firmar(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.FIRMANTE)),
) -> dict:
    """Firma y publica el radicado. La publicación es idempotente (§9)."""
    caso = _caso_o_404(db, caso_id)
    pub = publicar_radicado(db, caso)

    if pub.estado != "publicado":
        # El documental no respondió: el caso espera, no se pierde ni se duplica.
        if caso.estado is Estado.APROBADO:
            mover(db, caso, Estado.PENDIENTE_RADICACION,
                  motivo="El sistema documental no respondió. El radicado queda pendiente.",
                  actor=usuario, responsable=usuario)
        db.commit()
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "mensaje": "El sistema documental no respondió. El caso queda pendiente de "
                           "radicación y puedes reintentar; el reintento no duplica el acto.",
                "intentos": pub.intentos,
            },
        )

    mover(db, caso, Estado.FIRMADO,
          motivo=f"Acto firmado y radicado como {pub.radicado_externo}.",
          actor=usuario,
          decision_humana={"firmado_por": usuario.nombre, "radicado": pub.radicado_externo})
    db.commit()
    return _caso_out(caso)


@app.post("/api/casos/{caso_id}/notificar", response_model=CasoOut, tags=["flujo"])
def notificar(
    caso_id: str,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.FIRMANTE, Rol.COORDINADOR)),
) -> dict:
    caso = _caso_o_404(db, caso_id)
    mover(db, caso, Estado.NOTIFICADO, motivo="Notificación enviada al solicitante.", actor=usuario)
    db.commit()
    return _caso_out(caso)


_TERMINALES = {
    "favorable": Estado.CERRADO_FAVORABLE,
    "desfavorable": Estado.CERRADO_DESFAVORABLE,
    "desistida": Estado.DESISTIDO,
    "archivada": Estado.ARCHIVADO,
    "trasladada": Estado.TRASLADADO,
}


@app.post("/api/casos/{caso_id}/cerrar", response_model=CasoOut, tags=["flujo"])
def cerrar(
    caso_id: str,
    datos: Cierre,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.REVISOR, Rol.COORDINADOR, Rol.FIRMANTE)),
) -> dict:
    """Cierra con estado terminal y su motivación (§5)."""
    caso = _caso_o_404(db, caso_id)
    destino = _TERMINALES.get(datos.estado_terminal)
    if destino is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Estado terminal desconocido: {datos.estado_terminal}.",
        )
    mover(db, caso, destino, motivo=datos.motivacion, actor=usuario,
          decision_humana={"estado_terminal": datos.estado_terminal, "motivacion": datos.motivacion})
    db.commit()
    return _caso_out(caso)


@app.post("/api/casos/{caso_id}/requerimiento", response_model=CasoOut, tags=["flujo"])
def crear_requerimiento(
    caso_id: str,
    datos: RequerimientoIn,
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.ASESOR)),
) -> dict:
    """Rama excepcional: pasa el reloj al ciudadano (§6.5)."""
    caso = _caso_o_404(db, caso_id)
    plazo = sumar_habiles(date.today(), datos.dias_habiles)

    db.add(Requerimiento(caso_id=caso.id, texto=datos.texto, plazo_hasta=plazo))
    mover(db, caso, Estado.REQUERIMIENTO_CIUDADANO,
          motivo=f"Requerimiento al ciudadano. Plazo hasta el {plazo:%d/%m/%Y}.",
          actor=usuario, responsable=usuario)
    # El reloj del Ministerio se detiene y corre el del ciudadano.
    cambiar_reloj(caso, Reloj.CIUDADANO)
    db.commit()
    return _caso_out(caso)


# --------------------------------------------------------------------------
# Métricas
# --------------------------------------------------------------------------

@app.get("/api/metricas/tablero", tags=["metricas"])
def tablero(
    db: Session = Depends(sesion),
    usuario: Usuario = Depends(exigir_rol(Rol.COORDINADOR, Rol.MESA, Rol.ADMIN_FUNCIONAL, Rol.ADMIN_TECNICO)),
) -> dict:
    return metricas.tablero(db)


@app.get("/api/metricas/simulacion", tags=["metricas"])
def simulacion(caso_id: str | None = None, db: Session = Depends(sesion)) -> dict:
    """Endpoint clave del MVP: sistema nuevo contra la línea base real (§8)."""
    caso = _caso_o_404(db, caso_id) if caso_id else None
    return metricas.simulacion(db, caso=caso)
