from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# load embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# load vector db
vector_db = Chroma(
    persist_directory="../chroma_db",
    embedding_function=embedding_model
)

query = "rice varieties"

docs = vector_db.similarity_search(query, k=5)

print("\n========== RETRIEVED DOCS ==========\n")

for i, doc in enumerate(docs, 1):
    print(f"\nDOC {i}")
    print(doc.page_content[:500])

print("\nTOTAL DOCS:", len(docs))