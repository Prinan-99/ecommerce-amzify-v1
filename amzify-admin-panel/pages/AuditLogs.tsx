
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { AuditLog } from '../types';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getAuditLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading audit trail...</div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h2 className="text-3xl font-black text-slate-900">Immutable Audit Trail</h2>
        <p className="text-slate-500 font-medium">Compliance-grade logging of every administrative action</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Admin</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Target Entity</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Security Data</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{log.adminName}</p>
                  <p className="text-[10px] text-slate-400">{log.adminId}</p>
                </td>
                <td className="px-6 py-4">
                   <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                     {log.action}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">{log.target}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[10px] font-mono text-slate-400">IP: {log.ip}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <p className="text-xs font-bold text-slate-900">{new Date(log.timestamp).toLocaleDateString()}</p>
                  <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
