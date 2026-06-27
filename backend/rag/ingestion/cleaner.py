import re


def clean_text(text):

    # Remove excessive spaces
    text = re.sub(r'\s+', ' ', text)

    # Remove repeated dots
    text = re.sub(r'\.{2,}', '.', text)

    # Remove long separators
    text = re.sub(r'[-_=]{3,}', ' ', text)

    # Remove page labels
    text = re.sub(r'Page\s+\d+', '', text)

    # Remove weird unicode artifacts
    text = re.sub(r'[•▪■□]', ' ', text)

    return text.strip()