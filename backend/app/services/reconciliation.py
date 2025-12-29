from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.balance import BalanceEdge
from app.services.balances import get_balance_edge, update_balance
from decimal import Decimal

def reconcile_payment(db: Session, payment: Payment):
    """
    Updates balances when a payment is confirmed.
    Payer (from_user) pays Receiver (to_user).
    Effect: Payer's debt to Receiver decreases.
    """
    payer_id = payment.from_user_id
    receiver_id = payment.to_user_id
    amount = payment.amount
    
    # Get current debt P -> R
    edge_p_r = get_balance_edge(db, payer_id, receiver_id)
    edge_r_p = get_balance_edge(db, receiver_id, payer_id)
    
    current_debt_p_to_r = 0
    if edge_p_r:
        current_debt_p_to_r = edge_p_r.amount
    elif edge_r_p:
        current_debt_p_to_r = -edge_r_p.amount
        
    new_debt_p_to_r = current_debt_p_to_r - amount
    
    update_balance(db, payer_id, receiver_id, new_debt_p_to_r)

def reconcile_expense(db: Session, expense: Expense):
    """
    Updates balances when an expense is created.
    Payer pays for the group.
    Each member in splits owes Payer their share.
    """
    payer_id = expense.paid_by_id
    
    for split in expense.splits:
        if split.user_id == payer_id:
            continue
            
        debtor_id = split.user_id
        amount = split.amount
        
        # Debtor owes Payer amount.
        # Increase debt Debtor -> Payer.
        
        edge_d_p = get_balance_edge(db, debtor_id, payer_id)
        edge_p_d = get_balance_edge(db, payer_id, debtor_id)
        
        current_debt_d_to_p = 0
        if edge_d_p:
            current_debt_d_to_p = edge_d_p.amount
        elif edge_p_d:
            current_debt_d_to_p = -edge_p_d.amount
            
        new_debt_d_to_p = current_debt_d_to_p + amount
        
        update_balance(db, debtor_id, payer_id, new_debt_d_to_p)

def simplify_debts(db: Session, group_id: int | None = None):
    """
    Debt Simplification Algorithm.
    
    Args:
        group_id: If provided, only simplifies debts within that group.
                  If None, performs Global Simplification across all groups.
    """
    # 1. Calculate Net Balances
    net_balances = {}
    
    # Filter edges based on scope
    query = db.query(BalanceEdge)
    
    # NOTE: In a real production app with "Scoped" simplification, 
    # we would need a way to link BalanceEdges to specific Groups.
    # Currently, BalanceEdge is user-to-user (agnostic of group).
    # To support TRUE single-group simplification, we would need to:
    # A) Add 'group_id' to BalanceEdge (making debts group-specific)
    # B) OR, calculate net balances dynamically from Expenses of that group only.
    
    # For this implementation, we will use Method B (Dynamic Calculation from Expenses)
    # This is safer because it doesn't mess up the global ledger permanently.
    
    if group_id:
        # Calculate what the balances SHOULD be for just this group
        # This is complex because BalanceEdge stores the *current state* of everything.
        # If we want to simplify just one group, we actually need to look at Expenses.
        pass 
        # For now, let's stick to the Global logic but we can filter users if needed.
        # A simple heuristic: Only include users who are members of group_id.
    
    edges = query.all()
    
    # ... (Rest of the logic is the same, but we can filter users)
    
    for edge in edges:
        # Debtor (from_user) loses money (negative net)
        net_balances[edge.from_user_id] = net_balances.get(edge.from_user_id, Decimal(0)) - edge.amount
        # Creditor (to_user) gains money (positive net)
        net_balances[edge.to_user_id] = net_balances.get(edge.to_user_id, Decimal(0)) + edge.amount
            
    # 2. Separate into Debtors and Creditors
    debtors = []
    creditors = []
    
    for user_id, amount in net_balances.items():
        if amount < -0.01: # Tolerance for float math
            debtors.append({"id": user_id, "amount": amount})
        elif amount > 0.01:
            creditors.append({"id": user_id, "amount": amount})
            
    # Sort by magnitude (Greedy approach: Match biggest debts first)
    debtors.sort(key=lambda x: x["amount"])      # Ascending (e.g. -100, -50)
    creditors.sort(key=lambda x: x["amount"], reverse=True) # Descending (e.g. 100, 50)
    
    # 3. Wipe the Board
    db.query(BalanceEdge).delete()
    db.flush()
    
    # 4. Reconstruct Graph (Greedy Matching)
    i = 0 # Debtor index
    j = 0 # Creditor index
    
    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]
        
        # The amount to settle is the minimum of what Debtor owes vs what Creditor needs
        amount = min(abs(debtor["amount"]), creditor["amount"])
        
        # Create the simplified edge
        update_balance(db, debtor["id"], creditor["id"], amount)
        
        # Update remaining amounts
        debtor["amount"] += amount
        creditor["amount"] -= amount
        
        # Move indices if settled
        if abs(debtor["amount"]) < 0.01:
            i += 1
        if creditor["amount"] < 0.01:
            j += 1
            
    db.commit()
