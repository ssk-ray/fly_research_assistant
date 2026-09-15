import ollama

response = ollama.chat(
    model="llama3.1",
    messages=[
        {
            "role": "user",
            "content": "Explain what RAG is in one simple sentence."
        }
    ]
)

print(response["message"]["content"])
