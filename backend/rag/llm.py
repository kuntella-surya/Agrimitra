
import ollama


def generate_answer(prompt):

    try:

        response = ollama.chat(
            model="mistral",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response["message"]["content"]

    except Exception as e:

        return f"LLM Error: {str(e)}"