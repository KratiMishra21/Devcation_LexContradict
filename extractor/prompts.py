# prompts.py

EXTRACTION_PROMPT = """You are a forensic legal analyst AI.
Read the legal document below and extract every factual claim as structured JSON.

A claim is any assertion about:
- Where a person was at a specific time
- What a person did, said, attended, or signed
- What a person knew or did not know
- Amounts, dates, locations of events

STRICT RULES:
1. Normalize entity names — "he", "the accused", "Mr. Mehta", "the director" → same canonical name
2. Normalize locations — "HQ", "head office", "Delhi branch" → "Delhi HQ"
3. claim_type must be one of: testimony, physical_evidence, documentary, witness
4. confidence: 0.9-1.0 for physical/documentary evidence, 0.5-0.7 for hedged language
5. Return ONLY valid JSON. No markdown. No explanation. No code fences.

Document: {doc_name}
---
{doc_text}
---

Return this exact JSON structure:
{{
  "entity_map": {{
    "alias or pronoun": "Canonical Full Name"
  }},
  "claims": [
    {{
      "claim_id": "c001",
      "entity": "Canonical Full Name",
      "action": "short description of what entity did/said/knew",
      "location": "normalized location or null",
      "time": "normalized time reference or null",
      "raw_text": "exact quote or description from document",
      "source_doc": "{doc_name}",
      "page_ref": "Page 14 or Section name",
      "claim_type": "testimony",
      "confidence": 0.95
    }}
  ]
}}"""


CONTRADICTION_PROMPT = """You are a forensic legal analyst AI specializing in contradiction detection.
Find pairs of claims that CANNOT both be true at the same time.
Focus on: location conflicts, presence conflicts, knowledge conflicts, timeline conflicts, amount discrepancies.
Return ONLY valid JSON. No markdown. No explanation. No code fences.

Claims from multiple legal documents:
{claims_json}

Return this exact JSON structure:
{{
  "contradictions": [
    {{
      "contradiction_id": "con001",
      "claim_a_id": "c001",
      "claim_b_id": "c002",
      "conflict_type": "location",
      "conflict_reason": "One sentence: why these two claims cannot both be true",
      "severity": "critical",
      "confidence": 0.94,
      "ai_analysis": "2-3 sentences explaining legal significance and case impact"
    }}
  ]
}}

Severity rules:
- critical: direct alibi contradiction, sworn testimony vs physical evidence, potential perjury
- high: significant credibility issue affecting case theory
- medium: minor discrepancy with possible innocent explanation
- high: significant credibility issue affecting case theory — e.g. email records contradicting claimed ignorance"""
