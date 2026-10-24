import { type FC, useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, FileText } from 'lucide-react';
import type { Citation } from '../types';

interface CitationCardsProps {
  citations: Citation[];
}

const CitationCards: FC<CitationCardsProps> = ({ citations }) => {
  const [open, setOpen] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(167, 139, 250, 0.2)', background: 'rgba(167, 139, 250, 0.04)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
        style={{ color: '#a78bfa' }}
      >
        <BookOpen size={14} />
        <span>📚 Grounded Provenance Citations (FlashRank Re-ranked)</span>
        <span className="ml-2 text-xs font-normal opacity-60">{citations.length} source{citations.length > 1 ? 's' : ''}</span>
        <span className="ml-auto">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {citations.map((cit, idx) => (
            <div key={idx} className="rounded-lg p-3" style={{ background: '#111827', border: '1px solid #1f2937' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={12} className="flex-shrink-0" style={{ color: '#a78bfa' }} />
                  <span className="text-xs font-semibold truncate" style={{ color: '#e5e7eb' }}>
                    [{idx + 1}] {cit.source}
                  </span>
                  {cit.page && (
                    <span className="text-xs text-gray-500">p.{cit.page}</span>
                  )}
                </div>
                <div
                  className="flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded"
                  style={{
                    background: `rgba(167, 139, 250, ${Math.min(cit.score, 1) * 0.3})`,
                    color: '#a78bfa',
                    border: '1px solid rgba(167, 139, 250, 0.2)',
                  }}
                >
                  {cit.score.toFixed(3)}
                </div>
              </div>
              <blockquote className="text-xs text-gray-400 italic leading-relaxed border-l-2 pl-3"
                style={{ borderColor: '#4b5563' }}>
                {cit.content.length > 400 ? cit.content.slice(0, 400) + '…' : cit.content}
              </blockquote>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CitationCards;
