from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma


def create_vector_db(chunks):
    """
    Create embeddings and store in ChromaDB
    """

    print("\nLoading embedding model...\n")

    # Embedding model
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Embedding model loaded successfully.\n")

    texts = []
    metadatas = []

    # Prepare data
    for chunk in chunks:

        texts.append(chunk["text"])

        metadatas.append({
            "file_name": chunk["file_name"],
            "chunk_id": chunk["chunk_id"]
        })

    print(f"Total Text Chunks: {len(texts)}")
    print("\n================================")
    print("SAVING CHUNKS TO CHROMADB")
    print("================================")

    print(f"TOTAL TEXTS: {len(texts)}")

    print("\n===== SAMPLE STORED TEXT =====\n")

    print(texts[0][:1000])
    # Create vector database
    vector_db = Chroma.from_texts(
        texts=texts,
        embedding=embedding_model,
        metadatas=metadatas,
        persist_directory="../chroma_db"
    )

    print("\n===================================")
    print("Vector DB Created Successfully")
    print("===================================")

    print(f"\nStored {len(texts)} chunks in ChromaDB")

    return vector_db