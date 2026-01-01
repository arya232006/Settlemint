from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal

class UserBase(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

class ExpenseSplitResponse(BaseModel):
    user_id: int
    amount: Decimal
    user: UserBase

    class Config:
        from_attributes = True

class ExpenseResponse(BaseModel):
    id: int
    group_id: int
    paid_by_id: int
    amount: Decimal
    paid_by: UserBase
    splits: List[ExpenseSplitResponse] = []

    class Config:
        from_attributes = True

class GroupCreate(BaseModel):
    name: str
    member_ids: List[int]

class GroupResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class GroupDetailResponse(GroupResponse):
    members: List[UserBase]
    expenses: List[ExpenseResponse] = []

class AddMemberRequest(BaseModel):
    email: str

class BalanceResponse(BaseModel):
    from_user: UserBase
    to_user: UserBase
    amount: Decimal

    class Config:
        from_attributes = True

