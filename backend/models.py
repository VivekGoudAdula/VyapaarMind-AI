from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)

    transactions = relationship("Transaction", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.firebase_uid"), index=True)
    amount = Column(Float)
    type = Column(String)  # "income" or "expense"
    category = Column(String)
    date = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="transactions")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    message = Column(String)
    severity = Column(String)  # High / Medium / Low
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    result = Column(String)
    severity = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
