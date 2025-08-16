from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Document Analyzer"

    # CORS settings
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Database settings
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/document_analyzer"
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-here"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # File storage settings
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB

    # LLM settings
    GOOGLE_API_KEY: str 
    LANGSMITH_API_KEY: str
    LANGSMITH_PROJECT: str = "ai-document-analysis"
    LANGSMITH_TRACING: bool = True
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
