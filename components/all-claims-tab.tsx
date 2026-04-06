'use client';

import { Claim, ClaimStatus } from '@/types';

interface AllClaimsTabProps {
  claims: Claim[];
}

const statusColors: Record<ClaimStatus, { bg: string; text: string }> = {
  contradicted: { bg: 'bg-red-100', text: 'text-red-800' },
  verified: { bg: 'bg-green-100', text: 'text-green-800' },
  corroborated: { bg: 'bg-blue-100', text: 'text-blue-800' },
};

export function AllClaimsTab({ claims }: AllClaimsTabProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-1/4">
                Entity
              </th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex-1">
                Claim
              </th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-1/5">
                Source
              </th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-1/6">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim, idx) => (
              <tr
                key={`${claim.claim_id}_${idx}`}
                className={`border-b border-border ${idx % 2 === 0 ? 'bg-card/50' : 'bg-card/30'} hover:bg-muted/30 transition-colors`}
              >
                <td className="p-3 text-sm font-medium text-foreground">{claim.entity}</td>
                <td className="p-3 text-sm text-foreground">{claim.raw_text}</td>
                <td className="p-3 text-sm text-muted-foreground">{claim.source_doc}</td>
                <td className="p-3">
                  <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[claim.status].bg} ${statusColors[claim.status].text}`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
