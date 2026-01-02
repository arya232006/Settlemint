from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User
from app.api.deps import get_db, get_supabase_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db), supabase_user = Depends(get_supabase_user)):
    user = db.query(User).filter(User.supabase_id == supabase_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserResponse)
def update_user(user_in: UserUpdate, db: Session = Depends(get_db), supabase_user = Depends(get_supabase_user)):
    user = db.query(User).filter(User.supabase_id == supabase_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.wallet_address is not None:
        user.wallet_address = user_in.wallet_address
        
    db.commit()
    db.refresh(user)
    return user

@router.post("/", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db), supabase_user = Depends(get_supabase_user)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.supabase_id == supabase_user.id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered",
        )
        
    user = User(
        name=user_in.name, 
        wallet_address=user_in.wallet_address,
        supabase_id=supabase_user.id,
        email=supabase_user.email
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
