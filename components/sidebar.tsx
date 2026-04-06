'use client';

import { Document } from '@/types';
import { Logo } from './logo';

interface SidebarProps {
  documents: Document[];
  totalContradictions: number;
  totalDocuments: number;
  totalClaims: number;
  criticalCount: number;
  onUpload?: (file: File) => Promise<void>;
  isLoading?: boolean;
  hasData?: boolean;
}

const docTypeColors: Record<string, string> = {
  DEP: 'bg-purple-600',
  CON: 'bg-blue-600',
  POL: 'bg-amber-600',
};

export function Sidebar({
  documents,
  totalContradictions,
  totalDocuments,
  totalClaims,
  criticalCount,
  onUpload,
  isLoading = false,
  hasData = false,
}: SidebarProps) {
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      await onUpload(file);
      e.target.value = '';
    }
  };
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-screen overflow-hidden">
      <Logo />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <label className="flex items-center justify-center w-full px-4 py-3 mb-4 border-2 border-dashed border-border rounded cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              disabled={isLoading}
              accept=".pdf,.txt,.docx"
            />
            <span className="text-sm font-medium text-foreground">
              {isLoading ? 'Analyzing...' : 'Upload Document'}
            </span>
          </label>

          <h3 className="text-sm font-semibold text-foreground mb-3">Documents</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${docTypeColors[doc.type]}`}
                >
                  {doc.type}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{doc.name}</p>
                </div>
                {doc.contradictionsFound > 0 && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: '#d32f2f' }}
                  >
                    {doc.contradictionsFound}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="border-t border-border p-4 bg-card/50"
        style={{ backgroundColor: 'rgba(36, 36, 36, 0.5)' }}
      >
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Contradictions</p>
            <p className="text-2xl font-bold" style={{ color: '#d32f2f' }}>
              {totalContradictions}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="text-lg font-semibold text-foreground">{totalDocuments}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Claims</p>
              <p className="text-lg font-semibold text-foreground">{totalClaims}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Critical Count</p>
            <p className="text-lg font-semibold" style={{ color: '#d32f2f' }}>
              {criticalCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
