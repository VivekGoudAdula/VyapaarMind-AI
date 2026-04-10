import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv("../.env")

def test_send_email():
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASSWORD", "").replace(" ", "").strip()
    to_email = "adulavivekgoud@gmail.com"
    
    print(f"DEBUG: SENDER={sender_email}")
    print(f"DEBUG: PASS_LEN={len(sender_password)}")

    if not sender_email or not sender_password:
        print("ERROR: MISSING CREDENTIALS")
        return

    try:
        msg = MIMEMultipart()
        msg["Subject"] = "VyapaarMind Test Email"
        msg["From"] = sender_email
        msg["To"] = to_email
        msg.attach(MIMEText("This is a test email from VyapaarMind engine.", "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print("SUCCESS: EMAIL SENT")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_send_email()
