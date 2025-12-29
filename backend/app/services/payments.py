from sqlalchemy.orm import Session
from app.models.payment import Payment, PaymentStatus, PaymentMethod
from app.schemas.payment import PaymentCreate
from app.services.reconciliation import reconcile_payment
from app.workers.settlement_writer import write_settlement_to_blockchain

def create_payment(db: Session, payment_in: PaymentCreate) -> Payment:
    payment = Payment(
        from_user_id=payment_in.from_user_id,
        to_user_id=payment_in.to_user_id,
        amount=payment_in.amount,
        status=PaymentStatus.PENDING,
        method=payment_in.method
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Logic: If In-App, we simulate auto-confirmation
    if payment.method == PaymentMethod.IN_APP:
        # In a real app, this would happen after Stripe/Crypto webhook callback
        # For now, we simulate instant success
        confirm_payment(db, payment.id)
        db.refresh(payment)
        
    return payment

def confirm_payment(db: Session, payment_id: int) -> Payment | None:
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        return None
        
    if payment.status != PaymentStatus.PENDING:
        return payment # Already confirmed or rejected
        
    payment.status = PaymentStatus.CONFIRMED
    
    # Reconcile balances
    reconcile_payment(db, payment)
    
    db.commit()
    db.refresh(payment)
    
    # Trigger async settlement writing
    write_settlement_to_blockchain.delay(payment.id)
    
    return payment
