import enum
from sqlalchemy import Column, Integer, ForeignKey, Numeric, Enum, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"

class PaymentMethod(str, enum.Enum):
    MANUAL = "manual"   # Cash, Venmo (Requires Receiver Confirmation)
    IN_APP = "in_app"   # Stripe, Crypto (Auto-Confirmed by System)

class Payment(Base):
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("user.id"))
    to_user_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    method = Column(Enum(PaymentMethod), default=PaymentMethod.MANUAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
