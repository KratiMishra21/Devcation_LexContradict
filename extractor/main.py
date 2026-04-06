# main.py
import json
import os
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_all

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# In-memory store
current_data = {"claims": [], "contradictions": [], "summary": {}}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Save uploaded file temporarily
    suffix = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    result = extract_all([tmp_path])
    current_data.update(result)
    os.unlink(tmp_path)

    return {
        "claims_found": result["summary"]["total_claims"],
        "contradictions_found": result["summary"]["total_contradictions"]
    }

@app.get("/contradictions")
def get_contradictions():
    return {
        "contradictions": current_data["contradictions"],
        "summary": current_data.get("summary", {
            "total_contradictions": 0,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "total_claims": 0,
            "documents_processed": 0
        })
    }

@app.get("/claims")
def get_claims():
    return current_data["claims"]

@app.get("/summary")
def get_summary():
    return current_data["summary"]

@app.post("/ask")
async def ask(body: dict):
    question = body.get("question", "")
    contradictions = current_data["contradictions"]

    if not contradictions:
        return {"answer": "No documents uploaded yet. Please upload a document first."}

    from groq import Groq
    from dotenv import load_dotenv
    load_dotenv()
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    context = json.dumps(contradictions, indent=2)
    prompt = f"""You are a forensic legal analyst. Answer the question based on these contradictions found in legal documents.

Contradictions:
{context}

Question: {question}

Give a clear, concise answer in 2-3 sentences."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
    )
    return {"answer": response.choices[0].message.content.strip()}