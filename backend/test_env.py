import os
from dotenv import load_dotenv

load_dotenv("../.env")
print(f"EMAIL_USER: {os.getenv('EMAIL_USER')}")
print(f"EMAIL_PASSWORD: {'SET' if os.getenv('EMAIL_PASSWORD') else 'NOT SET'}")
