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
    with guidance.system():
        conversation = llm + ""

    # with guidance.assistant():
    #     conversation = conversation + gen("response")

    while(1):
        response = umi.wait_response()
        umi.send_message("User", response)
        with user():
            conversation += response
        with assistant():
            conversation += gen("response")

        umi.send_message("Assistant", str(conversation["response"]).replace("<koniec>", ""))
        
    return 0

run()
