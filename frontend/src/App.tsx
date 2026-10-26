import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, StreamMetadata, Session, ThemeMode, SystemConnection } from './types';
import { streamQuery, fetchSystemStatus } from './api/stream';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import './index.css';

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function createNewSession(): Session {
  return {
    id: `sess-${generateId()}`,
    title: 'New Investigation',
    createdAt: new Date(),
    messages: [],
  };
}

function App() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [connections, setConnections] = useState<SystemConnection[]>([]);
  
  // App opens fresh into a new session
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('omniquery_user_sessions');
    if (saved) {
      try {
        const parsed: Session[] = JSON.parse(saved);
        const revived = parsed.map(s => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })),
        }));
        // Always prepend a fresh new session when opening the app
        const fresh = createNewSession();
        return [fresh, ...revived.filter(s => s.messages.length > 0)];
      } catch {
        return [createNewSession()];
      }
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0].id);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Poll live backend system status
  useEffect(() => {
    const loadStatus = async () => {
      const status = await fetchSystemStatus();
      if (status && status.connections) {
        setConnections(status.connections);
      }
    };
    loadStatus();
    const interval = setInterval(loadStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save non-empty sessions to localStorage
  useEffect(() => {
    const nonEmpty = sessions.filter(s => s.messages.length > 0);
    localStorage.setItem('omniquery_user_sessions', JSON.stringify(nonEmpty));
  }, [sessions]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const handleNewSession = useCallback(() => {
    // If the active session is already brand new and empty, just stay on it
    if (activeSession.messages.length === 0) return;

    const fresh = createNewSession();
    setSessions(prev => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
  }, [activeSession]);

  const handleSubmit = useCallback(async (query: string) => {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    const assistantId = generateId();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date(),
    };

    // Update active session with user message and streaming placeholder
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          const isDefault = s.title === 'New Investigation' || s.messages.length === 0;
          return {
            ...s,
            title: isDefault ? (query.length > 28 ? `${query.slice(0, 28)}...` : query) : s.title,
            messages: [...s.messages, userMsg, assistantMsg],
          };
        }
        return s;
      })
    );

    setIsStreaming(true);
    abortRef.current = new AbortController();
    let accumulatedText = '';
    let capturedMeta: StreamMetadata | undefined;

    try {
      await streamQuery(
        query,
        (meta) => {
          capturedMeta = meta;
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantId ? { ...m, metadata: meta } : m
                    ),
                  }
                : s
            )
          );
        },
        (token) => {
          accumulatedText += token;
          const snap = accumulatedText;
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantId ? { ...m, content: snap } : m
                    ),
                  }
                : s
            )
          );
        },
        () => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantId
                        ? {
                            ...m,
                            isStreaming: false,
                            content: accumulatedText,
                            metadata: capturedMeta,
                          }
                        : m
                    ),
                  }
                : s
            )
          );
          setIsStreaming(false);
        },
        (errMsg) => {
          setSessions(prev =>
            prev.map(s =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map(m =>
                      m.id === assistantId
                        ? { ...m, content: `⚠️ ${errMsg}`, isStreaming: false }
                        : m
                    ),
                  }
                : s
            )
          );
          setIsStreaming(false);
        },
        abortRef.current.signal
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setSessions(prev =>
          prev.map(s =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map(m =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: '⚠️ Unable to connect to backend engine.',
                          isStreaming: false,
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }
      setIsStreaming(false);
    }
  }, [activeSessionId]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-base)' }}>
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        connections={connections}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="session-title">{activeSession.title}</span>
            <div className="connection-badge">
              <div className="status-dot" style={{ width: '5px', height: '5px' }}></div>
              <span>LangGraph Copilot Active</span>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button className="icon-btn" onClick={() => alert('Exporting audit transcript...')}>
              Export Data
            </button>
          </div>
        </header>

        {/* Conversation Stream or Clean Welcome State */}
        <MessageList messages={messages} />

        {/* Input Bar */}
        <ChatInput onSubmit={handleSubmit} isStreaming={isStreaming} />
      </main>
    </div>
  );
}

export default App;
