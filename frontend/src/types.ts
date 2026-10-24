export type RouteType = 'rag' | 'sql' | 'direct';

export interface Citation {
  content: string;
  source: string;
  page: number;
  score: number;
}

export interface StreamMetadata {
  route_selected: RouteType;
  sql_query: string | null;
  sql_result: Record<string, unknown>[] | null;
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
