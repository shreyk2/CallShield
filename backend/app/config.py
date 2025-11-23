"""Application configuration"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "CallShield"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Audio settings
    sample_rate: int = 16000
    audio_chunk_size: int = 16000  # 1 second at 16kHz
    
    # Speaker verification
    embedding_model: str = "speechbrain/spkrec-ecapa-voxceleb"
    match_threshold: float = 0.8  # Cosine similarity threshold for SAFE
    
    # Deepfake detection - Aurigin.AI (active)
    fake_threshold: float = 0.2  # Probability threshold for SAFE
    aurigin_api_url: str = "https://aurigin.ai/api-ext"
    aurigin_api_key: str = ""
    
    # Deepfake detection - Undetectable.AI (backup)
    undetectable_api_url: str = ""
    undetectable_api_key: str = ""
    undetectable_user_id: str = ""
    
    # Session management
    max_sessions: int = 100
    session_timeout_seconds: int = 300
    
    # Data paths
    data_dir: str = "../data"
    enrollments_dir: str = "../data/enrollments"
    embeddings_dir: str = "../data/embeddings"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
