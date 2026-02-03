
import React, { useEffect, useState } from 'react';
import { adminApiService } from '../services/adminApi';
import { User, AccountStatus, UserRole } from '../types';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await adminApiService.getAllUsers();
      // Handle both direct array response and nested data response
      const userList = Array.isArray(data) ? data : (data.users || data.data || []);
      setUsers(userList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleExcelDownload = () => {
    if (filteredUsers.length === 0) {
      alert('No users to export');
      return;
    }

    // Create HTML table that can be opened in Excel
    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Users Report - ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login IP</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredUsers.map(u => `
                <tr>
                  <td>${u.name}</td>
                  <td>${u.email}</td>
                  <td>${u.role}</td>
                  <td>${u.status}</td>
                  <td>${u.lastLoginIp || 'N/A'}</td>
                  <td>${new Date().toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVDownload = () => {
    if (filteredUsers.length === 0) {
      alert('No users to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Role', 'Status', 'Last Login IP'];
    const rows = filteredUsers.map(u => [
      u.name,
      u.email,
      u.role,
      u.status,
      u.lastLoginIp || 'Unknown'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filter === 'ALL' || u.role === filter;
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Syncing global user ledger...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900">Failed to load users</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-red-600 font-bold text-sm hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">User Governance</h2>
          <p className="text-slate-500 font-medium">Manage permissions and access for {users.length.toLocaleString()} identities</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCSVDownload}
            disabled={filteredUsers.length === 0}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button 
            onClick={handleExcelDownload}
            disabled={filteredUsers.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Excel
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
            onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
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
        {!hasSearched && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Search to View Users
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              Click the Search button to load and display all users. You can filter by role and search by name, email, or IP address.
            </p>
          </div>
        ) : hasSearched && filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No matching users
            </h3>
            <p className="text-slate-600 text-center max-w-md">{users.length === 0 
                ? 'Users will appear here as they register on the platform'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Users;
