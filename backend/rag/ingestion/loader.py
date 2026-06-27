import os
import fitz  # PyMuPDF

from cleaner import clean_text
from chunker import chunk_documents
from embeddings import create_vector_db
# Folder containing PDFs
PDF_FOLDER = "../data"


def extract_text_from_pdf(pdf_path):
    """
    Extract text from a single PDF
    """

    text = ""

    try:
        # Open PDF
        doc = fitz.open(pdf_path)

        # Read each page
        for page_num in range(len(doc)):

            page = doc.load_page(page_num)

            page_text = page.get_text()

            text += page_text

        doc.close()

    except Exception as e:
        print(f"Error reading {pdf_path}")
        print(e)

    return text


def load_all_pdfs():
    """
    Load and clean all PDFs
    """

    documents = []

    # Loop through all files
    for file_name in os.listdir(PDF_FOLDER):

        # Process only PDFs
        if file_name.endswith(".pdf"):

            full_path = os.path.join(PDF_FOLDER, file_name)

            print("\n===================================")
            print(f"Processing: {file_name}")
            print("===================================")

            # Extract raw text
            raw_text = extract_text_from_pdf(full_path)

            print(f"\nRaw Characters: {len(raw_text)}")

            # Clean text
            cleaned_text = clean_text(raw_text)

            print(f"Cleaned Characters: {len(cleaned_text)}")

            # Save document
            document = {
                "file_name": file_name,
                "text": cleaned_text
            }

            documents.append(document)

            # Preview cleaned text
            print("\n===== CLEANED TEXT PREVIEW =====\n")

            preview = cleaned_text[:1000]

            print(preview)

            print("\n-----------------------------------")

    return documents


if __name__ == "__main__":

    print("\nLoading PDFs...\n")

    docs = load_all_pdfs()

    all_chunks = chunk_documents(docs)
    vector_db = create_vector_db(all_chunks)

    print("\n===================================")
    print(f"Total PDFs Loaded: {len(docs)}")
    print("===================================")

    # Total characters
    total_chars = sum(len(doc["text"]) for doc in docs)

    print(f"\nTotal Characters: {total_chars}")
    print("\n===================================")
    print(f"TOTAL CHUNKS CREATED: {len(all_chunks)}")
    print("===================================")