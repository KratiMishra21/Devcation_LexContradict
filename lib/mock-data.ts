import { Document, Contradiction, Claim, Entity, GraphNode, GraphEdge } from '@/types';

export const mockDocuments: Document[] = [
  { id: 'doc1', name: 'Deposition A', type: 'DEP', contradictionCount: 3, uploadDate: '2024-01-15' },
  { id: 'doc2', name: 'Contract B', type: 'CON', contradictionCount: 1, uploadDate: '2024-01-14' },
  { id: 'doc3', name: 'Policy C', type: 'POL', contradictionCount: 2, uploadDate: '2024-01-13' },
  { id: 'doc4', name: 'Deposition D', type: 'DEP', contradictionCount: 0, uploadDate: '2024-01-12' },
];

export const mockEntities: Entity[] = [
  { id: 'ent1', name: 'John Smith', type: 'Person' },
  { id: 'ent2', name: 'January 15, 2024', type: 'Time' },
  { id: 'ent3', name: 'New York Office', type: 'Place' },
  { id: 'ent4', name: 'Sarah Johnson', type: 'Person' },
  { id: 'ent5', name: 'March 1, 2024', type: 'Time' },
  { id: 'ent6', name: 'Chicago', type: 'Place' },
];

export const mockClaims: Claim[] = [
  {
    id: 'claim1',
    text: 'John Smith was present at the New York Office on January 15, 2024',
    sourceDoc: 'doc1',
    entity: mockEntities[0],
    status: 'Contradicted',
    timestamp: 'January 15, 2024',
    location: 'New York Office',
  },
  {
    id: 'claim2',
    text: 'John Smith was in Chicago during the entire month of January 2024',
    sourceDoc: 'doc2',
    entity: mockEntities[0],
    status: 'Contradicted',
    timestamp: 'January 2024',
    location: 'Chicago',
  },
  {
    id: 'claim3',
    text: 'The contract was signed on January 10, 2024',
    sourceDoc: 'doc2',
    entity: mockEntities[1],
    status: 'Verified',
    timestamp: 'January 10, 2024',
    location: 'New York Office',
  },
  {
    id: 'claim4',
    text: 'Sarah Johnson approved the policy on March 1, 2024',
    sourceDoc: 'doc3',
    entity: mockEntities[3],
    status: 'Corroborated',
    timestamp: 'March 1, 2024',
    location: 'New York Office',
  },
  {
    id: 'claim5',
    text: 'The policy was effective from February 15, 2024',
    sourceDoc: 'doc3',
    entity: mockEntities[1],
    status: 'Verified',
    timestamp: 'February 15, 2024',
    location: 'New York Office',
  },
];

export const mockContradictions: Contradiction[] = [
  {
    id: 'contra1',
    severity: 'Critical',
    claim1: mockClaims[0],
    claim2: mockClaims[1],
    entityChain: [mockEntities[0], mockEntities[1], mockEntities[2]],
    analysis:
      'John Smith cannot be in two locations simultaneously. Claim 1 states he was in New York on January 15, while Claim 2 states he was in Chicago the entire month. This is a direct temporal and spatial contradiction.',
  },
  {
    id: 'contra2',
    severity: 'High',
    claim1: mockClaims[2],
    claim2: mockClaims[4],
    entityChain: [mockEntities[1], mockEntities[2]],
    analysis:
      'The contract signature date (January 10) conflicts with the policy effective date (February 15). These documents should have consistent date references.',
  },
  {
    id: 'contra3',
    severity: 'Medium',
    claim1: mockClaims[3],
    claim2: mockClaims[4],
    entityChain: [mockEntities[3], mockEntities[1], mockEntities[2]],
    analysis:
      'Sarah Johnson&apos;s approval date and the policy effective date show a timing gap. Clarification needed on whether approval precedes implementation.',
  },
];

export const mockGraphNodes: GraphNode[] = [
  { id: 'entity-john', label: 'John Smith', type: 'Entity' },
  { id: 'entity-sarah', label: 'Sarah Johnson', type: 'Entity' },
  { id: 'entity-ny', label: 'New York', type: 'Location' },
  { id: 'entity-chicago', label: 'Chicago', type: 'Location' },
  { id: 'claim1-node', label: 'Claim: NY Jan 15', type: 'Claim', isConflicting: true },
  { id: 'claim2-node', label: 'Claim: Chicago Jan', type: 'Claim', isConflicting: true },
  { id: 'claim3-node', label: 'Claim: Contract Signed', type: 'Claim' },
  { id: 'claim4-node', label: 'Claim: Policy Approved', type: 'Claim' },
  { id: 'doc1-node', label: 'Deposition A', type: 'Document' },
  { id: 'doc2-node', label: 'Contract B', type: 'Document' },
  { id: 'doc3-node', label: 'Policy C', type: 'Document' },
];

export const mockGraphEdges: GraphEdge[] = [
  { source: 'entity-john', target: 'claim1-node', type: 'normal' },
  { source: 'entity-john', target: 'claim2-node', type: 'normal' },
  { source: 'claim1-node', target: 'claim2-node', type: 'CONFLICTS_WITH' },
  { source: 'entity-ny', target: 'claim1-node', type: 'normal' },
  { source: 'entity-chicago', target: 'claim2-node', type: 'normal' },
  { source: 'claim1-node', target: 'doc1-node', type: 'normal' },
  { source: 'claim2-node', target: 'doc2-node', type: 'normal' },
  { source: 'claim3-node', target: 'doc2-node', type: 'normal' },
  { source: 'claim4-node', target: 'doc3-node', type: 'normal' },
  { source: 'entity-sarah', target: 'claim4-node', type: 'normal' },
];

export const mockStats = {
  totalContradictions: 3,
  documents: 4,
  claims: 5,
  criticalCount: 1,
};
