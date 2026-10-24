import { useState, useCallback, useRef } from 'react';
import type { Message, StreamMetadata } from './types';
import { streamQuery } from './api/stream';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import './index.css';

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (query: string) => {
    // Add user message
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    // Add empty assistant message that will be filled by stream
    const assistantId = generateId();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    abortRef.current = new AbortController();
    let accumulatedText = '';
    let capturedMeta: StreamMetadata | undefined;

    try {
      await streamQuery(
        query,
        // onMetadata
        (meta) => {
          capturedMeta = meta;
          setMessages(prev =>
            prev.map(m => m.id === assistantId
              ? { ...m, metadata: meta }
              : m
            )
          );
        },
        // onToken
        (token) => {
          accumulatedText += token;
          const snap = accumulatedText;
          setMessages(prev =>
            prev.map(m => m.id === assistantId
              ? { ...m, content: snap }
              : m
            )
          );
        },
        // onDone
        () => {
          setMessages(prev =>
            prev.map(m => m.id === assistantId
              ? { ...m, isStreaming: false, content: accumulatedText, metadata: capturedMeta }
              : m
            )
          );
          setIsStreaming(false);
        },
        // onError
        (errMsg) => {
          setMessages(prev =>
            prev.map(m => m.id === assistantId
              ? { ...m, content: `⚠️ ${errMsg}`, isStreaming: false }
              : m
            )
          );
          setIsStreaming(false);
        },
        abortRef.current.signal,
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: '⚠️ Could not connect to the backend. Is the FastAPI server running on :8000?', isStreaming: false }
            : m
          )
        );
      }
      setIsStreaming(false);
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--omni-bg)' }}>
      <Sidebar />

      {/* Main Chat Area */}
      <main className="flex flex-col flex-1 min-w-0 h-full">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--omni-border)', background: 'var(--omni-surface)' }}>
          <div className="flex items-center gap-3">
            <span className="text-base font-semibold" style={{ color: 'var(--omni-text)' }}>
              Enterprise Knowledge & Data Copilot
            </span>
            {isStreaming && (
              <span className="text-xs px-2 py-0.5 rounded-full streaming-glow"
                style={{ background: 'var(--omni-accent-glow)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)' }}>
                ● Streaming
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--omni-text-muted)', border: '1px solid var(--omni-border)' }}
              >
                Clear Chat
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <MessageList messages={messages} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInput onSubmit={handleSubmit} isStreaming={isStreaming} />
        </div>
      </main>
    </div>
  );
}

export default App;
