from umiserver_python import WorkflowClient
import sys
import re
import guidance
from guidance import assistant, gen, models, system, token_limit, user

# Connect to LM Studio's local API
llm = models.OpenAI(
    model="gpt-4o",
)

umi = WorkflowClient(sys.argv[1],sys.argv[2])

# Run the conversation
def run():
    brief_file = umi.read_doc("Brief")

    with guidance.system():
        conversation = llm + """
        Stwórz listę endpointów do implementacji i napisz prompt do stworzenia implementacji backendu aplikacji napisanej w ruscie przy wykorzystaniu frameworku actix-web. Napisz wyłącznie sam prompt, bez żadnych komentarzy. Oto plik z opisem projektu:
        """ + brief_file

    with guidance.assistant():
        conversation = conversation + gen("response")
    
    umi.send_message("Assistant",conversation["response"])

    with guidance.system():
        code = llm + conversation["response"]
    
    # Generate the backend implementation in chunks
    complete_code = ""
    for i in range(0,3):
        with guidance.assistant():
            code = code + gen("response", max_tokens=40000)
            if not code["response"].strip():  # Stop if no more content is generated
                break
            complete_code += code["response"]
    
    umi.send_message("Assistant", complete_code)  # Send the current chunk

    save_generated_code(complete_code)

    umi.send_message("Assistant", "Code snippets has been saved.") 

def extract_all_code_blocks(response): 
    pattern = r"```(\w+)\n(.*?)```"
    return re.findall(pattern, response, re.DOTALL)

def save_generated_code(response):
    code_blocks = extract_all_code_blocks(response)

    for code_block in code_blocks:
        if code_block[0] == 'toml':
            umi.write_code("Cargo.toml", code_block[1])
        if code_block[0] == 'rust':
            umi.write_code("main.rs", code_block[1])

run()
