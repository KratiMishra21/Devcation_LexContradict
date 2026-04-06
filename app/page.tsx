'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { MainArea } from '@/components/main-area';
import { ChatBar } from '@/components/chat-bar';
import type { Contradiction, Document, Claim, GraphNode, GraphEdge } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export default function Home() {
  const [contradictions, setContradictions] = useState<Contradiction[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalContradictions: 0,
    criticalCount: 0,
    documents: 0,
    claims: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  // Fetch folders and data on mount
  useEffect(() => {
    const initializeApp = async () => {
      await fetchFolders();
      // Load default folder data on mount (activeFolder is null by default)
      // The backend will use the default folder when folder_id is not provided
      fetchContradictions();
    };
    initializeApp();
  }, []);

  // Refetch data when active folder changes
  useEffect(() => {
    fetchContradictions();
  }, [activeFolder]);

  const fetchFolders = async () => {
    try {
      const data = await apiCall<{ folders: any[] }>('/folders');
      setFolders(data.folders);
    } catch (err) {
      // Folders are optional feature
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const data = await apiCall<{ folder_id: string; name: string }>('/folders', 'POST', { name });
      setActiveFolder(data.folder_id);
      await fetchFolders();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMsg);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await apiCall(`/folders/${folderId}`, 'DELETE');
      if (activeFolder === folderId) {
        setActiveFolder(null);
      }
      await fetchFolders();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete folder';
      setError(errorMsg);
    }
  };

  const fetchContradictions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = activeFolder ? `/contradictions?folder_id=${activeFolder}` : '/contradictions';
      const data = await apiCall<{
        contradictions: Contradiction[];
        summary: {
          total_contradictions: number;
          critical: number;
          high: number;
          medium: number;
          total_claims: number;
          documents_processed: number;
        };
      }>(endpoint);

      setContradictions(data.contradictions);
      setStats({
        totalContradictions: data.summary.total_contradictions,
        criticalCount: data.summary.critical,
        documents: data.summary.documents_processed,
        claims: data.summary.total_claims,
      });
      setHasData(true);

      // Fetch timeline data
      try {
        const timelineEndpoint = activeFolder ? `/timeline?folder_id=${activeFolder}` : '/timeline';
        const timelineData = await apiCall<{
          timeline: any[];
          total_dated_contradictions: number;
        }>(timelineEndpoint);
        setTimeline(timelineData.timeline);
      } catch {
        // Timeline fetch is optional, continue without it
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contradictions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const uploadUrl = activeFolder ? `${API_BASE}/upload?folder_id=${activeFolder}` : `${API_BASE}/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await fetchContradictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (question: string) => {
    try {
      const data = await apiCall<{ answer: string }>('/ask', 'POST', { question });
      return data.answer;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get answer';
      setError(errorMsg);
      return null;
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setError(null);
      const exportUrl = activeFolder ? `${API_BASE}/export/pdf?folder_id=${activeFolder}` : `${API_BASE}/export/pdf`;
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the filename from the response header
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'contradictions.pdf';

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to export PDF';
      setError(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  // Generate documents list from contradictions for sidebar
  const generatedDocuments: Document[] = Array.from(
    new Map(
      contradictions.flatMap((c) => [
        [c.claim_a.source_doc, { name: c.claim_a.source_doc, type: 'DEP' as const }],
        [c.claim_b.source_doc, { name: c.claim_b.source_doc, type: 'CON' as const }],
      ])
    ).values()
  ).map((doc, idx) => ({
    id: `doc_${idx}`,
    name: doc.name,
    type: doc.type,
    contradictionsFound: contradictions.filter(
      (c) => c.claim_a.source_doc === doc.name || c.claim_b.source_doc === doc.name
    ).length,
  }));

  // Convert contradictions to graph nodes and edges
  const graphNodes: GraphNode[] = [];
  const graphEdges: GraphEdge[] = [];
  const processedNodes = new Set<string>();

  contradictions.forEach((c) => {
    // Add entity nodes
    if (!processedNodes.has(`entity_${c.claim_a.entity}`)) {
      graphNodes.push({
        id: `entity_${c.claim_a.entity}`,
        label: c.claim_a.entity,
        type: 'entity',
      });
      processedNodes.add(`entity_${c.claim_a.entity}`);
    }

    if (!processedNodes.has(`entity_${c.claim_b.entity}`)) {
      graphNodes.push({
        id: `entity_${c.claim_b.entity}`,
        label: c.claim_b.entity,
        type: 'entity',
      });
      processedNodes.add(`entity_${c.claim_b.entity}`);
    }

    // Add claim nodes
    graphNodes.push({
      id: c.claim_a.claim_id,
      label: c.claim_a.raw_text.substring(0, 30) + '...',
      type: 'claim',
      isConflicting: true,
    });

    graphNodes.push({
      id: c.claim_b.claim_id,
      label: c.claim_b.raw_text.substring(0, 30) + '...',
      type: 'claim',
      isConflicting: true,
    });

    // Add edges for conflict
    graphEdges.push({
      source: c.claim_a.claim_id,
      target: c.claim_b.claim_id,
      type: 'conflict',
    });

    graphEdges.push({
      source: `entity_${c.claim_a.entity}`,
      target: c.claim_a.claim_id,
      type: 'normal',
    });

    graphEdges.push({
      source: `entity_${c.claim_b.entity}`,
      target: c.claim_b.claim_id,
      type: 'normal',
    });
  });

  const claims: Claim[] = contradictions.flatMap((c) => [
    {
      ...c.claim_a,
      status: 'contradicted' as const,
    },
    {
      ...c.claim_b,
      status: 'contradicted' as const,
    },
  ]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar
        documents={generatedDocuments}
        totalContradictions={stats.totalContradictions}
        totalDocuments={stats.documents}
        totalClaims={stats.claims}
        criticalCount={stats.criticalCount}
        onUpload={handleUpload}
        isLoading={isLoading}
        hasData={hasData}
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={(folderId) => {
          setActiveFolder(folderId);
        }}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <div className="flex-1 flex flex-col">
        <MainArea
          contradictions={contradictions}
          claims={claims}
          graphNodes={graphNodes}
          graphEdges={graphEdges}
          timeline={timeline}
          totalDatedContradictions={timeline.length}
          isLoading={isLoading}
          error={error}
          hasData={hasData}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />

        <ChatBar onAsk={handleAskQuestion} />
      </div>
    </div>
  );
}
