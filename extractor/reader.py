# reader.py
from pathlib import Path

def read_document(filepath: str) -> tuple[str, str]:
    """Returns (filename, text_content)"""
    path = Path(filepath)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    if path.suffix.lower() == ".pdf":
        import fitz
        doc = fitz.open(str(path))
        pages = []
        for i, page in enumerate(doc, 1):
            text = page.get_text().strip()
            if text:
                pages.append(f"--- PAGE {i} ---\n{text}")
        return path.name, "\n\n".join(pages)

    elif path.suffix.lower() in (".txt", ".md"):
        return path.name, path.read_text(encoding="utf-8")

    else:
        raise ValueError(f"Unsupported file type: {path.suffix}")