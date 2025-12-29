from pydantic import BaseModel
from decimal import Decimal
from app.models.payment import PaymentStatus, PaymentMethod
from datetime import datetime
from typing import Optional

class PaymentCreate(BaseModel):
    from_user_id: int
    to_user_id: int
    amount: Decimal
    method: PaymentMethod = PaymentMethod.MANUAL

class PaymentResponse(BaseModel):
    id: int
    from_user_id: int
    to_user_id: int
    amount: Decimal
    status: PaymentStatus
    method: PaymentMethod
    created_at: datetime

    class Config:
        from_attributes = True
