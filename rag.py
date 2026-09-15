import os
import chromadb
from embeddings import embed_text, get_gemini_client

CHROMA_PATH = "./chroma_db"


def ask_paper(question, collection_name="paper", n_results=3, history=None):
    """
    Answers a question about the ingested paper using RAG.
    `history` is a list of {"role": "user"|"assistant", "content": ...} dicts,
    matching how the frontend stores chat messages.
    Returns (answer, sources) where sources is a list of dicts with the
    retrieved text snippet and its page number, for citation display.
    """
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_collection(name=collection_name)

    question_vector = embed_text(question)

    results = collection.query(
        query_embeddings=[question_vector],
        n_results=n_results
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(documents)

    context = "\n\n".join(documents)

    # Include the last couple of exchanges so follow-up questions work
    history_text = ""
    if history:
        for turn in history[-4:]:
            role_label = "User" if turn.get("role") == "user" else "Assistant"
            history_text += f"{role_label}: {turn.get('content', '')}\n"

    prompt = f"""You are a research assistant answering questions about a specific document.
Answer the question using ONLY the context provided below.
If the context doesn't contain the answer, say you don't know rather than guessing.

Previous conversation:
{history_text}

Context from the document:
{context}

Question:
{question}
"""

    client_gemini = get_gemini_client()
    response = client_gemini.models.generate_content(
        model="gemini-2.5-flash",  # free tier, fast, good fit for this kind of Q&A
        contents=prompt,
    )

    answer = response.text

    sources = [
        {
            "text": doc[:250] + ("..." if len(doc) > 250 else ""),
            "page": meta.get("page", "?")
        }
        for doc, meta in zip(documents, metadatas)
    ]

    return answer, sources


if __name__ == "__main__":
    # Make sure GEMINI_API_KEY is set in your environment first.
    question = input("Ask a question: ")
    answer, sources = ask_paper(question)
    print("\n" + answer)
    print("\n--- Sources ---")
    for s in sources:
        print(f"(page {s['page']}) {s['text']}")