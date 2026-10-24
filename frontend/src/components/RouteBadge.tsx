import { type FC } from 'react';
import type { RouteType } from '../types';

interface RouteBadgeProps {
  route: RouteType;
}

const ROUTE_CONFIG: Record<RouteType, { label: string; color: string; bg: string; icon: string; description: string }> = {
  sql: {
    label: 'TEXT-TO-SQL',
    color: '#22d3ee',
    bg: 'rgba(34, 211, 238, 0.1)',
    icon: '🗄️',
    description: 'Executed deterministic sandboxed SQL query',
  },
  rag: {
    label: 'DOCUMENT RAG',
    color: '#a78bfa',
    bg: 'rgba(167, 139, 250, 0.1)',
    icon: '📚',
    description: 'Hybrid Dense + BM25 Retrieval with FlashRank Re-ranking',
  },
  direct: {
    label: 'DIRECT SYNTHESIS',
    color: '#9ca3af',
    bg: 'rgba(156, 163, 175, 0.1)',
    icon: '⚡',
    description: 'Direct LLM generation without retrieval',
  },
};

const RouteBadge: FC<RouteBadgeProps> = ({ route }) => {
  const cfg = ROUTE_CONFIG[route] ?? ROUTE_CONFIG.direct;
  return (
    <div
      style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
    >
      <span>{cfg.icon}</span>
      <span style={{ color: cfg.color }}>🧭 INTENT: {cfg.label}</span>
      <span className="text-gray-500 hidden sm:inline">— {cfg.description}</span>
    </div>
  );
};

export default RouteBadge;
