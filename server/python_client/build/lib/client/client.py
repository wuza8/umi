import requests
from typing import Optional

class WorkflowClient:
    """
    Klient REST do komunikacji z serwerem Workflow.
    """
    def __init__(self, base_url: str):
        """
        Inicjalizuje klienta z podanym URL-em serwera.
        
        :param base_url: Podstawowy URL serwera REST.
        """
        self.base_url = base_url.rstrip('/')
    
    def send_task_update(self, task_id: str, status: str, message: Optional[str] = None):
        """
        Wysyła aktualizację statusu zadania do serwera.
        
        :param task_id: ID zadania.
        :param status: Status zadania (Waiting, InProgress, Done).
        :param message: Opcjonalna wiadomość dołączona do aktualizacji.
        :return: Odpowiedź serwera.
        """
        payload = {
            "task_id": task_id,
            "status": status,
            "message": message
        }
        response = requests.post(f"{self.base_url}/task/update", json=payload)
        response.raise_for_status()
        return response.json()
    
    def fetch_task_details(self, task_id: str):
        """
        Pobiera szczegóły zadania z serwera.
        
        :param task_id: ID zadania.
        :return: Szczegóły zadania.
        """
        response = requests.get(f"{self.base_url}/task/{task_id}")
        response.raise_for_status()
        return response.json()
    
    def log_message(self, message: str, level: str = "info"):
        """
        Wysyła wiadomość logu na serwer.
        
        :param message: Treść wiadomości logu.
        :param level: Poziom logowania (info, warning, error).
        :return: Odpowiedź serwera.
        """
        payload = {
            "message": message,
            "level": level
        }
        response = requests.post(f"{self.base_url}/log", json=payload)
        response.raise_for_status()
        return response.json()


# Przykładowe użycie biblioteki:
if __name__ == "__main__":
    client = WorkflowClient("http://localhost:8000")
    
    try:
        client.log_message("Workflow client initialized.", level="info")
        task_status = client.send_task_update(task_id="12345", status="InProgress", message="Task started.")
        print("Task status updated:", task_status)
        
        task_details = client.fetch_task_details(task_id="12345")
        print("Task details:", task_details)
    except requests.RequestException as e:
        print("Error during REST communication:", e)