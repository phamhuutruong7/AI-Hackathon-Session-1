import openai


def generate(
        purpose = "",
        context = ""
):
    def_sys = { "role": "system",
                        "content":  "Return results in JSON format with these atrribute:\n"
                                    + "title, subject, content"
                                    + "\n"
                                    + "\nYou act as a " + purpose}
    
    def_use = { "role": "user",
                        "content":  "Please create a email with these context:" + context 
    }

    messages = def_sys + def_use
    return call_openai(messages)

def call_openai(
        messages = []
):
    client = openai.OpenAI(
        base_url="https://aiportalapi.stu-platform.live/jpe",
        api_key=""
    )

    response = client.chat.completions.create(
        model="GPT-4o-mini",
        messages=messages
    )

    return  response.choices[0].message.content

def translate(
        language
):
    def_sys = { "role": "system",
                        "content":  "Return results in JSON format with these atrribute:\n"
                                    + "title, subject, content"
                                    + "\n"
                                    + "\nYou act as a translator"}
    
    def_use = { "role": "user",
                        "content": "Please translate the content into" + language
    }

    messages = def_sys + def_use
    return call_openai(messages)