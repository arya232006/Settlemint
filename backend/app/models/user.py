from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    wallet_address = Column(String, nullable=True)
