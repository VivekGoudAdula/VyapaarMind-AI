import sys
import os

print("Testing ML imports...")
try:
    from ml.ml_risk_model import predict_risk
    print("ml_risk_model loaded successfully")
    from ml.ml_forecast import forecast_balance
    print("ml_forecast loaded successfully")
    
    # Test a prediction
    risk = predict_risk(50000, 2000, 1000)
    print(f"Prediction test: {risk}")
except Exception as e:
    print(f"Error during testing imports: {e}")
    import traceback
    traceback.print_exc()
