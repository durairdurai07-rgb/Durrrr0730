from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str
    secret_key: str
    access_token_minutes: int = 30
    refresh_token_days: int = 14
    cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"
    reset_token_minutes: int = 30
    # "console" logs the email (development only). "smtp" sends it for real.
    email_backend: str = "console"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = "MY DAY <no-reply@localhost>"


settings = Settings()
