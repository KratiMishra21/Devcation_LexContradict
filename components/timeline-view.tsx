'use client';

import { Contradiction } from '@/types';

interface TimelineEvent {
  date: string;
  contradiction: Contradiction;
  severity: string;
}

interface TimelineViewProps {
  timeline: TimelineEvent[];
  totalDatedContradictions: number;
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-900 border-red-500',
  high: 'bg-orange-900 border-orange-500',
  medium: 'bg-yellow-900 border-yellow-500',
  low: 'bg-blue-900 border-blue-500',
};

const severityBadgeColors: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-600 text-white',
  medium: 'bg-yellow-600 text-white',
  low: 'bg-blue-600 text-white',
};

export function TimelineView({ timeline, totalDatedContradictions }: TimelineViewProps) {
  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-foreground/60">No timeline data available</p>
          <p className="text-sm text-foreground/40">Upload documents to view contradictions across time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Timeline View</h2>
        <p className="text-sm text-foreground/60">
          {totalDatedContradictions} dated contradictions found
        </p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-red-500"></div>

        {/* Events */}
        <div className="space-y-6 pl-24">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-20 top-2 w-6 h-6 rounded-full bg-purple-600 border-4 border-card"></div>

              {/* Event card */}
              <div
                className={`border-l-4 p-4 rounded ${severityColors[event.severity.toLowerCase()] || severityColors.medium}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-foreground/80">{event.date}</span>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${severityBadgeColors[event.severity.toLowerCase()] || severityBadgeColors.medium}`}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-foreground/60">
                        {(event.contradiction.confidence * 100).toFixed(0)}% confident
                      </span>
                    </div>

                    <p className="text-sm font-medium text-foreground mb-3">
                      {event.contradiction.conflict_reason}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-black/20 p-2 rounded">
                        <p className="text-foreground/60 mb-1">Claim A</p>
                        <p className="text-foreground">
                          {event.contradiction.claim_a.entity}: "{event.contradiction.claim_a.raw_text.substring(0, 60)}..."
                        </p>
                        <p className="text-foreground/60 mt-1">
                          Source: {event.contradiction.claim_a.source_doc}
                        </p>
                      </div>

                      <div className="bg-black/20 p-2 rounded">
                        <p className="text-foreground/60 mb-1">Claim B</p>
                        <p className="text-foreground">
                          {event.contradiction.claim_b.entity}: "{event.contradiction.claim_b.raw_text.substring(0, 60)}..."
                        </p>
                        <p className="text-foreground/60 mt-1">
                          Source: {event.contradiction.claim_b.source_doc}
                        </p>
                      </div>
                    </div>

                    {event.contradiction.ai_analysis && (
                      <div className="mt-3 p-2 bg-black/20 rounded">
                        <p className="text-xs text-foreground/80">{event.contradiction.ai_analysis}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
