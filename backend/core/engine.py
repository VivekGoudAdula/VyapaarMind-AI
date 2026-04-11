from typing import List, Dict
from models import Transaction
import datetime
import os
import sys

# Add parent directory to sys.path to allow importing from 'ml' package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from ml.ml_risk_model import predict_risk
    from ml.ml_forecast import forecast_balance
except ImportError:
    predict_risk = None
    forecast_balance = None

class VyapaarEngine:
    @staticmethod
    def categorize(description: str) -> str:
        description = description.lower()
        keywords = {
            "rent": ["rent", "lease", "office", "warehouse"],
            "food": ["food", "meal", "restaurant", "catering", "grocery"],
            "inventory": ["inventory", "stock", "raw material", "suppliers"],
            "utilities": ["electricity", "water", "internet", "phone", "bill"],
            "salary": ["payroll", "salary", "wages", "bonus"],
            "marketing": ["ads", "facebook", "google", "marketing", "promotion"]
        }
        
        for category, kws in keywords.items():
            if any(kw in description for kw in kws):
                return category
        return "Miscellaneous"

    @staticmethod
    def calculate_summary(transactions: List[Transaction]) -> Dict:
        total_income = sum(t.amount for t in transactions if t.type == "income")
        total_expenses = sum(t.amount for t in transactions if t.type == "expense")
        balance = total_income - total_expenses
        
        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance
        }

    @staticmethod
    def get_risk_flags(summary: Dict, transactions: List[Transaction]) -> List[str]:
        flags = []
        if summary["balance"] < 1000: # Threshold example
            flags.append("LOW_BALANCE: Balance is below minimal threshold.")
        
        if summary["total_income"] > 0:
            spending_ratio = summary["total_expenses"] / summary["total_income"]
            if spending_ratio > 0.70:
                flags.append("HIGH_SPENDING: Expenses are more than 70% of income.")
        
        misc_expenses = sum(t.amount for t in transactions if t.type == "expense" and t.category == "Miscellaneous")
        if summary["total_expenses"] > 0:
            misc_ratio = misc_expenses / summary["total_expenses"]
            if misc_ratio > 0.15:
                flags.append("MISC_HIGH: Miscellaneous expenses exceed 15% of total spending.")
        
        return flags

    @staticmethod
    def predict_runway(summary: Dict, transactions: List[Transaction], days: int = 30) -> float:
        expense_transactions = [t for t in transactions if t.type == "expense"]
        if not expense_transactions:
            return summary["balance"]
        
        # Calculate avg daily expense
        first_date = min(t.date for t in expense_transactions)
        last_date = max(t.date for t in expense_transactions)
        delta = (last_date - first_date).days + 1
        
        avg_daily_expense = summary["total_expenses"] / delta
        prediction = summary["balance"] - (avg_daily_expense * days)
        return round(prediction, 2)

    @staticmethod
    def get_ml_risk(summary: Dict, transactions: List[Transaction]) -> str:
        """
        Uses the ML Decision Tree model to predict risk level.
        """
        if predict_risk is None:
            return "UNKNOWN (ML Model Not Loaded)"
        
        balance = summary.get("balance", 0)
        
        # Calculate daily burn (avg of last 7 days or all if less)
        expense_amounts = [t.amount for t in transactions if t.type == "expense"]
        if not expense_amounts:
            daily_burn = 0
        else:
            daily_burn = sum(expense_amounts) / max(1, len(set(t.date for t in transactions if t.type == "expense")))

        cashflow = summary.get("total_income", 0) - summary.get("total_expenses", 0)
        
        try:
            risk = predict_risk(balance, daily_burn, cashflow)
            return risk
        except Exception as e:
            print(f"Error in ML Risk Prediction: {e}")
            return "ERROR"

    @staticmethod
    def get_ml_forecast(transactions: List[Transaction], days: int = 90) -> List[float]:
        """
        Uses Linear Regression to forecast future balances.
        """
        if forecast_balance is None:
            return []
            
        # Group transactions by date to get daily balances
        daily_balances = {}
        # This is a simplified reconstruction of balance history
        sorted_txs = sorted(transactions, key=lambda x: x.date)
        current_bal = 0
        for tx in sorted_txs:
            if tx.type == "income":
                current_bal += tx.amount
            else:
                current_bal -= tx.amount
            daily_balances[tx.date] = current_bal
            
        history = [daily_balances[date] for date in sorted(daily_balances.keys())]
        
        if not history:
            return []
            
        try:
            predictions = forecast_balance(history)
            return predictions[:days]
        except Exception as e:
            print(f"Error in ML Forecasting: {e}")
            return []
