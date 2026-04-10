from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from database import get_db, SessionLocal
import models, schemas
import datetime
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from groq import Groq

load_dotenv("../.env")

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "gsk_test_key_here"))

router = APIRouter()

def send_email(to_email, subject, body_html, alert_count=1, severity="High"):
    load_dotenv("../.env", override=True)
    
    if severity == "High":
        full_subject = f"🚨 CRITICAL: {alert_count} Financial Risks Detected - VyapaarMind"
    elif severity == "Positive":
        full_subject = f"✅ Good News: {alert_count} Growth Signals - VyapaarMind"
    else:
        full_subject = f"⚠️ VyapaarMind Intelligence Update"

    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASSWORD", "").replace(" ", "").strip()

    if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
        print(f"⚠️ [MOCK] Email would be sent to {to_email}")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = full_subject
        msg["From"] = f"VyapaarMind AI <{sender_email}>"
        msg["To"] = to_email

        # Attach HTML content
        msg.attach(MIMEText(body_html, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        
        print(f"📧 [SYSTEM] BUNDLED EMAIL SENT TO: {to_email}")
    except Exception as e:
        print(f"❌ [MAIL ERROR] {e}")

def run_alert_engine(user_id: str, db: Session):
    summary = get_summary(user_id, db)
    prediction = predict_financial_health(user_id, db)

    alerts = []

    # 1. Logic for alerts
    if summary["balance"] < 20000:
        alerts.append({
            "title": "Low Balance Warning",
            "message": "Balance below ₹20,000. Immediate attention required.",
            "severity": "High",
            "color": "#ef4444"
        })

    if summary["total_expenses"] > summary["total_income"] and summary["total_income"] > 0:
        alerts.append({
            "title": "Cashflow Risk",
            "message": "Expenses exceed income. Your cashflow is currently unstable.",
            "severity": "High",
            "color": "#f59e0b"
        })

    if prediction.get("days_to_risk") is not None and prediction["days_to_risk"] <= 7:
        alerts.append({
            "title": "Runway Critical",
            "message": f"Your balance will hit critical levels in {prediction['days_to_risk']} days.",
            "severity": "High",
            "color": "#b91c1c"
        })

    # Positive Signals
    if summary["total_income"] > summary["total_expenses"] and summary["total_income"] > 0:
        alerts.append({
            "title": "Positive Cashflow",
            "message": "Great job! Your income exceeds expenses. You're cashflow positive.",
            "severity": "Positive",
            "color": "#10b981"
        })
        
    if summary["balance"] > 50000:
        alerts.append({
            "title": "Savings Milestone",
            "message": "Strong financial position. Your balance just crossed ₹50,000.",
            "severity": "Positive",
            "color": "#6366f1"
        })

    if not alerts:
        return []

    # 2. Save and De-duplicate
    print(f"[ENGINE] Checking alerts for {user_id}...")
    new_alerts_to_send = []
    
    # Get existing active alerts for this user to avoid spamming
    existing_messages = {a[0] for a in db.query(models.Alert.message).filter(models.Alert.user_id == user_id).all()}
    print(f"[ENGINE] Found {len(existing_messages)} existing alerts in DB.")

    for alert in alerts:
        if alert["message"] not in existing_messages:
            db_alert = models.Alert(user_id=user_id, message=alert["message"], severity=alert["severity"])
            db.add(db_alert)
            new_alerts_to_send.append(alert)
    
    if not new_alerts_to_send:
        print("[ENGINE] No new signals detected. Skipping email dispatch (De-duplication Active).")
        db.commit() # Just in case
        return []

    print(f"[ENGINE] {len(new_alerts_to_send)} NEW SIGNALS DETECTED! Preparing dispatch...")
    db.commit()
    alerts = new_alerts_to_send # only email the new things

    # 3. Build Bundled HTML Email
    user = db.query(models.User).filter(models.User.firebase_uid == user_id).first()
    user_email = user.email if user else "test@example.com"
    user_name = user.name if user else "Vyapaari"

    alerts_html = ""
    for a in alerts:
        alerts_html += f"""
        <div style="background: #ffffff; border-left: 6px solid {a['color']}; padding: 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h3 style="margin: 0 0 5px 0; color: #1e293b; font-size: 18px; text-transform: uppercase;">{a['title']}</h3>
            <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">{a['message']}</p>
        </div>
        """

    main_severity = "High" if any(a["severity"] == "High" for a in alerts) else "Positive"
    
    if main_severity == "High":
        print(f"[ENGINE] CRITICAL RISK DETECTED. TRIGGERING MAYA AUTO-DECISION...")
        auto_maya_decision(user_id, db)

    header_color = "#ef4444" if main_severity == "High" else "#10b981"

    email_template = f"""
    <html>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <div style="background-color: {header_color}; padding: 40px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">VyapaarMind AI</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Intelligence Notification System</p>
            </div>
            <div style="padding: 40px;">
                <h2 style="color: #1e293b; margin-top: 0;">Hello {user_name},</h2>
                <p style="color: #475569; font-size: 16px; margin-bottom: 30px;">Our autonomous engine has detected significant updates in your financial status:</p>
                {alerts_html}
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: {header_color}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; text-transform: uppercase; font-size: 14px;">View Command Center</a>
                </div>
            </div>
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                © 2026 VyapaarMind AI. All rights reserved.<br>
                Strategic intelligence for the modern entrepreneur.
            </div>
        </div>
    </body>
    </html>
    """

    print(f"[SYSTEM] BUNDLED EMAIL SENT TO: {user_email}")
    send_email(user_email, "", email_template, len(alerts), main_severity)
    return alerts

@router.get("/alerts/{user_id}", response_model=List[schemas.Alert])
def get_alerts(user_id: str, db: Session = Depends(get_db)):
    return db.query(models.Alert).filter(models.Alert.user_id == user_id).order_by(desc(models.Alert.created_at)).all()

@router.delete("/alerts/user/{user_id}")
def dismiss_all_alerts(user_id: str, db: Session = Depends(get_db)):
    db.query(models.Alert).filter(models.Alert.user_id == user_id).delete()
    db.commit()
    return {"status": "success", "message": "All alerts dismissed"}

@router.delete("/alerts/{alert_id}")
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(alert)
    db.commit()
    return {"status": "success", "message": "Alert dismissed"}

@router.post("/transactions/add")
def add_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    if not transaction.user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    db_transaction = models.Transaction(
        user_id=transaction.user_id,
        amount=transaction.amount,
        type=transaction.type,
        category=transaction.category
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # Auto-trigger Engine
    run_alert_engine(transaction.user_id, db)
    
    return {"status": "success", "message": "Transaction added"}

@router.get("/transactions/{user_id}", response_model=List[schemas.Transaction])
def get_transactions(user_id: str, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == user_id)\
        .order_by(desc(models.Transaction.date))\
        .all()
    return transactions

@router.get("/summary/{user_id}", response_model=schemas.SummaryResponse)
def get_summary(user_id: str, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_income - total_expenses
    
    # Category breakdown for expenses
    category_breakdown = {}
    for t in transactions:
        if t.type == "expense":
            category_breakdown[t.category] = category_breakdown.get(t.category, 0) + t.amount
            
    # Risk Engine Logic
    risk_flags = []
    
    if total_income > 0:
        if total_expenses > 0.9 * total_income:
            risk_flags.append("Critical spending: Over 90% of income")
        elif total_expenses > 0.7 * total_income:
            risk_flags.append("High spending detected")
            
    if balance < 10000:
        risk_flags.append("Dangerous balance level")
    elif balance < 20000:
        risk_flags.append("Low balance warning")
        
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "category_breakdown": category_breakdown,
        "risk_flags": risk_flags
    }

# Sync user endpoint to keep it for auth integration if needed
@router.post("/sync-user")
def sync_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.firebase_uid == user_data.firebase_uid).first()
    
    if db_user:
        db_user.email = user_data.email
        db_user.name = user_data.name
    else:
        db_user = models.User(
            firebase_uid=user_data.firebase_uid,
            name=user_data.name,
            email=user_data.email
        )
        db.add(db_user)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/predict/{user_id}", response_model=schemas.PredictionResponse)
def predict_financial_health(user_id: str, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).filter(models.Transaction.user_id == user_id).all()
    
    if not transactions:
        return {
            "status": "safe", "current_balance": 0.0, "daily_income": 0.0, "daily_expense": 0.0, "net_daily": 0.0, "days_to_risk": None, "prediction_message": "No transaction history."
        }
    
    total_inc = sum(t.amount for t in transactions if t.type == "income")
    total_exp = sum(t.amount for t in transactions if t.type == "expense")
    balance = total_inc - total_exp
    
    # Calculate daily averages based on last 30 days or available data
    # Find the date range
    dates = [t.date for t in transactions]
    if not dates:
        return {"status": "safe", "current_balance": balance, "daily_income": 0.0, "daily_expense": 0.0, "net_daily": 0.0, "days_to_risk": None, "prediction_message": "Awaiting more data."}
    
    days_span = (max(dates) - min(dates)).days + 1
    daily_inc = total_inc / days_span
    daily_exp = total_exp / days_span
    net_daily = daily_inc - daily_exp
    
    # Risk Assessment
    days_left = None
    if net_daily < 0:
        days_left = int(abs(balance / net_daily))
        status = "danger" if days_left < 3 else "warning" if days_left < 10 else "safe"
        msg = f"Burn rate is ₹{abs(net_daily):,.2f}/day. Runway estimate: {days_left} days."
    else:
        status = "safe"
        msg = f"Cashflow positive! Growing at ₹{net_daily:,.2f}/day."
    
    return {
        "status": status,
        "current_balance": balance,
        "daily_income": daily_inc,
        "daily_expense": daily_exp,
        "net_daily": net_daily,
        "days_to_risk": days_left,
        "prediction_message": msg
    }

@router.post("/ai/decision", response_model=schemas.AIDecisionResponse)
def get_ai_decision(request: schemas.AIDecisionRequest, db: Session = Depends(get_db)):
    summary = get_summary(request.user_id, db)
    financial_summary = f"Balance: ₹{summary['balance']}"
    from core.supervity import SupervityAgent
    response_text = SupervityAgent.get_decision(request.question, financial_summary)
    return {"decision": response_text}

def auto_maya_decision(user_id: str, db: Session):
    summary = get_summary(user_id, db)
    prediction = predict_financial_health(user_id, db)

    prompt = f"""
    You are MAYA, an AI CFO.

    Current Financial State:
    Income: {summary['total_income']}
    Expenses: {summary['total_expenses']}
    Balance: {summary['balance']}
    Days to Risk: {prediction['days_to_risk']}

    Give STRICT decision:
    - Verdict (1 line)
    - Reason (1 line)
    - Action (1 line)

    Be direct, bold, and realistic. 
    (Output only these 3 lines, no preamble)
    """

    try:
        response = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}]
        )

        result = response.choices[0].message.content
        
        decision = models.Decision(
            user_id=user_id,
            result=result,
            severity="High"
        )

        db.add(decision)
        db.commit()
        return result
    except Exception as e:
        print(f"❌ [MAYA ERROR] {e}")
        return None

@router.get("/latest-decision/{user_id}", response_model=schemas.Decision)
def latest_decision(user_id: str, db: Session = Depends(get_db)):
    decision = db.query(models.Decision)\
        .filter(models.Decision.user_id == user_id)\
        .order_by(models.Decision.created_at.desc())\
        .first()
    if not decision:
        raise HTTPException(status_code=404, detail="No decisions found")
    return decision

@router.post("/simulate/{user_id}", response_model=schemas.SimulateResponse)
def simulate(user_id: str, request: schemas.SimulateRequest, db: Session = Depends(get_db)):
    summary = get_summary(user_id, db)

    balance = summary["balance"]
    expense = summary["total_expenses"]

    # Simple burn calculation
    daily_burn = expense / 30 if expense > 0 else 1

    new_balance = balance - request.amount
    runway = new_balance / daily_burn if daily_burn > 0 else 999

    if runway <= 5:
        risk = "HIGH"
    elif runway <= 15:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "new_balance": float(new_balance),
        "runway": float(round(runway, 1)),
        "risk": risk
    }
