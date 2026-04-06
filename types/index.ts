export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ClaimStatus = 'contradicted' | 'verified' | 'corroborated';
export type DocType = 'DEP' | 'CON' | 'POL';

export interface Document {
  id: string;
  name: string;
  type: DocType;
  contradictionsFound: number;
}

export interface ClaimData {
  claim_id: string;
  entity: string;
  raw_text: string;
  source_doc: string;
  page_ref: string;
}

export interface Claim extends ClaimData {
  status: ClaimStatus;
}

export interface Contradiction {
  contradiction_id: string;
  conflict_reason: string;
  conflict_type: string;
  severity: SeverityLevel;
  confidence: number;
  ai_analysis: string;
  claim_a: ClaimData;
  claim_b: ClaimData;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'claim' | 'location' | 'document';
  isConflicting?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'normal' | 'conflict';
}
