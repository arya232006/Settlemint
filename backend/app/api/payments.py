from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.payments import create_payment, confirm_payment

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PaymentResponse)
def create_new_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    return create_payment(db, payment)

@router.post("/{payment_id}/confirm", response_model=PaymentResponse)
def confirm_existing_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = confirm_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment
