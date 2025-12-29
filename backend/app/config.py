from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Expense Settlement System"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "settlemint"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    # Redis settings
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Blockchain settings
    ETHEREUM_NODE_URL: str = "http://localhost:8545"
    SETTLEMENT_CONTRACT_ADDRESS: Optional[str] = None
    PRIVATE_KEY: Optional[str] = None

    class Config:
        case_sensitive = True
        # Look for .env file in the backend root directory
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "backend", ".env")
        extra = "ignore"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
