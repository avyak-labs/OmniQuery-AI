import { type FC, useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
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

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: 'var(--omni-accent-glow)', border: '1px solid rgba(99,102,241,0.3)' }}>
          🤖
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--omni-text)' }}>
            OmniQuery-AI Enterprise Copilot
          </h2>
          <p className="text-sm max-w-md" style={{ color: 'var(--omni-text-muted)' }}>
            Ask questions about your documents or database records. The AI automatically routes
            to <span style={{ color: 'var(--omni-rag)' }}>Document RAG</span> or{' '}
            <span style={{ color: 'var(--omni-sql)' }}>Text-to-SQL</span> based on your intent.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {[
            { icon: '📄', text: 'What is the return policy for defective items?', type: 'rag' },
            { icon: '📊', text: 'Show total revenue by product category', type: 'sql' },
            { icon: '📚', text: 'What does clause 8.2 of the vendor contract say?', type: 'rag' },
            { icon: '🗄️', text: 'How many orders were placed in Q3 2026?', type: 'sql' },
          ].map((ex, i) => (
            <div key={i} className="p-3 rounded-lg text-left text-xs cursor-default transition-colors hover:bg-white/5"
              style={{ background: 'var(--omni-surface)', border: '1px solid var(--omni-border)' }}>
              <span className="mr-2">{ex.icon}</span>
              <span style={{ color: 'var(--omni-text-muted)' }}>{ex.text}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-6 px-4 overflow-y-auto h-full">
      {messages.map(msg => (
        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm`}
            style={{
              background: msg.role === 'user' ? 'var(--omni-accent)' : 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} style={{ color: 'var(--omni-accent)' }} />}
          </div>

          {/* Bubble */}
          <div className={`flex flex-col max-w-3xl w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {/* Route badge for assistant messages */}
            {msg.role === 'assistant' && msg.metadata?.route_selected && (
              <RouteBadge route={msg.metadata.route_selected} />
            )}

            {/* Text content */}
            <div
              className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={msg.role === 'user'
                ? { background: 'var(--omni-accent)', color: 'white', borderBottomRightRadius: '4px' }
                : { background: 'var(--omni-surface)', border: '1px solid var(--omni-border)', color: 'var(--omni-text)', borderBottomLeftRadius: '4px' }
              }
            >
              {msg.content}
              {msg.isStreaming && (
                <span className="cursor-blink inline-block ml-0.5 text-indigo-400">▌</span>
              )}
              {!msg.content && msg.isStreaming && (
                <span className="text-gray-500 italic text-xs">Thinking…</span>
              )}
            </div>

            {/* SQL Inspector */}
            {msg.role === 'assistant' && !msg.isStreaming && msg.metadata?.sql_query && (
              <div className="w-full mt-1">
                <SqlInspector
                  sqlQuery={msg.metadata.sql_query}
                  sqlResult={msg.metadata.sql_result}
                />
              </div>
            )}

            {/* Citation Cards */}
            {msg.role === 'assistant' && !msg.isStreaming && msg.metadata?.retrieved_chunks && msg.metadata.retrieved_chunks.length > 0 && (
              <div className="w-full mt-1">
                <CitationCards citations={msg.metadata.retrieved_chunks} />
              </div>
            )}

            {/* Timestamp */}
            <span className="text-xs mt-1 px-1" style={{ color: 'var(--omni-text-muted)' }}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
