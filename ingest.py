from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from embeddings import embed_text
import chromadb

CHROMA_PATH = "./chroma_db"


def ingest_pdf(file_path, collection_name="paper"):
    """
    Loads a PDF, splits it into chunks, embeds each chunk, and stores
    everything in ChromaDB under the given collection name.
    Returns (num_pages, num_chunks) so the UI can show a status message.
    """
    # Load PDF
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(pages)

    # Connect to ChromaDB
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    # Clear out any previous version of this collection so re-uploading
    # a new paper doesn't mix old chunks in with new ones
    try:
        client.delete_collection(name=collection_name)
    except Exception:
        pass

    collection = client.get_or_create_collection(name=collection_name)

    # Add chunks + embeddings + page metadata (for source citations later)
    # Also build a plain list of chunk content, so the API can send real
    # indexed content back to the frontend (not just counts).
    chunk_data = []
    for i, chunk in enumerate(chunks):
        vector = embed_text(chunk.page_content)
        page_number = chunk.metadata.get("page", 0) + 1

        collection.upsert(
            ids=[str(i)],
            documents=[chunk.page_content],
            metadatas=[{"page": page_number}],
            embeddings=[vector]
        )

        chunk_data.append({
            "id": str(i),
            "page": page_number,
            "content": chunk.page_content
        })

    return len(pages), len(chunks), chunk_data


if __name__ == "__main__":
    # Lets you still run `python ingest.py` directly for testing
    num_pages, num_chunks, _ = ingest_pdf("sample_paper.pdf")
    print(f"Loaded {num_pages} pages")
    print(f"Stored {num_chunks} chunks in ChromaDB")