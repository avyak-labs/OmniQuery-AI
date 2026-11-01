import { type FC, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import RouteBadge from './RouteBadge';
import SqlInspector from './SqlInspector';
import CitationCards from './CitationCards';

interface MessageListProps {
  messages: Message[];
  onSelectPrompt?: (prompt: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: '🛡️',
    type: 'HYBRID RAG',
    typeClass: 'rag',
    prompt: 'What is the MFA policy and password rotation requirement?',
    desc: 'Dense pgvector + BM25 retrieval against Enterprise Security policies.',
  },
  {
    icon: '📊',
    type: 'TEXT-TO-SQL',
    typeClass: 'sql',
    prompt: 'How many total orders are in Pending status?',
    desc: 'Autonomous copilot aggregating relational orders within read-only sandbox.',
  },
  {
    icon: '💼',
    type: 'HYBRID RAG',
    typeClass: 'rag',
    prompt: 'What is the company remote work and internet reimbursement policy?',
    desc: 'Cross-encoder reranked context from employee handbook documentation.',
  },
  {
    icon: '📈',
    type: 'TEXT-TO-SQL',
    typeClass: 'sql',
    prompt: 'Show the top 5 highest value customer orders with totals',
    desc: 'Relational multi-table JOINs and formatting with markdown tables.',
  },
];

const MessageList: FC<MessageListProps> = ({ messages, onSelectPrompt }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="welcome-container">
        <div className="welcome-badge">
          <span>⚡</span> Tier-1 Enterprise AI Copilot
        </div>
        <h1 className="welcome-title">OmniQuery-AI Console</h1>
        <p className="welcome-subtitle">
          Query unstructured enterprise policies via Hybrid RAG or analyze real-time transactional
          metrics using the autonomous Text-to-SQL copilot.
        </p>

        <div className="welcome-grid">
          {STARTER_PROMPTS.map((item, idx) => (
            <div
              key={idx}
              className="welcome-card"
              onClick={() => onSelectPrompt?.(item.prompt)}
              role="button"
              tabIndex={0}
            >
              <div className="welcome-card-header">
                <span className="welcome-card-icon">{item.icon}</span>
                <span
                  className="welcome-card-badge"
                  style={{
                    color: item.typeClass === 'sql' ? 'var(--route-sql)' : 'var(--route-rag)',
                    background: item.typeClass === 'sql' ? 'var(--route-sql-bg)' : 'var(--route-rag-bg)',
                    border: `1px solid ${item.typeClass === 'sql' ? 'var(--route-sql-border)' : 'var(--route-rag-border)'}`,
                  }}
                >
                  {item.type}
                </span>
              </div>
              <div className="welcome-card-prompt">{item.prompt}</div>
              <div className="welcome-card-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
