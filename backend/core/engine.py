from typing import List, Dict
from models import Transaction
import datetime

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
