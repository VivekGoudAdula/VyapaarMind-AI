import json
import requests
import os
import re
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
            response = requests.post(SUPERVITY_URL, headers=headers, files=files)
            response.raise_for_status()
            
            # Parse the NDJSON stream to find the final result
            return SupervityAgent._parse_stream(response.text)
        except Exception as e:
            print(f"❌ [SUPERVITY ERROR] {e}")
            return {
                "verdict": "ERROR",
                "logic": f"System encountered an issue contacting the intelligence engine: {str(e)}",
                "riskLevel": "Unknown",
                "suggestedAction": "Please try again in a few moments."
            }

    @staticmethod
    def _parse_stream(stream_text):
        """
        Parses the Supervity NDJSON stream and extracts the final decision.
        Handles split event:/data: lines and multiple event types.
        """
        stream_text = stream_text.strip()
        
        # Safety: check if it's already a clean JSON response
        try:
            direct_json = json.loads(stream_text)
            if isinstance(direct_json, dict) and 'verdict' in direct_json:
                return direct_json
        except:
            pass

        lines = stream_text.split('\n')
        activity_runs = []
        current_event = None
        
        for i in range(len(lines)):
            line = lines[i].strip()
            if not line: continue
            
            if line.startswith('event:'):
                current_event = line.replace('event:', '').strip()
            elif line.startswith('data:'):
                try:
                    data_str = line.replace('data:', '').strip()
                    data_json = json.loads(data_str)
                    
                    # Store activity-run content
                    if current_event == 'activity-run' or 'activityRunId' in data_str:
                        content = data_json.get('content', {})
                        if content:
                            activity_runs.append(content)
                            
                    # Check for final result in this data block
                    execution_result = data_json.get('content', {}).get('executionResult', {})
                    if execution_result:
                        outputs = execution_result.get('outputs', {})
                        if outputs and 'stdout' in outputs:
                            return SupervityAgent._extract_decision_from_activity_list([{'outputs': outputs, 'stepId': 'final_result'}])
                            
                except:
                    continue
        
        # If no explicit result event found, process the collected activity runs
        return SupervityAgent._extract_decision_from_activity_list(activity_runs)

    @staticmethod
    def _extract_from_activities(lines):
        # This is now handled within the unified _parse_stream state loop
        return SupervityAgent._parse_stream('\n'.join(lines))

    @staticmethod
    def _extract_decision_from_activity_list(activity_runs):
        if not activity_runs:
            return {
                "verdict": "ANALYSIS PENDING",
                "logic": "MAYA is still processing the raw financial signals. Please wait a moment.",
                "riskLevel": "Standard",
                "suggestedAction": "Hold for final intelligence card..."
            }

        # Look for our specific formatter step
        target_step = None
        for run in reversed(activity_runs): 
            if run.get('stepId') == 'final_decision_formatter' and run.get('status') == 'completed':
                target_step = run
                break
        
        if not target_step:
            # Fallback to the last step that has any stdout
            for run in reversed(activity_runs):
                outputs = run.get('outputs', {})
                if outputs and outputs.get('stdout'):
                    target_step = run
                    break

        if not target_step:
            return {
                "verdict": "ANALYSIS INCOMPLETE",
                "logic": "The intelligence engine could not generate a strategic card. Review transactions manually.",
                "riskLevel": "Inconclusive",
                "suggestedAction": "Check the Dashboard Alerts for specific risks."
            }
            
        stdout = target_step.get('outputs', {}).get('stdout', '')
        if not stdout:
            return {
                "verdict": "DATA FETCH ERROR",
                "logic": "Intelligence step located but it emitted no output data.",
                "riskLevel": "Unknown",
                "suggestedAction": "Try re-submitting your query."
            }
        
        # Default decision object
        decision = {
            "verdict": "RESPONSE GENERATED",
            "logic": stdout.strip(), # Fallback to full stdout if regex fails
            "riskLevel": "Standard",
            "suggestedAction": "Proceed with caution."
        }
        
        # Parse fields with Case-Insensitive regex
        v_match = re.search(r'Verdict:\s*(.*)', stdout, re.IGNORECASE)
        if v_match: decision['verdict'] = v_match.group(1).strip()
            
        r_match = re.search(r'Risk Level:\s*(.*)', stdout, re.IGNORECASE)
        if r_match: decision['riskLevel'] = r_match.group(1).strip()
            
        a_match = re.search(r'Recommended Action:\s*(.*)', stdout, re.IGNORECASE)
        if not a_match: a_match = re.search(r'Action:\s*(.*)', stdout, re.IGNORECASE)
        if a_match: decision['suggestedAction'] = a_match.group(1).strip()
            
        # Logic extraction (everything after Core Logic: until next label)
        l_match = re.search(r'Core Logic:\s*(.*?)(?:\n[A-Za-z ]+:|$)', stdout, re.DOTALL | re.IGNORECASE)
        if l_match:
            logic_text = l_match.group(1).strip()
            lines = [l.strip().replace('- ', '') for l in logic_text.split('\n') if l.strip()]
            if lines: decision['logic'] = '\n'.join(lines)

        # Impact Warning
        w_match = re.search(r'Impact Warning:\s*(.*)', stdout, re.IGNORECASE)
        if w_match:
            warning = w_match.group(1).strip()
            if warning:
                if decision['logic']:
                    decision['logic'] += f"\nWARNING: {warning}"
                else:
                    decision['logic'] = f"WARNING: {warning}"

        # FINAL FALLBACK: Ensure logic is NEVER empty if we have any data
        if not decision['logic'].strip() and stdout:
            decision['logic'] = stdout.strip()

        return decision
