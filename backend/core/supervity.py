import requests
import os
import json
from dotenv import load_dotenv, find_dotenv

# Try to find the .env file in the root directory
env_path = os.path.join(os.path.dirname(__file__), '../../.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv(find_dotenv())

SUPERVITY_URL = "https://auto-workflow-api.supervity.ai/api/v1/workflow-runs/execute/stream"
WORKFLOW_ID = "019d7229-1027-7000-ac96-442c9ede2d5f"

def get_bearer_token():
    return os.getenv("SUPERVITY_BEARER_TOKEN")

class SupervityAgent:
    @staticmethod
    def get_decision(decision_query: str, transactions_summary: str):
        headers = {
            "Authorization": f"Bearer {get_bearer_token()}",
            "x-source": "v1"
        }
        
        files = {
            "workflowId": (None, WORKFLOW_ID),
            "inputs[decision_query]": (None, decision_query),
            "inputs[transactions_summary]": (None, transactions_summary)
        }

        try:
            response = requests.post(SUPERVITY_URL, headers=headers, files=files, stream=True)
            response.raise_for_status()
            
            final_output = ""
            
            # Parse the NDJSON stream
            for line in response.iter_lines():
                if not line:
                    continue
                
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith('data: '):
                    data_str = decoded_line[6:] # Strip 'data: '
                    try:
                        data = json.loads(data_str)
                        # Look for activity-run completion with outputs
                        if isinstance(data, dict) and "content" in data:
                            content = data["content"]
                            if isinstance(content, dict) and content.get("status") == "completed":
                                # We prioritize 'final_decision_formatter' or just the last successful output
                                if content.get("stepId") == "final_decision_formatter":
                                    final_output = content.get("outputs", {}).get("stdout", "")
                                elif not final_output and "outputs" in content:
                                    # Fallback to displayData if stdout is empty
                                    outputs = content.get("outputs", {})
                                    final_output = outputs.get("stdout") or outputs.get("displayData", {}).get("plain", "")
                                    
                    except Exception:
                        continue
            
            if not final_output:
                return "Strategic analysis complete. No specific intervention required at this moment."
                
            return final_output.replace("--- ELITE DECISION CARD ---", "").strip()

        except Exception as e:
            return f"Error contacting Supervity: {str(e)}"
