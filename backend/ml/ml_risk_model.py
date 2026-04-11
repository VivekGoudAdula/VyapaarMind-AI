# ml_risk_model.py

# --- PREDICTION FUNCTION ---
def predict_risk(balance, daily_burn, cashflow):
    """
    Predicts financial risk based on business metrics.
    Using a pure-python implementation for reliability on Python 3.13.
    """
    
    # Pure Python Heuristic-based Decision Tree
    if balance < 0:
        return "HIGH"
    
    if balance < 10000:
        if daily_burn > 5000:
            return "HIGH"
        return "MEDIUM"
    
    if cashflow < -5000:
        return "HIGH"
    
    if cashflow < -2000:
        return "MEDIUM"
    
    if balance > 50000 and cashflow > 0:
        return "LOW"
        
    if balance < 25000:
        return "MEDIUM"
        
    return "LOW"
