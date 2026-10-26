import { type FC } from 'react';
import type { Citation } from '../types';

interface CitationCardsProps {
  citations: Citation[];
}

const CitationCards: FC<CitationCardsProps> = ({ citations }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="citation-block">
      <div className="citation-title">Grounded Sources (FlashRank Re-ranked)</div>
      <div className="citation-pill-container">
        {citations.map((cit, idx) => (
          <div key={idx} className="citation-pill" title={cit.content}>
            <span>
              📄 {cit.source} {cit.page ? `(p. ${cit.page})` : ''}
            </span>
            <span className="score-badge">
              {typeof cit.score === 'number' ? cit.score.toFixed(2) : cit.score} score
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitationCards;
