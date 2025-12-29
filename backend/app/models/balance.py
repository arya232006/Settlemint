from sqlalchemy import Column, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base

class BalanceEdge(Base):
    id = Column(Integer, primary_key=True, index=True)
    from_user_id = Column(Integer, ForeignKey("user.id"))
    to_user_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    
    from_user = relationship("User", foreign_keys=[from_user_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
