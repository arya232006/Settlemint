from typing import List
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.schemas.group import GroupCreate, GroupResponse, GroupDetailResponse, AddMemberRequest, BalanceResponse
from app.models.group import Group
from app.models.user import User
from app.models.balance import BalanceEdge
from app.api.deps import get_current_user, get_db

router = APIRouter()

@router.get("/{group_id}/balances", response_model=List[BalanceResponse])
def get_group_balances(group_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user not in group.members:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    member_ids = [m.id for m in group.members]
    
    # Find balances where both users are in the group
    balances = db.query(BalanceEdge).filter(
        BalanceEdge.from_user_id.in_(member_ids),
        BalanceEdge.to_user_id.in_(member_ids),
        BalanceEdge.amount > 0
    ).all()
    
    return balances

@router.post("/{group_id}/members", response_model=GroupDetailResponse)
def add_member(group_id: int, request: AddMemberRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user not in group.members:
        raise HTTPException(status_code=403, detail="Not a member of this group")
        
    user_to_add = db.query(User).filter(User.email == request.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User with this email not found")
        
    if user_to_add in group.members:
        raise HTTPException(status_code=400, detail="User already in group")
        
    group.members.append(user_to_add)
    db.commit()
    db.refresh(group)
    return group

@router.get("/{group_id}", response_model=GroupDetailResponse)
def read_group(group_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is a member
    if current_user not in group.members:
        raise HTTPException(status_code=403, detail="Not a member of this group")
        
    return group

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
