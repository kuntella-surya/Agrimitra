import os

from extractor import extract_text_from_pdf
from cleaner import clean_text
from chunker import chunk_documents
from embeddings import create_vector_db

PDF_FOLDER = "../data"


def load_all_pdfs():

    documents = []

    for file_name in os.listdir(PDF_FOLDER):

        if file_name.endswith(".pdf"):

            full_path = os.path.join(PDF_FOLDER, file_name)

            print("\n================================")
            print(f"Processing: {file_name}")
            print("================================")

            raw_text = extract_text_from_pdf(full_path)

            print(f"\nRaw Length: {len(raw_text)}")
            print("\n===== RAW TEXT SAMPLE =====\n")

            print(raw_text[:2000])

            print("\n===========================\n")

            cleaned_text = clean_text(raw_text)

            print(f"Cleaned Length: {len(cleaned_text)}")

            documents.append({
                "file_name": file_name,
                "text": cleaned_text
            })

    return documents


if __name__ == "__main__":

    docs = load_all_pdfs()

    chunks = chunk_documents(docs)

    print(f"\nTotal Chunks: {len(chunks)}")

    create_vector_db(chunks)

    print("\nIngestion Complete")