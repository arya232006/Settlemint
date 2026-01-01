from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.group import GroupCreate, GroupResponse
from app.models.group import Group
from app.models.user import User
from app.api.deps import get_current_user, get_db

router = APIRouter()

@router.get("/", response_model=List[GroupResponse])
def read_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Return groups where the current user is a member
    return current_user.groups

@router.post("/", response_model=GroupResponse)
def create_group(group_in: GroupCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    group = Group(name=group_in.name)
    
    # Add creator as member
    group.members.append(current_user)
    
    # Add other members
    for user_id in group_in.member_ids:
        # Avoid adding creator twice
        if user_id != current_user.id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                group.members.append(user)
            
    db.add(group)
    db.commit()
    db.refresh(group)
    return group
