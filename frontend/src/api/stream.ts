import type { StreamMetadata, SystemStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export async function fetchSystemStatus(): Promise<SystemStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/system/status`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch system connection status:', err);
    return null;
  }
}

export async function streamQuery(
  query: string,
  onMetadata: (meta: StreamMetadata) => void,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(`${API_BASE}/v1/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    signal,
  });

  if (!response.ok || !response.body) {
    onError(`Backend error: HTTP ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      if (!part.trim()) continue;
      const lines = part.split('\n');
      let eventType = '';
      let dataLine = '';

      for (const line of lines) {
        if (line.startsWith('event:')) eventType = line.slice(6).trim();
        if (line.startsWith('data:')) dataLine = line.slice(5).trim();
      }

      if (!dataLine) continue;
      try {
        const payload = JSON.parse(dataLine);
        if (eventType === 'metadata') onMetadata(payload as StreamMetadata);
        else if (eventType === 'token') onToken((payload as { token: string }).token);
        else if (eventType === 'done') onDone();
        else if (eventType === 'error') onError((payload as { error: string }).error);
      } catch {
        // malformed JSON — skip safely
      }
    }
  }
}
