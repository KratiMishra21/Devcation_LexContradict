'use client';

import { useState } from 'react';
import { Contradiction } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ContradictionsTabProps {
  contradictions: Contradiction[];
}

type SeverityType = 'critical' | 'high' | 'medium' | 'low';

const severityColors: Record<SeverityType, { dot: string; badge: string; text: string }> = {
  critical: {
    dot: 'bg-red-600',
    badge: 'bg-red-100 text-red-800 border border-red-300',
    text: 'text-red-600',
  },
  high: {
    dot: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-800 border border-orange-300',
    text: 'text-orange-600',
  },
  medium: {
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    text: 'text-yellow-600',
  },
  low: {
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-800 border border-green-300',
    text: 'text-green-600',
  },
};

export function ContradictionsTab({ contradictions }: ContradictionsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityType | 'All'>('All');

  const filtered =
    selectedSeverity === 'All'
      ? contradictions
      : contradictions.filter((c) => c.severity === selectedSeverity);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-4">
        <p className="text-sm text-muted-foreground mb-3">Filter by severity</p>
        <div className="flex gap-2">
          {(['All', 'critical', 'high', 'medium', 'low'] as const).map((severity) => (
            <button
              key={severity}
              onClick={() => setSelectedSeverity(severity)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedSeverity === severity
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {severity === 'All' ? 'All' : severity.charAt(0).toUpperCase() + severity.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filtered.map((contradiction) => {
            const isExpanded = expandedId === contradiction.contradiction_id;
            const colors = severityColors[contradiction.severity as SeverityType] ?? severityColors['low'];

            return (
              <div
                key={contradiction.contradiction_id}
                className="border border-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : contradiction.contradiction_id)
                  }
                  className="w-full p-4 bg-card hover:bg-muted/50 transition-colors flex items-start gap-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.dot}`} />
                    <div className={`px-2.5 py-1 rounded text-xs font-semibold ${colors.badge}`}>
                      {contradiction.severity.charAt(0).toUpperCase() + contradiction.severity.slice(1)}
                    </div>
                    <p className="text-sm text-foreground flex-1">
                      {contradiction.conflict_reason}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-background/50 p-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Claim A
                        </p>
                        <p className="text-sm text-foreground font-medium mb-2">
                          {contradiction.claim_a.entity}
                        </p>
                        <p className="text-sm text-foreground">{contradiction.claim_a.raw_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {contradiction.claim_a.source_doc}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contradiction.claim_a.page_ref}
                        </p>
                      </div>

                      <div className="flex items-center justify-center">
                        <div
                          className="px-3 py-1.5 text-xs font-bold rounded"
                          style={{ backgroundColor: '#6b5b95', color: '#f5f5f5' }}
                        >
                          VS
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                          Claim B
                        </p>
                        <p className="text-sm text-foreground font-medium mb-2">
                          {contradiction.claim_b.entity}
                        </p>
                        <p className="text-sm text-foreground">{contradiction.claim_b.raw_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {contradiction.claim_b.source_doc}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {contradiction.claim_b.page_ref}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Confidence
                      </p>
                      <div className="w-full bg-muted rounded h-2 overflow-hidden">
                        <div
                          className={`h-full ${colors.dot}`}
                          style={{ width: `${contradiction.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(contradiction.confidence * 100)}% confidence
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        AI Analysis
                      </p>
                      <p className="text-sm text-foreground leading-relaxed bg-muted/30 p-3 rounded">
                        {contradiction.ai_analysis}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No contradictions found
          </div>
        )}
      </div>
    </div>
  );
}
