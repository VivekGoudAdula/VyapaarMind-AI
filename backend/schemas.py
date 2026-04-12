from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class TransactionBase(BaseModel):
    user_id: str
    amount: float
    type: str
    category: str

class TransactionCreate(TransactionBase):
    pass

class Transaction(BaseModel):
    id: int
    amount: float
    type: str
    category: str
    date: datetime

    class Config:
        from_attributes = True

class CreditScore(BaseModel):
    score: int
    status: str
    stability_score: int
    runway_score: int
    discipline_score: int

class SummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    category_breakdown: Dict[str, float]
    risk_flags: List[str]
    ml_risk: Optional[str] = None
    credit_score: Optional[CreditScore] = None

class UserBase(BaseModel):
    name: str
    email: str
    firebase_uid: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

class AIDecisionRequest(BaseModel):
    user_id: str
    question: str

class AIDecisionResponse(BaseModel):
    decision: Any

class PredictionResponse(BaseModel):
    status: str
    current_balance: float
    daily_income: float
    daily_expense: float
    net_daily: float
    days_to_risk: Optional[float]
    prediction_message: str

class AlertBase(BaseModel):
    user_id: str
    message: str
    severity: str

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class DecisionBase(BaseModel):
    user_id: str
    result: str
    severity: str

class Decision(DecisionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SimulateRequest(BaseModel):
    amount: float

class SimulationAnalysis(BaseModel):
    verdict: str
    risk: str
    reason: List[str]
    action: str
    alternative: str

class SimulateResponse(BaseModel):
    new_balance: float
    runway: float
    risk: str
    analysis: Optional[SimulationAnalysis] = None

class InvoiceReminderRequest(BaseModel):
    email: str
    amount: float
    client_name: str
    invoice_id: str
    pdf_content: Optional[str] = None

class ForecastMonth(BaseModel):
    month: str
    income: float
    expense: float
    balance: float

class ForecastResponse(BaseModel):
    months: List[ForecastMonth]
    trend: str
    risk: str
    ml_prediction: Optional[List[float]] = None

class MayaChatRequest(BaseModel):
    user_id: str
    message: str
    user_name: Optional[str] = "Partner"

class MayaChatResponse(BaseModel):
    response: str
