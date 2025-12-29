from sqlalchemy.orm import Session
from app.models.balance import BalanceEdge
from decimal import Decimal

def get_balance_edge(db: Session, from_user: int, to_user: int) -> BalanceEdge | None:
    return db.query(BalanceEdge).filter(
        BalanceEdge.from_user_id == from_user,
        BalanceEdge.to_user_id == to_user
    ).first()

def update_balance(db: Session, from_user: int, to_user: int, amount: Decimal):
    # Ensure canonical direction to avoid duplicate edges (e.g., always smaller_id -> larger_id)
    # But the user specified "from_user -> to_user" represents debt graph.
    # If A owes B 10, we have Edge(A, B, 10).
    # If we want to reduce debt, we decrease amount.
    # If amount becomes negative, we flip the edge.
    
    # Check if edge exists A->B
    edge = get_balance_edge(db, from_user, to_user)
    if edge:
        edge.amount = amount
        if edge.amount == 0:
            db.delete(edge)
        return

    # Check if edge exists B->A
    reverse_edge = get_balance_edge(db, to_user, from_user)
    if reverse_edge:
        # If we are setting A->B to X, it means B->A should be -X
        # But we usually don't set negative balances.
        # If the caller says "A owes B amount", and we have B->A, 
        # it means we should reduce B->A by amount? No.
        # This function sets the absolute state.
        # Let's make this function simpler: set the edge A->B to amount.
        # If amount is negative, it means B->A with abs(amount).
        pass
    
    if amount > 0:
        # Create or update A->B
        if reverse_edge:
            db.delete(reverse_edge) # Should not happen if logic is correct upstream, but safe to clear
        
        new_edge = BalanceEdge(from_user_id=from_user, to_user_id=to_user, amount=amount)
        db.add(new_edge)
    elif amount < 0:
        # Create or update B->A
        if edge:
            db.delete(edge)
        
        # Check reverse again just in case
        if not reverse_edge:
             reverse_edge = BalanceEdge(from_user_id=to_user, to_user_id=from_user, amount=abs(amount))
             db.add(reverse_edge)
        else:
            reverse_edge.amount = abs(amount)
            if reverse_edge.amount == 0:
                db.delete(reverse_edge)
    else:
        # amount is 0, remove both
        if edge: db.delete(edge)
        if reverse_edge: db.delete(reverse_edge)
    
    db.flush()
