import React, { useEffect, useState } from 'react';
import { adminApiService } from '../services/adminApi';
import { Download, AlertCircle, Loader2 } from 'lucide-react';

interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  company_name: string;
  is_approved: boolean;
  is_verified: boolean;
  created_at: string;
}

const loadStoredSellers = (): Seller[] => {
  return [];
};

const saveStoredSellers = () => {};

const loadStoredApplications = () => {
  return [];
};

const saveStoredApplications = () => {};

const Sellers: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      const data = await adminApiService.getAllSellers();
      // Handle both direct array response and nested data response
      const sellerList = Array.isArray(data) ? data : (data.sellers || data.data || []);
      setSellers(sellerList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sellers';
      setError(errorMessage);
      console.error('Error fetching sellers:', err);
      setSellers([]);
      } finally {
        setLoading(false);
      }
  };

  const handleCSVDownload = () => {
    if (filteredSellers.length === 0) {
      alert('No sellers to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Company', 'Phone', 'Status', 'Approved', 'Verified'];
    const rows = filteredSellers.map(s => [
      s.name,
      s.email,
      s.company_name,
      s.phone || 'N/A',
      s.status,
      s.is_approved ? 'Yes' : 'No',
      s.is_verified ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sellers-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelDownload = () => {
    if (filteredSellers.length === 0) {
      alert('No sellers to export');
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
          <h2>Sellers Report - ${new Date().toLocaleDateString()}</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Approved</th>
                <th>Verified</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSellers.map(s => `
                <tr>
                  <td>${s.name}</td>
                  <td>${s.email}</td>
                  <td>${s.company_name}</td>
                  <td>${s.phone || 'N/A'}</td>
                  <td>${s.status}</td>
                  <td>${s.is_approved ? '✓' : '✗'}</td>
                  <td>${s.is_verified ? '✓' : '✗'}</td>
                  <td>${new Date(s.created_at).toLocaleDateString()}</td>
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
    link.setAttribute('download', `sellers-${new Date().toISOString().slice(0, 10)}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSeller = async () => {
    alert('Add seller functionality would be implemented here');
  };

  const filteredSellers = sellers.filter(s => {
    const matchesStatus = filter === 'ALL' || s.status === filter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.company_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Syncing seller directory...</p>
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
            <h3 className="font-bold text-red-900">Failed to load sellers</h3>
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
          <h2 className="text-3xl font-black text-slate-900">Seller Management</h2>
          <p className="text-slate-500 font-medium">Manage and monitor {sellers.length.toLocaleString()} active sellers on the platform</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCSVDownload}
            disabled={filteredSellers.length === 0}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button 
            onClick={handleExcelDownload}
            disabled={filteredSellers.length === 0}
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
            placeholder="Search by name, email, or company..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchSellers()}
          />
          <span className="absolute left-3 top-3 text-slate-400">🔍</span>
        </div>
        <button
          onClick={fetchSellers}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <select 
          className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {!hasSearched && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Search to View Sellers
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              Click the Search button to load and display all sellers. You can filter by status and search by name, email, or company name.
            </p>
          </div>
        ) : hasSearched && filteredSellers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No matching sellers
            </h3>
            <p className="text-slate-600 text-center max-w-md">
              {sellers.length === 0 
                ? 'No sellers found in the system'
                : 'Try adjusting your search or filter criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Seller Info</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Company</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Approval</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSellers.map(seller => (
                  <tr key={seller.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-black text-purple-600">
                          {seller.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{seller.name}</p>
                          <p className="text-xs font-medium text-slate-500">{seller.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{seller.company_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-mono text-slate-600">{seller.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                        seller.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${seller.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{seller.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {seller.is_approved ? (
                          <span className="inline-flex items-center text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                            ✓ Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-bold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
                            ⏳ Pending
                          </span>
                        )}
                        {seller.is_verified && (
                          <span className="inline-flex items-center text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">
                        {new Date(seller.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-bold text-xs hover:underline mr-3">View</button>
                      <button className="text-slate-400 font-bold text-xs hover:text-slate-900">Edit</button>
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

export default Sellers;
