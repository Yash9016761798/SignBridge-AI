"""Configuration management for SignBridge AI Service"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    model_config = {"protected_namespaces": ("settings_",), "env_file": ".env", "env_file_encoding": "utf-8", "case_sensitive": False}

    # Application
    app_name: str = "SignBridge AI Service"
    app_version: str = "0.1.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    # AI Model
    model_path: str = "./models"
    confidence_threshold: float = 0.7

    # Backend API
    backend_url: str = "http://localhost:3001"


settings = Settings()
