from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.group import GroupCreate, GroupResponse
from app.models.group import Group
from app.models.user import User

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=GroupResponse)
def create_group(group_in: GroupCreate, db: Session = Depends(get_db)):
    group = Group(name=group_in.name)
    
    # Add members
    for user_id in group_in.member_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            group.members.append(user)
            
    db.add(group)
    db.commit()
    db.refresh(group)
    return group
