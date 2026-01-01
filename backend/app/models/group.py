from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.db.base import Base

group_members = Table(
    "group_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
    Column("group_id", Integer, ForeignKey("group.id"), primary_key=True),
)

class Group(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    
    members = relationship("User", secondary=group_members, backref="groups")
    expenses = relationship("Expense", back_populates="group")
