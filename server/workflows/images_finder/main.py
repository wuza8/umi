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
    umi.send_message("Assistant", "Wklej akapit tutaj:")
    response = umi.wait_response()

    response = response.split(".")

    for line in response:
        if line == "":
            continue

        with guidance.system():
            conversation = llm + """
    Napisz wyszukiwanie w przeglądarce google, aby znaleźć zdjęcie do zadanego zdania. Wyszukiwanie powinno być w języku angielskim i opisywać jakieś miejsce lub typ miejsca lub zawierać postacie bez imion i nazwisk. Wygeneruj tylko krótkie wyszukiwanie.


    """ + line

        with guidance.assistant():
            conversation = conversation + gen("response")
        
        umi.send_message("Assistant","<a href=\"https://duckduckgo.com/?t=ffab&q="+conversation["response"].replace(" ","+").replace("\"", "")+"&iax=images&ia=images\">"+conversation["response"]+"</a> "+line)
    return 0

run()
