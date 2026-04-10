import requests
import os
from dotenv import load_dotenv, find_dotenv

# Try to find the .env file in the root directory
env_path = os.path.join(os.path.dirname(__file__), '../../.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv(find_dotenv())

SUPERVITY_URL = "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream"
# Get the bearer token dynamically to ensure environment is fully loaded before access
def get_bearer_token():
    return os.getenv("SUPERVITY_BEARER_TOKEN")
WORKFLOW_ID = "019d7229-1027-7000-ac96-442c9ede2d5f"

class SupervityAgent:
    @staticmethod
    def get_decision(decision_query: str, transactions_summary: str):
        headers = {
            "Authorization": f"Bearer {get_bearer_token()}",
            "x-source": "v1"
        }
        
        # Using form-data as per CURL example
        files = {
            "workflowId": (None, WORKFLOW_ID),
            "inputs[decision_query]": (None, decision_query),
            "inputs[transactions_summary]": (None, transactions_summary)
        }

        try:
            response = requests.post(SUPERVITY_URL, headers=headers, files=files)
            response.raise_for_status()
            # The CURL example used stream endpoint, but the response text is what's requested.
            return response.text
        except Exception as e:
            return f"Error contacting Supervity: {str(e)}"
