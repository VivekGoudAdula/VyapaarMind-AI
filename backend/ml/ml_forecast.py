# ml_forecast.py

def forecast_balance(history):
    """
    history = list of past balances (last 30–60 days)
    Predicts the balance for the next 90 days using Linear Trend.
    Pure-python implementation for reliability.
    """
    if not history:
        return []

    # Pure Python Linear Trend (y = mx + c)
    if len(history) < 2:
        return [float(history[0])] * 90 if history else []
        
    # Simple linear regression with pure python
    n = len(history)
    x = list(range(n))
    y = history
    
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xx = sum(i*i for i in x)
    sum_xy = sum(i*j for i, j in zip(x, y))
    
    # Calculate slope (m) and intercept (c)
    denominator = (n * sum_xx - sum_x**2)
    if denominator == 0:
        return [float(history[-1])] * 90
        
    m = (n * sum_xy - sum_x * sum_y) / denominator
    c = (sum_y - m * sum_x) / n
    
    predictions = []
    for i in range(n, n + 90):
        predictions.append(float(round(m * i + c, 2)))
    
    return predictions
