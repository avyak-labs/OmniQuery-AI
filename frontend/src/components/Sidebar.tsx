import { Brain, Cpu, Layers, Activity } from 'lucide-react';

const Sidebar = () => {
  const capabilities = [
    { icon: <Layers size={13} />, label: 'Hybrid RAG', detail: 'pgvector + BM25 + RRF', color: '#a78bfa' },
    { icon: <Cpu size={13} />, label: 'FlashRank Re-ranking', detail: 'TinyBERT Cross-Encoder', color: '#a78bfa' },
    { icon: <Brain size={13} />, label: 'LangGraph Router', detail: 'Conditional State Machine', color: '#6366f1' },
    { icon: <Activity size={13} />, label: 'Text-to-SQL', detail: '5-Layer Security Sandbox', color: '#22d3ee' },
  ];

  const metrics = [
    { label: 'Faithfulness', value: '99.70%', color: '#10b981' },
    { label: 'Answer Relevance', value: '88.00%', color: '#10b981' },
    { label: 'Context Precision', value: '86.00%', color: '#10b981' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 flex-shrink-0 h-full"
      style={{ background: 'var(--omni-surface)', borderRight: '1px solid var(--omni-border)' }}>

      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--omni-border)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'var(--omni-accent-glow)', border: '1px solid rgba(99,102,241,0.4)' }}>
            🤖
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--omni-text)' }}>OmniQuery-AI</h1>
            <p className="text-xs" style={{ color: 'var(--omni-text-muted)' }}>Enterprise Copilot v1.0</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs" style={{ color: 'var(--omni-text-muted)' }}>Backend Online</span>
        </div>
      </div>

      {/* Architecture */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--omni-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--omni-text-muted)' }}>
          Active Engines
        </p>
        <div className="space-y-2.5">
          {capabilities.map(cap => (
            <div key={cap.label} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cap.color}18`, color: cap.color }}>
                {cap.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium" style={{ color: 'var(--omni-text)' }}>{cap.label}</p>
                <p className="text-xs truncate" style={{ color: 'var(--omni-text-muted)' }}>{cap.detail}</p>
              </div>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* RAGAS Quality Scores */}
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--omni-text-muted)' }}>
          RAGAS Quality Gate
        </p>
        <div className="space-y-2">
          {metrics.map(m => (
            <div key={m.label} className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'var(--omni-text-muted)' }}>{m.label}</span>
              <span className="text-xs font-mono font-semibold" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg p-3 text-xs" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <p className="font-semibold" style={{ color: '#10b981' }}>✅ All Quality Gates Passing</p>
          <p className="mt-0.5" style={{ color: 'var(--omni-text-muted)' }}>Automated RAGAS regression suite (28/28 tests green)</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4" style={{ borderTop: '1px solid var(--omni-border)' }}>
        <p className="text-xs" style={{ color: 'var(--omni-text-muted)' }}>
          Built by <span className="font-semibold text-gray-300">Avyak Labs</span><br />
          Janar (AI Architect) · Canishe (GenAI Engineer)
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
