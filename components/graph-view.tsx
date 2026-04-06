'use client';

import { GraphNode, GraphEdge } from '@/types';
import { useMemo } from 'react';

interface GraphViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphView({ nodes, edges }: GraphViewProps) {
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const width = 1000;
    const height = 600;

    // Simple layout algorithm - position nodes in groups
    const nodesByType = nodes.reduce(
      (acc, node) => {
        if (!acc[node.type]) acc[node.type] = [];
        acc[node.type].push(node);
        return acc;
      },
      {} as Record<string, GraphNode[]>
    );

    const typeYMap: Record<string, number> = {
      entity: 100,
      claim: 300,
      location: 450,
      document: 600,
    };

    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      const y = typeYMap[type];
      const spacing = width / (typeNodes.length + 1);
      typeNodes.forEach((node, idx) => {
        positions[node.id] = { x: spacing * (idx + 1), y };
      });
    });

    return positions;
  }, [nodes]);

  const getNodeColor = (node: GraphNode): string => {
    switch (node.type) {
      case 'entity':
        return '#6b5b95';
      case 'claim':
        return node.isConflicting ? '#e74c3c' : '#e0a86f';
      case 'location':
        return '#f39c12';
      case 'document':
        return '#3498db';
      default:
        return '#909090';
    }
  };

  return (
    <div className="h-full flex flex-col bg-background p-4">
      <div className="mb-4 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6b5b95' }} />
          <span className="text-foreground">Entity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e74c3c' }} />
          <span className="text-foreground">Conflicting Claim</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#e0a86f' }} />
          <span className="text-foreground">Regular Claim</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f39c12' }} />
          <span className="text-foreground">Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3498db' }} />
          <span className="text-foreground">Document</span>
        </div>
      </div>

      <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card/30">
        <svg width="100%" height="100%" viewBox="0 0 1000 700" className="bg-card/50">
          {/* Render edges */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#909090" />
            </marker>
            <marker
              id="arrowhead-conflict"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#d32f2f" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const fromPos = nodePositions[edge.source];
            const toPos = nodePositions[edge.target];
            if (!fromPos || !toPos) return null;

            const isConflict = edge.type === 'CONFLICTS_WITH';
            const strokeColor = isConflict ? '#d32f2f' : '#909090';
            const strokeWidth = isConflict ? 2 : 1.5;

            return (
              <line
                key={idx}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={isConflict ? 'url(#arrowhead-conflict)' : 'url(#arrowhead)'}
                strokeDasharray={isConflict ? '5,5' : 'none'}
              />
            );
          })}

          {/* Render nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const color = getNodeColor(node);
            const radius = 30;

            return (
              <g key={node.id}>
                <circle cx={pos.x} cy={pos.y} r={radius} fill={color} opacity={0.8} />
                <foreignObject x={pos.x - 35} y={pos.y - 35} width={70} height={70}>
                  <div className="flex items-center justify-center h-full text-center">
                    <span className="text-xs font-semibold text-white px-1 leading-tight break-words">
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
