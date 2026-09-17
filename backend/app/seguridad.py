"""Autenticación por JWT y autorización por rol (§7).

Un usuario puede tener varios roles y no se duplican cuentas, así que el token
lleva la lista y las rutas exigen "alguno de estos roles".
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import bcrypt
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import config
from .db import sesion
from .modelos import Rol, Usuario

_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

ALGORITMO = "HS256"


def hashear(clave: str) -> str:
    # bcrypt trunca en 72 bytes; recortamos explícitamente para no depender de eso.
    return bcrypt.hashpw(clave.encode()[:72], bcrypt.gensalt()).decode()


def verificar_clave(clave: str, hash_: str) -> bool:
    try:
        return bcrypt.checkpw(clave.encode()[:72], hash_.encode())
    except ValueError:
        return False


def crear_token(usuario: Usuario) -> str:
    expira = datetime.now(timezone.utc) + timedelta(hours=config().jwt_horas)
    datos = {
        "sub": usuario.id,
        "nombre": usuario.nombre,
        "roles": usuario.roles or [],
        "exp": expira,
    }
    return jwt.encode(datos, config().jwt_secret, algorithm=ALGORITMO)


def usuario_opcional(
    token: str | None = Depends(_oauth2),
    db: Session = Depends(sesion),
) -> Usuario | None:
    """Para el portal público: si hay token lo usa, si no, sigue sin cuenta."""
    if not token:
        return None
    try:
        datos = jwt.decode(token, config().jwt_secret, algorithms=[ALGORITMO])
    except JWTError:
        return None
    return db.get(Usuario, datos.get("sub"))


def usuario_actual(
    token: str | None = Depends(_oauth2),
    db: Session = Depends(sesion),
) -> Usuario:
    no_autorizado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Necesitas iniciar sesión.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise no_autorizado
    try:
        datos = jwt.decode(token, config().jwt_secret, algorithms=[ALGORITMO])
    except JWTError:
        raise no_autorizado

    usuario = db.get(Usuario, datos.get("sub"))
    if usuario is None or not usuario.activo:
        raise no_autorizado
    return usuario


def exigir_rol(*roles: Rol):
    """Dependencia que restringe una ruta a ciertos roles."""

    def comprobar(usuario: Usuario = Depends(usuario_actual)) -> Usuario:
        if not any(usuario.tiene_rol(r) for r in roles):
            nombres = ", ".join(r.value for r in roles)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Esta acción requiere uno de estos roles: {nombres}.",
            )
        return usuario

    return comprobar
