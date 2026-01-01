from sqlalchemy import Column, Integer, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from app.db.base import Base

class Expense(Base):
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group.id"))
    paid_by_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    
    paid_by = relationship("User", foreign_keys=[paid_by_id])
    group = relationship("Group", back_populates="expenses")
    splits = relationship("ExpenseSplit", back_populates="expense")

class ExpenseSplit(Base):
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expense.id"))
    user_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Numeric(10, 2), nullable=False)
    
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")
