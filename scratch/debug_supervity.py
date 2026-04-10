import requests
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

SUPERVITY_URL = "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream"
WORKFLOW_ID = "019d7229-1027-7000-ac96-442c9ede2d5f"
TOKEN = os.getenv("SUPERVITY_BEARER_TOKEN")

def debug_stream():
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
        "x-source": "v1"
    }
    
    payload = {
        "workflowId": WORKFLOW_ID,
        "inputs": {
            "decision_query": "Should I spend 500 dollars on marketing?",
            "transactions_summary": "Balance: 1000, Income: 2000, Expense: 500"
        }
    }

    try:
        print("Sending request to Supervity...")
        response = requests.post(SUPERVITY_URL, headers=headers, json=payload, stream=True)
        response.raise_for_status()
        
        with open('supervity_raw_stream.log', 'w') as f:
            for line in response.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    print(decoded_line)
                    f.write(decoded_line + '\n')
        print("\nStream saved to supervity_raw_stream.log")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_stream()
