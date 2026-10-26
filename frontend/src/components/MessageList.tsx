import { type FC, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import RouteBadge from './RouteBadge';
import SqlInspector from './SqlInspector';
import CitationCards from './CitationCards';

interface MessageListProps {
  messages: Message[];
}

const MessageList: FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-scroll">
      {messages.map(msg => (
        <div key={msg.id} className={`message ${msg.role}`}>
          {msg.role === 'assistant' && <div className="msg-avatar">🤖</div>}

          <div className="msg-body">
            <div className="msg-bubble">
              {msg.role === 'assistant' && msg.metadata?.route_selected && (
                <RouteBadge route={msg.metadata.route_selected} />
              )}

              <div className="markdown-content">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p style={{ marginBottom: '12px', lineHeight: '1.65' }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ marginLeft: '20px', marginBottom: '12px', listStyleType: 'disc' }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ marginLeft: '20px', marginBottom: '12px', listStyleType: 'decimal' }}>{children}</ol>,
                      li: ({ children }) => <li style={{ marginBottom: '6px', lineHeight: '1.6' }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--text-main)' }}>{children}</strong>,
                      blockquote: ({ children }) => (
                        <blockquote
                          style={{
                            borderLeft: '3px solid var(--accent)',
                            paddingLeft: '12px',
                            margin: '12px 0',
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                            lineHeight: '1.6',
                          }}
                        >
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code
                          style={{
                            background: 'var(--bg-surface-2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <div>{msg.content}</div>
                )}

                {msg.isStreaming && (
                  <span className="cursor-blink" style={{ color: '#818cf8', fontWeight: 'bold', marginLeft: '4px' }}>
                    ▌
                  </span>
                )}
                {!msg.content && msg.isStreaming && (
                  <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '12px' }}>
                    Synthesizing response...
                  </span>
                )}
              </div>

              {/* Safe SQL Sandbox Inspector with real rows & query */}
              {msg.role === 'assistant' && !msg.isStreaming && msg.metadata?.sql_query && (
                <SqlInspector
                  sqlQuery={msg.metadata.sql_query}
                  sqlResult={msg.metadata.sql_result}
                />
              )}

              {/* FlashRank Citations */}
              {msg.role === 'assistant' &&
                !msg.isStreaming &&
                msg.metadata?.retrieved_chunks &&
                msg.metadata.retrieved_chunks.length > 0 && (
                  <CitationCards citations={msg.metadata.retrieved_chunks} />
                )}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
