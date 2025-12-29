from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class SettlementProof(BaseModel):
    payment_id: int
    settlement_hash: str
    transaction_hash: str
    timestamp: datetime
