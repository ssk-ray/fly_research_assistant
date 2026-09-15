import chromadb
from langchain_ollama import OllamaEmbeddings

# Connect to existing database
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection(name="paper")

# Embedding model
embeddings = OllamaEmbeddings(
    model="nomic-embed-text"
)

# Our question
question = "What machine learning models were used in the paper?"

# Convert question into a vector
question_vector = embeddings.embed_query(question)

# Search ChromaDB
results = collection.query(
    query_embeddings=[question_vector],
    n_results=3
)

# Print the relevant chunks
for i, document in enumerate(results["documents"][0]):
    print(f"\n--- Result {i + 1} ---")
    print(document)