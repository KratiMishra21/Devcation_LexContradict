'use client';

import { useState } from 'react';

interface Folder {
  id: string;
  name: string;
  documents: number;
  contradictions: number;
  created_at: string;
}

interface FolderManagerProps {
  folders: Folder[];
  activeFolder: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  isLoading?: boolean;
}

export function FolderManager({
  folders,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  isLoading = false,
}: FolderManagerProps) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateFolder(newFolderName);
      setNewFolderName('');
      setShowNewFolder(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Folders</h3>
        <button
          onClick={() => setShowNewFolder(!showNewFolder)}
          className="text-foreground/60 hover:text-foreground text-lg transition-colors"
          title="New folder"
        >
          +
        </button>
      </div>

      {showNewFolder && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary"
            disabled={isCreating}
          />
          <button
            onClick={handleCreateFolder}
            disabled={isCreating || !newFolderName.trim()}
            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded disabled:opacity-50 transition-colors"
          >
            {isCreating ? '...' : '✓'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className={`p-2 rounded cursor-pointer transition-colors group relative ${
              activeFolder === folder.id ? 'bg-primary/20 border border-primary' : 'hover:bg-muted'
            }`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">📁 {folder.name}</p>
                <p className="text-xs text-foreground/60">
                  {folder.documents} docs • {folder.contradictions} contradictions
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${folder.name}" folder?`)) {
                    onDeleteFolder(folder.id);
                  }
                }}
                className="text-foreground/40 hover:text-red-500 text-sm opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                title="Delete folder"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {folders.length === 0 && (
          <p className="text-xs text-foreground/40 italic">No folders yet. Create one to organize documents.</p>
        )}
      </div>
    </div>
  );
}
