from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponse
from app.models.user import User
from app.api.deps import get_db, get_supabase_user

router = APIRouter()

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
