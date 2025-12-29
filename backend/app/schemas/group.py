from pydantic import BaseModel
from typing import List, Optional

class GroupCreate(BaseModel):
    name: str
    member_ids: List[int]

class GroupResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True
