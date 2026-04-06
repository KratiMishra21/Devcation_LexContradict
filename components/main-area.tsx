'use client';

import { useState } from 'react';
import { Contradiction, Claim, GraphNode, GraphEdge } from '@/types';
import { ContradictionsTab } from './contradictions-tab';
import { GraphView } from './graph-view';
import { AllClaimsTab } from './all-claims-tab';

interface MainAreaProps {
  contradictions: Contradiction[];
  claims: Claim[];
  graphNodes: GraphNode[];
  graphEdges: GraphEdge[];
  isLoading?: boolean;
  error?: string | null;
  hasData?: boolean;
}

type TabType = 'contradictions' | 'graph' | 'claims';

export function MainArea({
  contradictions,
  claims,
  graphNodes,
  graphEdges,
  isLoading = false,
  error = null,
  hasData = false,
}: MainAreaProps) {
  const [activeTab, setActiveTab] = useState<TabType>('contradictions');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'contradictions', label: 'Contradictions' },
    { id: 'graph', label: 'Graph View' },
    { id: 'claims', label: 'All Claims' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center border-b border-border bg-card">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'text-foreground border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="bg-red-900/20 border-b border-red-800 px-4 py-3 text-red-100">
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {!hasData && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <p className="text-xl font-semibold text-foreground mb-2">Upload a document to begin</p>
              <p className="text-sm text-muted-foreground">
                Use the upload area in the sidebar to analyze documents for contradictions
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-foreground font-medium">Analyzing documents...</p>
            </div>
          </div>
        )}

        {hasData && !isLoading && (
          <div className="flex-1 overflow-hidden">
            {activeTab === 'contradictions' && <ContradictionsTab contradictions={contradictions} />}
            {activeTab === 'graph' && <GraphView nodes={graphNodes} edges={graphEdges} />}
            {activeTab === 'claims' && <AllClaimsTab claims={claims} />}
          </div>
        )}
      </div>
    </div>
  );
}
