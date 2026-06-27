import fitz
import pytesseract

from pdf2image import convert_from_path

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text_from_pdf(pdf_path):

    full_text = ""

    try:

        doc = fitz.open(pdf_path)

        for page_num in range(len(doc)):

            page = doc.load_page(page_num)

            text = page.get_text()

            # OCR fallback
            if len(text.strip()) < 50:

                print(f"OCR Page {page_num + 1}")

                images = convert_from_path(
                    pdf_path,
                    first_page=page_num + 1,
                    last_page=page_num + 1
                )

                ocr_text = pytesseract.image_to_string(images[0])

                full_text += "\n" + ocr_text

            else:

                full_text += "\n" + text

        doc.close()

    except Exception as e:

        print(f"Error extracting {pdf_path}")

        print(e)

    return full_text