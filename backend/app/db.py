from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import config
from .modelos import Base

_url = config().url_sqlalchemy()
# check_same_thread solo aplica a SQLite, que es el modo local.
_args = {"check_same_thread": False} if _url.startswith("sqlite") else {}
motor = create_engine(_url, connect_args=_args, pool_pre_ping=True)
Sesion = sessionmaker(bind=motor, autoflush=False, expire_on_commit=False)


def crear_tablas() -> None:
    Base.metadata.create_all(motor)


def sesion() -> Iterator[Session]:
    db = Sesion()
    try:
        yield db
    finally:
        db.close()
