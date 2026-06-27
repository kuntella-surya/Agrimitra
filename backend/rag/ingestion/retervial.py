from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# =========================
# LOAD EMBEDDING MODEL
# =========================
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# =========================
# LOAD CHROMADB
# =========================
vector_db = Chroma(
    persist_directory="./rag/chroma_db",
    embedding_function=embedding_model
)

# =========================
# CREATE RETRIEVER
# =========================
retriever = vector_db.as_retriever(
    search_kwargs={"k": 3}
)

# =========================
# RETRIEVE FUNCTION
# =========================
def retrieve_documents(query):

    docs = retriever.invoke(query)

    return docs