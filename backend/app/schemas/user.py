from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    name: str
    wallet_address: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    wallet_address: Optional[str]

    class Config:
        from_attributes = True
