from pydantic import BaseModel
from typing import List
from decimal import Decimal

class ExpenseSplitCreate(BaseModel):
    user_id: int
    amount: Decimal

class ExpenseCreate(BaseModel):
    group_id: int
    paid_by_id: int
    amount: Decimal
    splits: List[ExpenseSplitCreate]

class ExpenseResponse(BaseModel):
    id: int
    group_id: int
    paid_by_id: int
    amount: Decimal
    
    class Config:
        from_attributes = True
