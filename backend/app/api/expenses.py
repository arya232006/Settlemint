from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.models.expense import Expense, ExpenseSplit
from app.services.reconciliation import reconcile_expense
from app.api.deps import get_current_user, get_db

router = APIRouter()

@router.post("/", response_model=ExpenseResponse)
def create_new_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Create Expense
    expense = Expense(
        group_id=expense_in.group_id,
        paid_by_id=expense_in.paid_by_id,
        amount=expense_in.amount
    )
    db.add(expense)
    db.flush() # Get ID
    
    # Create Splits
    for split_in in expense_in.splits:
        split = ExpenseSplit(
            expense_id=expense.id,
            user_id=split_in.user_id,
            amount=split_in.amount
        )
        db.add(split)
    
    db.commit()
    db.refresh(expense)
    
    # Reconcile balances immediately (Expenses create debts)
    reconcile_expense(db, expense)
    db.commit()
    
    return expense
