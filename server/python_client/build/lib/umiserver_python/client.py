import requests
from typing import Optional
import time

class WorkflowClient:
    def __init__(self,script_id: str, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.script_id = script_id
    
        # Function to send AddChatMessage request
    def send_message(self, sender, content):
        payload = {
            "script_id": self.script_id,
            "command": {
                "AddChatMessage": {
                    "sender": sender,
                    "content": content
                }
            }
        }
        
        response = requests.post(self.base_url, json=payload)
        
        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")

    # Function to send GetNextMessage request
    def wait_response(self):
        print(f"Script {self.script_id} Waiting for user response...")

        while(True):
            payload = {
                "script_id": self.script_id,
                "command": "GetNextMessage"
            }
            
            response = requests.post(self.base_url, json=payload)
            
            if response.status_code != 200:
                print(f"Error {response.status_code}: {response.text}")

            if response.json()["message"] is not None:
                return response.json()["message"]
            
            time.sleep(0.1)
    def write_doc(self, name, content):
        payload = {
            "script_id": self.script_id,
            "command": {
                "WriteDocument": {
                    "name": name,
                    "content": content
                }
            }
        }
        
        response = requests.post(self.base_url, json=payload)
        
        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")

    def write_code(self, name, content):
        payload = {
            "script_id": self.script_id,
            "command": {
                "WriteCode": {
                    "name": name,
                    "content": content
                }
            }
        }
        
        response = requests.post(self.base_url, json=payload)
        
        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")

    def read_doc(self, name,):
        payload = {
            "script_id": self.script_id,
            "command": {
                "ReadDocument": {
                    "name": name
                }
            }
        }
        
        response = requests.post(self.base_url, json=payload)
        
        if response.status_code == 200:
            print("Response:", response.json())
        else:
            print(f"Error {response.status_code}: {response.text}")

        if response.json()["content"] is not None:
            return response.json()["content"]


# # Przykładowe użycie biblioteki:
# if __name__ == "__main__":
#     client = WorkflowClient("http://localhost:8000")
    
#     try:
#         client.log_message("Workflow client initialized.", level="info")
#         task_status = client.send_task_update(task_id="12345", status="InProgress", message="Task started.")
#         print("Task status updated:", task_status)
        
#         task_details = client.fetch_task_details(task_id="12345")
#         print("Task details:", task_details)
#     except requests.RequestException as e:
#         print("Error during REST communication:", e)