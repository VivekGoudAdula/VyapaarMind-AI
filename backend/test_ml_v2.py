import sys
import os
import traceback

with open("test_results.log", "w") as f:
    f.write("Testing ML imports...\n")
    try:
        import pandas as pd
        f.write("pandas loaded\n")
        import numpy as np
        f.write("numpy loaded\n")
        from sklearn.tree import DecisionTreeClassifier
        f.write("sklearn loaded\n")
        
        from ml.ml_risk_model import predict_risk
        f.write("ml_risk_model loaded successfully\n")
        from ml.ml_forecast import forecast_balance
        f.write("ml_forecast loaded successfully\n")
        
        # Test a prediction
        risk = predict_risk(50000, 2000, 1000)
        f.write(f"Prediction test: {risk}\n")
    except Exception as e:
        f.write(f"Error during testing imports: {e}\n")
        f.write(traceback.format_exc())
