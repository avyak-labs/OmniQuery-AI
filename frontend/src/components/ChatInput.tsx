import { type FC, type FormEvent, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSubmit: (query: string) => void;
  isStreaming: boolean;
}

const ChatInput: FC<ChatInputProps> = ({ onSubmit, isStreaming }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = textareaRef.current?.value.trim();
    if (!query || isStreaming) return;
    onSubmit(query);
    if (textareaRef.current) textareaRef.current.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-4" style={{ borderTop: '1px solid var(--omni-border)' }}>
      <div
        className={`flex items-end gap-3 rounded-2xl p-3 transition-all ${isStreaming ? 'streaming-glow' : ''}`}
        style={{ background: 'var(--omni-surface)', border: '1px solid var(--omni-border)' }}
      >
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Generating response…' : 'Ask about documents or database records… (Enter to send, Shift+Enter for newline)'}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none placeholder-gray-600 leading-relaxed max-h-32 overflow-y-auto"
          style={{ color: 'var(--omni-text)' }}
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: isStreaming ? 'var(--omni-border)' : 'var(--omni-accent)' }}
        >
          {isStreaming
            ? <Loader2 size={16} className="animate-spin text-white" />
            : <Send size={16} className="text-white" />
          }
        </button>
      </div>
      <p className="text-center text-xs mt-2" style={{ color: 'var(--omni-text-muted)' }}>
        OmniQuery-AI may make mistakes. Verify SQL results independently. Powered by Avyak Labs.
      </p>
    </form>
  );
};

export default ChatInput;
