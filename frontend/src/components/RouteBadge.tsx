import { type FC } from 'react';
import type { RouteType } from '../types';

interface RouteBadgeProps {
  route: RouteType;
}

const ROUTE_CONFIG: Record<RouteType, { label: string; icon: string; className: string }> = {
  sql: {
    label: 'ROUTED: TEXT-TO-SQL ENGINE',
    icon: '🗄️',
    className: 'sql',
  },
  rag: {
    label: 'ROUTED: ENTERPRISE DOCUMENT RAG',
    icon: '📚',
    className: 'rag',
  },
  direct: {
    label: 'ROUTED: DIRECT SYNTHESIS',
    icon: '⚡',
    className: 'direct',
  },
};

const RouteBadge: FC<RouteBadgeProps> = ({ route }) => {
  const cfg = ROUTE_CONFIG[route] ?? ROUTE_CONFIG.direct;

  return (
    <div className={`intent-badge ${cfg.className}`}>
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </div>
  );
};

export default RouteBadge;
