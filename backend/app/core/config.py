from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings."""
    # Application
    APP_NAME: str = "Heart Sync"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./health_sync.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 36000  # 10 hours
    KEY_ROTATION_INTERVAL: int = 36000  # 24 hours in seconds
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Storage
    STORAGE_PATH: str = "./storage"
    MODEL_PATH: str = "./models"
    
    # Debug
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields in .env

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()

