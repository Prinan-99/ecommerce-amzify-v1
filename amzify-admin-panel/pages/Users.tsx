
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { User, AccountStatus, UserRole } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    AdminApi.getUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkSuspend = async () => {
    if (confirm(`Are you sure you want to suspend ${selectedIds.size} users?`)) {
      // In a real app, send bulk API request
      setUsers(users.map(u => selectedIds.has(u.id) ? { ...u, status: AccountStatus.SUSPENDED } : u));
      setSelectedIds(new Set());
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filter === 'ALL' || u.role === filter;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) return <div className="p-8">Syncing global user ledger...</div>;

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">User Governance</h2>
          <p className="text-slate-500 font-medium">Manage permissions and access for {users.length.toLocaleString()} identities</p>
        </div>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <button 
              onClick={handleBulkSuspend}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-rose-200"
            >
              Suspend Selected ({selectedIds.size})
            </button>
          )}
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search by name, email, or IP..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>
        <select 
          className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          <option value={UserRole.SELLER}>Sellers</option>
          <option value={UserRole.CUSTOMER}>Customers</option>
          <option value={UserRole.SUPPORT}>Support Agents</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4"><input type="checkbox" className="rounded" onChange={(e) => {
                  if (e.target.checked) setSelectedIds(new Set(filteredUsers.map(u => u.id)));
                  else setSelectedIds(new Set());
                }} /></th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Entity Info</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Global Role</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Security</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(user.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      user.role === UserRole.SELLER ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      user.status === AccountStatus.ACTIVE ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === AccountStatus.ACTIVE ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span>{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-mono text-slate-400">
                      IP: {user.lastLoginIp || 'Unknown'}<br/>
                      UID: {user.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold text-xs hover:underline mr-3">Audit</button>
                    <button className="text-slate-400 font-bold text-xs hover:text-slate-900">Force Logout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
