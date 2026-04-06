import json
import re
import os
from dotenv import load_dotenv
from groq import Groq
from reader import read_document
from prompts import EXTRACTION_PROMPT, CONTRADICTION_PROMPT

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_gemini(prompt: str) -> dict:
    chat = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
    )
    text = chat.choices[0].message.content.strip()
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return json.loads(text.strip())

def extract_claims(filepath: str, doc_index: int) -> list[dict]:
    doc_name, doc_text = read_document(filepath)
    print(f"  Reading: {doc_name}")

    prompt = EXTRACTION_PROMPT.format(
        doc_name=doc_name,
        doc_text=doc_text[:10000]
    )

    result = call_gemini(prompt)
    claims = result.get("claims", [])

    for i, claim in enumerate(claims):
        claim["claim_id"] = f"d{doc_index}c{i+1:02d}"
        claim["source_doc"] = doc_name

    print(f"  Extracted {len(claims)} claims from {doc_name}")
    return claims


def detect_contradictions(all_claims: list[dict]) -> list[dict]:
    print(f"  Detecting contradictions across {len(all_claims)} claims...")

    compact = [{
        "claim_id": c["claim_id"],
        "entity": c["entity"],
        "action": c["action"],
        "location": c.get("location"),
        "time": c.get("time"),
        "source_doc": c["source_doc"],
        "page_ref": c.get("page_ref", ""),
        "claim_type": c["claim_type"],
        "raw_text": c["raw_text"][:200]
    } for c in all_claims]

    prompt = CONTRADICTION_PROMPT.format(
        claims_json=json.dumps(compact, indent=2)
    )

    result = call_gemini(prompt)
    contradictions = result.get("contradictions", [])
    print(f"  Found {len(contradictions)} contradictions")
    return contradictions


def _build_claim_data(claim_id: str, all_claims: list[dict]) -> dict:
    for c in all_claims:
        if c["claim_id"] == claim_id:
            return {
                "claim_id": c["claim_id"],
                "entity": c["entity"],
                "raw_text": c["raw_text"],
                "source_doc": c["source_doc"],
                "page_ref": c.get("page_ref", "")
            }
    return {"claim_id": claim_id, "entity": "", "raw_text": "", "source_doc": "", "page_ref": ""}


def _format_contradictions(contradictions: list[dict], all_claims: list[dict]) -> list[dict]:
    formatted = []
    for con in contradictions:
        formatted.append({
            "contradiction_id": con["contradiction_id"],
            "conflict_reason": con["conflict_reason"],
            "conflict_type": con["conflict_type"],
            "severity": con["severity"],
            "confidence": con["confidence"],
            "ai_analysis": con["ai_analysis"],
            "claim_a": _build_claim_data(con["claim_a_id"], all_claims),
            "claim_b": _build_claim_data(con["claim_b_id"], all_claims)
        })
    return formatted


def extract(filepath: str, doc_index: int = 1) -> dict:
    claims = extract_claims(filepath, doc_index)
    return {"claims": claims, "contradictions": []}


def extract_all(filepaths: list[str]) -> dict:
    all_claims = []

    for i, path in enumerate(filepaths, 1):
        try:
            claims = extract_claims(path, i)
            all_claims.extend(claims)
        except Exception as e:
            print(f"  Error processing {path}: {e}")

    raw_contradictions = detect_contradictions(all_claims) if len(all_claims) >= 2 else []
    contradictions = _format_contradictions(raw_contradictions, all_claims)

    return {
        "claims": all_claims,
        "contradictions": contradictions,
        "summary": {
            "total_claims": len(all_claims),
            "total_contradictions": len(contradictions),
            "critical": sum(1 for c in contradictions if c["severity"] == "critical"),
            "high": sum(1 for c in contradictions if c["severity"] == "high"),
            "medium": sum(1 for c in contradictions if c["severity"] == "medium"),
            "documents_processed": len(filepaths)
        }
    }


if __name__ == "__main__":
    docs = [
        "sample_docs/mehta_deposition.txt",
        "sample_docs/exhibits_bundle.txt",
        "sample_docs/witness_statements.txt",
    ]

    print("\nRunning extraction pipeline...")
    output = extract_all(docs)

    with open("output.json", "w") as f:
        json.dump(output, f, indent=2)

    print(f"\nDone!")
    print(f"Claims:         {output['summary']['total_claims']}")
    print(f"Contradictions: {output['summary']['total_contradictions']}")
    print(f"  Critical: {output['summary']['critical']}")
    print(f"  High:     {output['summary']['high']}")
    print(f"  Medium:   {output['summary']['medium']}")
    print(f"\nOutput saved to output.json")