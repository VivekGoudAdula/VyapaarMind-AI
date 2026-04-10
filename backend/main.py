from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from api.endpoints import router
import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VyapaarMind AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize a default user if not exists
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.id == 1).first()
    if not user:
        db_user = models.User(id=1, name="Default SME", email="sme@example.com")
        db.add(db_user)
        db.commit()
    db.close()

app.include_router(router)

@app.get("/")
def root():
    return {"message": "VyapaarMind AI — AI CFO for SMEs is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
