from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Railway inyecta DATABASE_URL al enlazar Postgres. En local, SQLite basta
    # para correr el recorrido completo sin levantar un servidor.
    database_url: str = "sqlite:///./rupn.db"

    jwt_secret: str = "cambiar-en-produccion"
    jwt_horas: int = 12

    # Término por defecto cuando el tipo de trámite no fija uno propio (§2).
    termino_dias_habiles: int = 15

    # Los mocks de §11: se pueden forzar a fallar para demostrar la tolerancia.
    controldoc_falla: bool = False

    # Gemini, para el OCR y el verificador de coherencia. Sin clave, esas piezas
    # quedan desactivadas y el trámite sigue por vía manual: ningún componente de
    # IA puede detener un caso.
    gemini_api_key: str = ""
    gemini_modelo: str = "gemini-3.6-flash"

    @property
    def hay_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    def url_sqlalchemy(self) -> str:
        # Railway entrega postgres://, que SQLAlchemy 2 ya no acepta.
        url = self.database_url
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def config() -> Config:
    return Config()
