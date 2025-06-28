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
    conversation = llm + ""
    conversation_string = ""
    while(1):
        response = umi.wait_response()
        umi.send_message("User", response)
        conversation_string += "Klient: "+response+"\n"
        with user():
            conversation += response
        with assistant():
            conversation += gen("response")

        
        umi.send_message("Assistant", str(conversation["response"]))
        ask_for_music(conversation["response"])
        
        conversation_string += "Chatbot: "+conversation["response"]+"\n"
    return 0


def ask_for_music(text):
    music_conv = llm + ""
    with guidance.system():
        music_conv += """
        Napisz zapytanie do Youtube'a, aby znaleźć utwór muzyczny pasujący do vibu podanego tekstu. Zapytanie nie powinno zawierać żadnych słów kluczowych, które mogą być użyte do wyszukiwania konkretnego utworu. Preferuj krótkie, konkretne, proste opisy bez przecinków. Preferuj oryginalny język dotyczący omawianego faktu lub język angielski. Wyszukiwanie powinno wyszukiwać muzykę, a nie jakieś randomowe wideo z youtube! Trzymaj się ogólników, a nie konkretnych tematów. Nie dodawaj nic więcej, tylko zapytanie.:
    """ + text + "\t\n Podaj tylko wyszukiwanie, nie dodawaj nic więcej."
    
    with guidance.assistant():
        music_conv = music_conv + gen("response")
    
    umi.send_message("Assistant","Wyszukiwanie: " + music_conv["response"])
    download_and_play(music_conv["response"])

    
import subprocess
import os
import glob

def download_and_play(query):
    # Krok 1: Pobierz plik
    query = query.replace("\"", " ")
    subprocess.run("mkdir music", shell=True)
    os.chdir("./music")

    subprocess.run("rm -rf *.mp4 *.webm *.m4a *.mp3", shell=True)
    # Użyj youtube-dl do pobrania pliku audio
    # command = f'youtube-dl ytsearch2:\"{query}\" --format bestaudio --extract-audio --audio-format mp3'
    # print(f"Pobieram: {command}")
    # subprocess.run(command, shell=True)
    os.system('youtube-dl --get-url "ytsearch2:{}" --format bestaudio'.format(query)+ "> search.txt")
    file = open("search.txt","r")
    output = file.read()
    file.close()

    output = output.split("\n")[0]
    
    subprocess.Popen('vlc -I dummy --one-instance "{}" &'.format(output), shell=True)

    # Krok 2: Znajdź najnowszy pobrany plik wideo/audio
    # files = sorted(
    #     glob.glob("*.mp4") + glob.glob("*.webm") + glob.glob("*.m4a") + glob.glob("*.mp3"),
    #     key=os.path.getmtime,
    #     reverse=True
    # )

    # if not files:
    #     print("Nie znaleziono pliku :(")
    #     return

    # newest_file = files[0]
    # print(f"Otwieram: {newest_file}")

    # # Krok 3: Otwórz plik domyślnym odtwarzaczem
    # os.startfile(f"{newest_file}")  # działa na Windowsie

# przykład użycia



run()


