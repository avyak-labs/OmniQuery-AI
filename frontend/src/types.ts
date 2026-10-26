export type RouteType = 'rag' | 'sql' | 'direct';
export type ThemeMode = 'dark' | 'light';

export interface Citation {
  content: string;
  source: string;
  page?: number;
  score: number;
}

export interface StreamMetadata {
  route_selected: RouteType;
  sql_query: string | null;
  sql_result: Record<string, unknown>[] | string | null;
  retrieved_chunks: Citation[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: StreamMetadata;
  isStreaming?: boolean;
  timestamp: Date;
}

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  messages: Message[];
}

export interface SystemConnection {
  id: string;
  name: string;
  type: 'sql' | 'vector';
  status: 'connected' | 'offline';
  detail: string;
}

export interface SystemStatus {
  status: string;
  copilot: string;
  connections: SystemConnection[];
}
