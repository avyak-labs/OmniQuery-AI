import { type FC } from 'react';
import type { Session, SystemConnection } from '../types';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  connections?: SystemConnection[];
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

const Sidebar: FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  connections = [],
  onSelectSession,
  onNewSession,
}) => {
  const nonEmptySessions = sessions.filter(s => s.messages.length > 0);

  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const todaySessions = nonEmptySessions.filter(
    s => now - new Date(s.createdAt).getTime() < oneDayMs
  );
  const pastSessions = nonEmptySessions.filter(
    s => now - new Date(s.createdAt).getTime() >= oneDayMs
  );

  return (
    <aside className="sidebar">
      {/* Workspace / Org Switcher */}
      <div className="org-switcher">
        <div className="org-info">
          <div className="org-icon">A</div>
          <div>
            <div className="org-title">OmniQuery AI</div>
            <div className="org-sub">Avyak Labs · Enterprise</div>
          </div>
        </div>
        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>▾</span>
      </div>

      {/* New Query CTA (without Ctrl K badge as requested) */}
      <button className="new-chat-btn" onClick={onNewSession} style={{ justifyContent: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
        <span>New Query</span>
      </button>

      {/* Real Dynamic Chat History List */}
      <div className="nav-section">
        {todaySessions.length > 0 && (
          <>
            <div className="nav-label">Today</div>
            {todaySessions.map(session => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`chat-item ${isActive ? 'active' : ''}`}
                  title={session.title}
                >
                  <span className="chat-icon">💬</span>
                  <span className="truncate">{session.title}</span>
                </div>
              );
            })}
          </>
        )}

        {pastSessions.length > 0 && (
          <>
            <div className="nav-label" style={{ marginTop: '14px' }}>
              Previous 7 Days
            </div>
            {pastSessions.map(session => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`chat-item ${isActive ? 'active' : ''}`}
                  title={session.title}
                >
                  <span className="chat-icon">💬</span>
                  <span className="truncate">{session.title}</span>
                </div>
              );
            })}
          </>
        )}

        {todaySessions.length === 0 && pastSessions.length === 0 && (
          <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            No previous investigations yet. Start a query below!
          </div>
        )}
      </div>

      {/* Live Connected Repositories Box */}
      <div className="data-sources-box">
        <div className="data-sources-header">Active Data Connections</div>
        {connections && connections.length > 0 ? (
          connections.map(conn => (
            <div key={conn.id} className="source-row" title={conn.detail}>
              <div
                className="status-dot"
                style={{
                  background: conn.status === 'connected' ? 'var(--success)' : '#ef4444',
                  boxShadow: conn.status === 'connected' ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none',
                }}
              />
              <span className="truncate" style={{ fontSize: '10.5px' }}>
                {conn.name}
              </span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Checking live services...</div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="user-footer">
        <div className="user-meta">
          <div className="avatar">CC</div>
          <div>
            <div className="user-name">Canishe C</div>
            <div className="user-role">GenAI Engineer</div>
          </div>
        </div>
        <span style={{ color: 'var(--text-dim)', fontSize: '14px' }}>⚙️</span>
      </div>
    </aside>
  );
};

export default Sidebar;
