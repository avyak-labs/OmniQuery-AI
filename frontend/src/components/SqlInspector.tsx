import { type FC, useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';

interface SqlInspectorProps {
  sqlQuery: string;
  sqlResult?: Record<string, unknown>[] | null;
}

const SqlInspector: FC<SqlInspectorProps> = ({ sqlQuery, sqlResult }) => {
  const [open, setOpen] = useState(false);

  const columns = sqlResult && sqlResult.length > 0 ? Object.keys(sqlResult[0]) : [];

  return (
    <div className="rounded-xl overflow-hidden mt-3" style={{ border: '1px solid rgba(34, 211, 238, 0.2)', background: 'rgba(34, 211, 238, 0.04)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
        style={{ color: '#22d3ee' }}
      >
        <Database size={14} />
        <span>🔍 Executed Read-Only SQL Query</span>
        <span className="ml-auto">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* SQL Code Block */}
          <pre className="text-xs p-4 rounded-lg mt-1 overflow-x-auto text-green-300 leading-relaxed"
            style={{ background: '#0d1117', border: '1px solid #21262d' }}>
            <code>{sqlQuery}</code>
          </pre>

          {/* Tabular Results */}
          {sqlResult && sqlResult.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2 font-medium">📊 Query Results ({sqlResult.length} rows)</p>
              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #1f2937' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#111827' }}>
                      {columns.map(col => (
                        <th key={col} className="px-3 py-2 text-left font-semibold" style={{ color: '#22d3ee', borderBottom: '1px solid #1f2937' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sqlResult.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid #1f2937' }}>
                        {columns.map(col => (
                          <td key={col} className="px-3 py-2 text-gray-300">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sqlResult && sqlResult.length === 0 && (
            <p className="text-xs text-gray-500 mt-2 italic">No records returned for this query.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SqlInspector;
