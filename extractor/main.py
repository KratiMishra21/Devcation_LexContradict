# main.py
import json
import os
import tempfile
import uuid
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from extractor import extract_all
import google.generativeai as genai
from dotenv import load_dotenv

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Configure Gemini for date extraction
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash-lite")

# In-memory store with folder support
folders = {}  # {folder_id: {"name": str, "created_at": str, "data": {...}, "uploaded_paths": [...]}}
default_folder_id = None  # will be created on first load

def get_or_create_default_folder():
    global default_folder_id
    if default_folder_id is None:
        default_folder_id = str(uuid.uuid4())
        folders[default_folder_id] = {
            "name": "Default Folder",
            "created_at": datetime.now().isoformat(),
            "data": {"claims": [], "contradictions": [], "summary": {}},
            "uploaded_paths": []
        }
    return default_folder_id


def extract_dates_from_claims(claims, contradictions):
    """Use Gemini to extract dates from claims"""
    if not claims:
        return []
    
    claims_text = json.dumps(claims[:50], indent=2)  # Limit to avoid token limits
    prompt = f"""Extract all dates, times, and temporal references from these legal claims. 
Return as JSON array with objects: {{"date": "extracted date", "claim_id": "claim id", "entity": "entity name"}}.
Only return valid dates in ISO or readable format. If no clear date, skip it.

Claims:
{claims_text}

Return ONLY valid JSON array, no other text."""
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean JSON response
        import re
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        dates = json.loads(text)
        return dates if isinstance(dates, list) else []
    except:
        return []


@app.post("/folders")
async def create_folder(body: dict):
    """Create a new folder for organizing document groups"""
    folder_id = str(uuid.uuid4())
    folders[folder_id] = {
        "name": body.get("name", "New Folder"),
        "created_at": datetime.now().isoformat(),
        "data": {"claims": [], "contradictions": [], "summary": {}},
        "uploaded_paths": []
    }
    return {"folder_id": folder_id, "name": folders[folder_id]["name"]}


@app.get("/folders")
async def list_folders():
    """List all folders"""
    return {
        "folders": [
            {
                "id": fid,
                "name": f["name"],
                "created_at": f["created_at"],
                "documents": len(f["uploaded_paths"]),
                "contradictions": f["data"]["summary"].get("total_contradictions", 0)
            }
            for fid, f in folders.items()
        ]
    }


@app.delete("/folders/{folder_id}")
async def delete_folder(folder_id: str):
    """Delete a folder and all its data"""
    if folder_id in folders:
        del folders[folder_id]
        return {"status": "deleted"}
    return {"error": "Folder not found"}, 404

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...), folder_id: str = Query(None)):
    """Upload document to a specific folder (or default if not specified)"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    suffix = os.path.splitext(file.filename)[1]
    tmp_path = os.path.join(tempfile.gettempdir(), f"{uuid.uuid4()}_{file.filename}")
    
    with open(tmp_path, "wb") as f:
        f.write(await file.read())
    
    # Track file for this folder
    folder = folders[folder_id]
    if tmp_path not in folder["uploaded_paths"]:
        folder["uploaded_paths"].append(tmp_path)
    
    # Extract data only for this folder's documents
    result = extract_all(folder["uploaded_paths"])
    folder["data"] = result

    return {
        "claims_found": result["summary"]["total_claims"],
        "contradictions_found": result["summary"]["total_contradictions"],
        "folder_id": folder_id
    }


@app.get("/contradictions")
async def get_contradictions(folder_id: str = Query(None)):
    """Get contradictions for a folder"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    data = folders[folder_id]["data"]
    return {
        "contradictions": data.get("contradictions", []),
        "summary": data.get("summary", {
            "total_contradictions": 0,
            "critical": 0,
            "high": 0,
            "medium": 0,
            "total_claims": 0,
            "documents_processed": 0
        })
    }


@app.get("/claims")
async def get_claims(folder_id: str = Query(None)):
    """Get claims for a folder"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    return folders[folder_id]["data"].get("claims", [])


@app.get("/summary")
async def get_summary(folder_id: str = Query(None)):
    """Get summary for a folder"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    return folders[folder_id]["data"].get("summary", {})


@app.get("/timeline")
async def get_timeline(folder_id: str = Query(None)):
    """Get timeline view with dates extracted from claims"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    data = folders[folder_id]["data"]
    claims = data.get("claims", [])
    contradictions = data.get("contradictions", [])
    
    # Extract dates from claims
    dates = extract_dates_from_claims(claims, contradictions)
    
    # Group contradictions with dates
    timeline_events = []
    for contradiction in contradictions:
        # Try to find dates related to this contradiction
        related_dates = [d for d in dates if d.get("claim_id") in [contradiction.get("claim_a", {}).get("claim_id"), contradiction.get("claim_b", {}).get("claim_id")]]
        
        timeline_events.append({
            "date": related_dates[0].get("date") if related_dates else "Unknown",
            "contradiction": contradiction,
            "severity": contradiction.get("severity", "medium")
        })
    
    # Sort by date
    timeline_events.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "timeline": timeline_events,
        "total_dated_contradictions": len([e for e in timeline_events if e["date"] != "Unknown"])
    }


@app.get("/export/pdf")
async def export_pdf(folder_id: str = Query(None)):
    """Export contradiction summary as PDF"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    
    # Create PDF with proper Windows temp path
    import tempfile
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, f"contradiction_report_{folder_id}.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#d32f2f'),
        spaceAfter=30,
        alignment=1  # Center
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#6b5b95'),
        spaceAfter=12
    )
    
    # Title
    folder_name = folders[folder_id]["name"]
    story.append(Paragraph(f"LexContradict - {folder_name}", title_style))
    story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Summary section
    data = folders[folder_id]["data"]
    summary = data.get("summary", {})
    
    story.append(Paragraph("Summary", heading_style))
    summary_data = [
        ["Metric", "Value"],
        ["Total Contradictions", str(summary.get("total_contradictions", 0))],
        ["Critical", str(summary.get("critical", 0))],
        ["High Severity", str(summary.get("high", 0))],
        ["Medium Severity", str(summary.get("medium", 0))],
        ["Total Claims", str(summary.get("total_claims", 0))],
        ["Documents", str(summary.get("documents_processed", 0))],
    ]
    
    summary_table = Table(summary_data, colWidths=[2.5*inch, 2.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6b5b95')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Contradictions section
    story.append(Paragraph("Contradictions", heading_style))
    contradictions = data.get("contradictions", [])
    
    for contradiction in contradictions[:10]:  # Limit to 10 for readability
        severity = contradiction.get("severity", "Unknown").upper()
        conflict_reason = contradiction.get("conflict_reason", "N/A")
        confidence = contradiction.get("confidence", 0)
        
        story.append(Paragraph(f"<b>{severity}</b> | Confidence: {confidence:.0%}", styles['Normal']))
        story.append(Paragraph(f"{conflict_reason}", styles['BodyText']))
        
        claim_a = contradiction.get("claim_a", {})
        claim_b = contradiction.get("claim_b", {})
        
        story.append(Paragraph(f"<i>Claim A:</i> {claim_a.get('raw_text', 'N/A')[:100]}...", styles['Normal']))
        story.append(Paragraph(f"<i>Claim B:</i> {claim_b.get('raw_text', 'N/A')[:100]}...", styles['Normal']))
        story.append(Spacer(1, 0.15*inch))
    
    # Build PDF
    doc.build(story)
    
    return FileResponse(pdf_path, filename=f"contradictions_{folder_name}.pdf")


@app.post("/ask")
async def ask(body: dict, folder_id: str = Query(None)):
    """AI-powered Q&A about contradictions in a folder"""
    if folder_id is None:
        folder_id = get_or_create_default_folder()
    
    if folder_id not in folders:
        return {"error": "Folder not found"}, 404
    
    question = body.get("question", "")
    data = folders[folder_id]["data"]
    contradictions = data.get("contradictions", [])

    if not contradictions:
        return {"answer": "No documents uploaded yet. Please upload a document first."}

    context = json.dumps(contradictions, indent=2)
    prompt = f"""You are a forensic legal analyst. Answer the question based on these contradictions found in legal documents.

Contradictions:
{context}

Question: {question}

Give a clear, concise answer in 2-3 sentences."""

    response = model.generate_content(prompt)
    return {"answer": response.text.strip()}
