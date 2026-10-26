import { type FC, type FormEvent, useRef } from 'react';
import { Loader2 } from 'lucide-react';

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
    <div className="input-wrapper">
      <form onSubmit={handleSubmit} className="input-box">
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask questions across documents or query business metrics in SQL..."
          rows={1}
          className="input-field"
        />
        <div className="input-bottom-row">
          <div className="input-hints">
            <span>
              <strong>Enter</strong> to send
            </span>
            <span>
              <strong>Shift + Enter</strong> for newline
            </span>
          </div>

          <button type="submit" disabled={isStreaming} className="send-btn">
            {isStreaming ? (
              <Loader2 size={14} className="animate-spin text-white" />
            ) : (
              '➔'
            )}
          </button>
        </div>
      </form>

      {/* Enterprise One-Liner Disclaimer */}
      <p className="disclaimer-text">
        OmniQuery-AI can make mistakes. Responses are synthesized from connected enterprise repositories and database records — verify critical financial or legal figures.
      </p>
    </div>
  );
};

export default ChatInput;
