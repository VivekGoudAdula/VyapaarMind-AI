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

from dotenv import load_dotenv
import os

# Use absolute path to ensure .env is loaded regardless of execution context
env_path = os.path.join(os.path.dirname(__file__), "../../.env")
load_dotenv(env_path, override=True)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", "gsk_test_key_here"))

router = APIRouter()

def send_email(to_email, subject, body_html, alert_count=1, severity="High"):
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

def run_alert_engine(user_id: str, db: Session, last_tx: models.Transaction = None):
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

    # NEW: Detect Huge Single Loss / Large Transaction
    if last_tx and last_tx.type == "expense" and last_tx.amount >= 10000:
        alerts.append({
            "title": "Huge Transaction Detected",
            "message": f"Significant outflow of ₹{last_tx.amount:,.0f} detected in category '{last_tx.category}'.",
            "severity": "High",
            "color": "#b91c1c"
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
    # 3. Check for high severity to trigger MAYA (Check all active signals, even if already in DB)
    has_high_risk = any(a["severity"] == "High" for a in alerts)
    if has_high_risk:
        print(f"[ENGINE] HIGH RISK ACTIVE for {user_id}. TRIGGERING MAYA ANALYSIS...")
        auto_maya_decision(user_id, db)
    else:
        print(f"[ENGINE] No high risks found for {user_id}. Maya remains dormant.")

    # 4. Save and De-duplicate for email dispatch
    existing_messages = {a[0] for a in db.query(models.Alert.message).filter(models.Alert.user_id == user_id).all()}
    
    for alert in alerts:
        if alert["message"] not in existing_messages:
            db_alert = models.Alert(user_id=user_id, message=alert["message"], severity=alert["severity"])
            db.add(db_alert)
    
    db.commit()

    # CRITICAL: User requested 'mails mandatory for everything'. 
    # We will dispatch the email for ALL active alerts, not just 'new' ones.
    print(f"[ENGINE] {len(alerts)} SIGNALS ACTIVE! Preparing dispatch...")
    
    # 5. Build Bundled HTML Email
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
    header_color = "#ef4444" if main_severity == "High" else "#10b981"

    email_template = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e1e8ed;">
            <div style="background-color: #0f172a; padding: 30px; text-align: left; border-bottom: 4px solid {header_color};">
                <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: white; letter-spacing: 0.05em; text-transform: uppercase;">VyapaarMind AI</h1>
                <p style="margin: 5px 0 0 0; color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em;">Autonomous Intelligence Notification</p>
            </div>
            <div style="padding: 40px;">
                <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">Security Advisory</p>
                <h2 style="color: #1e293b; margin-top: 0; font-size: 22px; font-weight: 800;">Financial Status Update</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                    Dear {user_name},<br><br>
                    Our autonomous monitoring system has detected significant activity within your business ledger. Below is the verified intelligence report for your immediate review:
                </p>
                
                <div style="margin-bottom: 30px;">
                   {alerts_html}
                </div>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 700;">Strategic Recommendation</p>
                    <p style="margin: 10px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                        We recommend accessing the central command center for a full risk-assessment and to view MAYA's latest strategic interventions.
                    </p>
                    <div style="margin-top: 20px;">
                        <a href="http://localhost:5173/dashboard" style="display: inline-block; background-color: #0f172a; color: white; padding: 14px 28px; border-radius: 4px; text-decoration: none; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">Access Command Center</a>
                    </div>
                </div>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border-top: 1px solid #e1e8ed; text-align: left; color: #94a3b8; font-size: 11px; line-height: 1.6;">
                <p style="margin: 0 0 10px 0; font-weight: 700; color: #64748b; text-transform: uppercase;">Confidentiality Notice</p>
                This is an automated advisory from VyapaarMind AI. This communication contains privileged information intended solely for the registered user. If you are not the intended recipient, please notify us immediately. 
                <br><br>
                © 2026 VyapaarMind AI Financial Systems. All rights reserved. Registered Office: Bengaluru, India.
            </div>
        </div>
    </body>
    </html>
    """

    print(f"[SYSTEM] ATTEMPTING EMAIL DISPATCH TO: {user_email}")
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
    run_alert_engine(transaction.user_id, db, db_transaction)
    
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
            model="llama-3.3-70b-versatile",
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
    prediction = predict_financial_health(user_id, db)

    balance = summary["balance"]
    net_daily = prediction["net_daily"]
    is_cashflow_positive = net_daily >= 0

    # When cashflow is positive, there is no burn — runway is essentially infinite
    # Only calculate burn-based runway when the business is burning cash
    if not is_cashflow_positive:
        daily_burn = abs(net_daily)
        new_balance = balance - request.amount
        runway = max(0, new_balance / daily_burn) if daily_burn > 0 else 999
    else:
        new_balance = balance - request.amount
        # For cashflow-positive businesses, runway is based on whether the spend
        # pushes balance negative. If balance stays positive, runway is healthy.
        if new_balance < 0:
            runway = 0
        else:
            runway = 999  # Effectively infinite since income > expenses

    if new_balance < 0:
        risk = "HIGH"
    elif runway <= 5:
        risk = "HIGH"
    elif runway <= 15:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    # AI Scenario Analysis Prompt (JSON focus)
    cashflow_status = f"POSITIVE (surplus ₹{net_daily:,.2f}/day)" if is_cashflow_positive else f"NEGATIVE (burning ₹{abs(net_daily):,.2f}/day)"
    prompt = f"""
    You are MAYA, an AI CFO. Analyze this business scenario and provide a STACKED DECISION.
    
    DATA:
    Action: Spend ₹{request.amount:,.2f}
    Current Balance: ₹{balance:,.2f}
    New Balance: ₹{new_balance:,.2f}
    Cashflow Status: {cashflow_status}
    New Runway: {"Healthy (cashflow positive)" if runway >= 999 else f"{runway:,.1f} days"}
    Risk Level: {risk}

    Return EXACTLY this JSON structure:
    {{
      "verdict": "REJECT" or "APPROVE",
      "risk": "{risk}",
      "reason": ["Reason 1", "Reason 2", "Reason 3"],
      "action": "One line direct instruction",
      "alternative": "One line smart safer option"
    }}

    Rules: 
    - Max 3 reasons. 
    - No preamble. 
    - Verdict must be uppercase. 
    - If cashflow is POSITIVE and new balance > 0, verdict should be APPROVE.
    - If new balance < 0 or runway is critically low, verdict should be REJECT.
    - Final response must be ONLY valid JSON.
    """

    ai_analysis = None
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        import json
        ai_analysis = json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ [SIM AI ERROR] {e}")

    return {
        "new_balance": float(new_balance),
        "runway": float(round(runway, 1)),
        "risk": risk,
        "analysis": ai_analysis
    }
