from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_documents(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100,
        separators=[
            "\n\n",
            "\n",
            ". ",
            ";",
            ",",
            " "
        ]
    )

    all_chunks = []

    for doc in documents:

        chunks = splitter.split_text(doc["text"])
        
        print("\n================================")
        print(f"TOTAL CHUNKS: {len(chunks)}")
        print("================================")

        if chunks:

            print("\n===== FIRST CHUNK =====\n")

            print(chunks[0][:1000])
        for i, chunk in enumerate(chunks):

            all_chunks.append({
                "text": chunk,
                "chunk_id": i,
                "file_name": doc["file_name"]
            })

    return all_chunks