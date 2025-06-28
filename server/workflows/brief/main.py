from umiserver_python import WorkflowClient
import sys
import guidance
from guidance import assistant, gen, models, system, user

# Connect to LM Studio's local API
llm = models.OpenAI(
    model="gpt-4o-mini",
)

umi = WorkflowClient(sys.argv[1],sys.argv[2])

# Run the conversation
def run():
    conversation_string = ""
    with guidance.system():
        conversation = llm + """
Jesteś inteligentnym asystentem specjalizującym się w zbieraniu informacji do tworzenia dokumentów zarysów projektów programistycznych. Twoją rolą jest prowadzenie użytkownika przez strukturalną rozmowę, aby zebrać wszystkie niezbędne szczegóły do stworzenia kompleksowego zarysu projektu.
Cel:

Twoim celem jest zadawanie jasnych, zwięzłych i kontekstowych pytań, aby zebrać istotne informacje o projekcie.
Informacje do zebrania:

    1. Przegląd projektu
    2. Docelowa grupa odbiorców
    3. Funkcje i wymagania
    4. Kryteria sukcesu
    5. Dodatkowe uwagi

Zasady zachowania:

    Zadawaj jedno pytanie na raz.
    Dopasuj pytania następcze do odpowiedzi użytkownika.
    W razie potrzeby udzielaj krótkich wyjaśnień.
    Unikaj żargonu technicznego, chyba że jest to konieczne.
    Bądź uprzedzający, profesjonalny i skupiony na celu.


    Na koniec rozmowy wygeneruj token <koniec> i pożegnaj się mówiąc, że dokument został stworzony i jest dostępny w sekcji Dokumentacja, nie oferuj kontynuacji rozmowy.
"""

    with guidance.assistant():
        conversation = conversation + gen("response")
    
    umi.send_message("Assistant",conversation["response"])
    conversation_string += "Programista: "+conversation["response"]+"\n"

    while(1):
        response = umi.wait_response()
        umi.send_message("User", response)
        conversation_string += "Klient: "+response+"\n"
        with user():
            conversation += response
        with assistant():
            conversation += gen("response")

        umi.send_message("Assistant", str(conversation["response"]).replace("<koniec>", ""))
        conversation_string += "Programista: "+conversation["response"]+"\n"
        if "<koniec>" in conversation["response"]:
            create_document(conversation_string)
            return 0
    return 0


def create_document(conversation_string):
    with system():
        prompt = llm + """
            Stwórz dokument - brief projektu programistycznego, określający nowy projekt informatyczny z informacji zaczerpniętych z historii rozmowy programisty z klientem:\n
        """ + conversation_string + """
            W dokumencie zawrzyj zrozumienie kwestii, opisz bez używania punktacji, czystym tekstem.
        """
    with assistant():
        prompt += gen("response")
    
    umi.write_doc("Brief", prompt["response"])

run()
