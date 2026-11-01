import { type FC } from 'react';

interface SqlInspectorProps {
  sqlQuery: string;
  sqlResult?: Record<string, unknown>[] | string | null;
}

const SqlInspector: FC<SqlInspectorProps> = ({ sqlQuery, sqlResult }) => {
  const rows: Record<string, unknown>[] = Array.isArray(sqlResult) ? sqlResult : [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="sql-inspector">
      <div className="sql-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🔍</span> Executed Safe SQL (Read-Only Sandbox)
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-dim)' }}>
          PostgreSQL Kernel Isolated (Safe Read-Only)
        </span>
      </div>

      <pre className="sql-code">
        <code>{sqlQuery}</code>
      </pre>

      {rows.length > 0 && (
        <div className="sql-table-container">
          <table className="sql-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col}>{col.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map(col => {
                    const val = String(row[col] ?? '');
                    const isTotal = col.toLowerCase().includes('total') || col.toLowerCase().includes('amount') || col.toLowerCase().includes('price');
                    const isId = col.toLowerCase().includes('id') || col.toLowerCase().includes('sku');
                    const isStatus = col.toLowerCase().includes('status');

                    let statusColor = '#94a3b8';
                    const s = val.toLowerCase();
                    if (s === 'completed' || s === 'delivered') statusColor = '#34d399';
                    else if (s === 'pending' || s === 'processing') statusColor = '#fbbf24';
                    else if (s === 'cancelled' || s === 'failed') statusColor = '#f87171';
                    else if (s === 'shipped') statusColor = '#38bdf8';

                    return (
                      <td
                        key={col}
                        style={{
                          fontFamily: isId ? "'JetBrains Mono', monospace" : 'inherit',
                          color: isTotal ? '#34d399' : (isStatus ? statusColor : 'inherit'),
                          fontWeight: (isTotal || isStatus) ? 500 : 400,
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {typeof sqlResult === 'string' && (
        <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {sqlResult}
        </div>
      )}
    </div>
  );
};

export default SqlInspector;
