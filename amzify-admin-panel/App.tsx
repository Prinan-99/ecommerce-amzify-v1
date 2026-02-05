import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, Users, Settings, Shield, Activity, AlertTriangle, 
  Package, ShoppingCart, FileText, LogOut, User, CheckCircle, XCircle,
  Eye, Edit, Trash2, Search, Filter, Download, RefreshCw, Loader2,
  TrendingUp, DollarSign, Clock, Ban, Truck, MapPin, Navigation, MessageSquare, Store, X
} from 'lucide-react';
import { useAuth } from './context/RealAuthContext';
import LoginPortal from './components/LoginPortal';
import { adminApiService } from './services/adminApi';
import SellerApplications from './pages/SellerApplications';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  // Authentication integration
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // Role validation - ensure only super admins can access this panel
  const hasAdminAccess = user?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sellers' | 'seller-applications' | 'products' | 'feedback' | 'logistics' | 'settings'>('dashboard');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Load admin data
  useEffect(() => {
    if (isAuthenticated && hasAdminAccess) {
      loadAdminData();
    } else if (!authLoading) {
      // Auth check complete, no need to load data for non-admins
      setIsDataLoading(false);
    }
  }, [isAuthenticated, hasAdminAccess, authLoading]);

  const loadAdminData = async () => {
    try {
      setIsDataLoading(true);
      const [statsResponse, usersResponse, sellersResponse, productsResponse] = await Promise.all([
        adminApiService.getSystemStats().catch(() => null),
        adminApiService.getAllUsers().catch(() => ({ users: [] })),
        adminApiService.getAllSellers().catch(() => ({ sellers: [] })),
        adminApiService.getAllProducts({ status: 'pending_approval' }).catch(() => ({ products: [] }))
      ]);

      setStats(statsResponse?.overview || statsResponse);
      setUsers(usersResponse.users || []);
      setSellers(sellersResponse.sellers || []);
      setProducts(productsResponse.products || []);
      // Feedback is loaded independently in FeedbackTab component
    } catch (error) {
      console.error('Load admin data error:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      await adminApiService.approveProduct(productId);
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Approve product error:', error);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    try {
      await adminApiService.rejectProduct(productId, 'Does not meet quality standards');
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Reject product error:', error);
    }
  };

  const handleApproveSeller = async (sellerId: string) => {
    try {
      await adminApiService.approveSeller(sellerId);
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Approve seller error:', error);
    }
  };

  const handleUpdateUser = (userId: string, updates: Record<string, any>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updates } : u)));
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
    );
  };

  const handleUpdateSeller = (sellerId: string, updates: Record<string, any>) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, ...updates } : s)));
  };

  const handleToggleSellerStatus = (sellerId: string) => {
    setSellers((prev) =>
      prev.map((s) => {
        if (s.id !== sellerId) return s;
        const isActive = s.is_active ?? (s.status ? s.status.toLowerCase() === 'active' : false);
        const nextActive = !isActive;
        return {
          ...s,
          is_active: nextActive,
          status: nextActive ? 'ACTIVE' : 'SUSPENDED'
        };
      })
    );
  };

  const handleRejectSeller = async (sellerId: string) => {
    try {
      await adminApiService.rejectSeller(sellerId, 'Incomplete documentation');
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error('Reject seller error:', error);
    }
  };

  // Access control - redirect or show error if user doesn't have admin access
  if (!isAuthenticated) {
    return <LoginPortal />;
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl text-center max-w-md">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black tracking-tighter text-slate-950 mb-4">Access Denied</h2>
          <p className="text-sm text-slate-600 mb-8">You don't have permission to access the admin panel. Only super administrators can view this page.</p>
          <div className="flex gap-4">
            <button 
              onClick={logout}
              className="flex-1 py-4 bg-slate-100 text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Logout
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 py-4 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <h1 className="font-black text-sm uppercase tracking-widest">Amzify Admin Panel</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={loadAdminData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Super Admin</p>
            <p className="text-xs font-black text-slate-950 mt-1">
              {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Unknown Admin'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-red-100">
            {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <button 
            onClick={logout}
            className="ml-2 p-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-w-[1440px] mx-auto p-6">
        <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-x-auto no-scrollbar flex gap-1 mb-8 justify-center">
          {(['dashboard', 'users', 'sellers', 'seller-applications', 'products', 'feedback', 'logistics', 'settings'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-950'}`}
            >
              {tab === 'seller-applications' ? 'Applications' : tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[70vh]">
          {authLoading || isDataLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
                <p className="text-slate-600">Loading admin dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
              {activeTab === 'users' && (
                <UsersTab
                  users={users}
                  onRefresh={loadAdminData}
                  onUpdate={handleUpdateUser}
                  onToggleStatus={handleToggleUserStatus}
                />
              )}
              {activeTab === 'sellers' && (
                <SellersTab
                  sellers={sellers}
                  onApprove={handleApproveSeller}
                  onReject={handleRejectSeller}
                  onRefresh={loadAdminData}
                  onUpdate={handleUpdateSeller}
                  onToggleStatus={handleToggleSellerStatus}
                />
              )}
              {activeTab === 'seller-applications' && <SellerApplications />}
              {activeTab === 'products' && <ProductsTab products={products} onApprove={handleApproveProduct} onReject={handleRejectProduct} onRefresh={loadAdminData} />}
              {activeTab === 'feedback' && <FeedbackTab onRefresh={loadAdminData} />}
              {activeTab === 'logistics' && <LogisticsTab onRefresh={loadAdminData} />}
              {activeTab === 'settings' && <SettingsTab />}
            </>
          )}
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{ stats: any }> = ({ stats }) => {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-black text-blue-600">+5%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.total_customers || 0}</h3>
          <p className="text-xs font-medium text-slate-500">Total Customers</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-black text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.total_sellers || 0}</h3>
          <p className="text-xs font-medium text-slate-500">Active Sellers</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-black text-purple-600">+8%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{stats?.total_orders || 0}</h3>
          <p className="text-xs font-medium text-slate-500">Total Orders</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-black text-green-600">+15%</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            {stats?.total_revenue ? formatINR(stats.total_revenue) : '₹0'}
          </h3>
          <p className="text-xs font-medium text-slate-500">Total Revenue</p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-black text-slate-900 mb-8">Welcome to Amzify Admin Panel</h3>
        <p className="text-slate-600 mb-8">
          Manage users, sellers, products, and monitor the entire Amzify marketplace. 
          Use the navigation above to access different administrative functions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <Users className="w-8 h-8 text-red-600 mb-4" />
            <h4 className="font-black text-slate-900 mb-2">User Management</h4>
            <p className="text-sm text-slate-600">Manage customer accounts and permissions</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <Package className="w-8 h-8 text-red-600 mb-4" />
            <h4 className="font-black text-slate-900 mb-2">Seller Oversight</h4>
            <p className="text-sm text-slate-600">Monitor and manage seller accounts and products</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <BarChart3 className="w-8 h-8 text-red-600 mb-4" />
            <h4 className="font-black text-slate-900 mb-2">System Analytics</h4>
            <p className="text-sm text-slate-600">Monitor platform performance and metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC<{
  users: any[];
  onRefresh: () => void;
  onUpdate: (id: string, updates: Record<string, any>) => void;
  onToggleStatus: (id: string) => void;
}> = ({ users, onRefresh, onUpdate, onToggleStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', is_active: true });

  const baseUsers = users.filter((u) => {
    const role = (u.role || '').toLowerCase();
    return role !== 'seller' && role !== 'admin';
  });

  const filteredUsers = baseUsers.filter((user) => {
    const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
    const email = (user.email || '').toLowerCase();
    const role = (user.role || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = query.length === 0 || name.toLowerCase().includes(query) || email.includes(query);
    const matchesRole = roleFilter === 'all' || role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const handleSearch = () => {
    setHasSearched(true);
  };

  const openEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      first_name: user.first_name || (user.name ? user.name.split(' ')[0] : ''),
      last_name: user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : ''),
      email: user.email || '',
      is_active: user.is_active ?? false
    });
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    onUpdate(editUser.id, {
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      name: `${editForm.first_name} ${editForm.last_name}`.trim(),
      email: editForm.email,
      is_active: editForm.is_active
    });
    setEditUser(null);
  };

  const handleCSVDownload = () => {
    if (!hasSearched || filteredUsers.length === 0) return;
    const headers = ['Name', 'Email', 'Role', 'Status'];
    const rows = filteredUsers.map((u) => [
      u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      u.email,
      u.role,
      u.is_active ? 'Active' : 'Inactive'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `users-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelDownload = () => {
    if (!hasSearched || filteredUsers.length === 0) return;
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
              </tr>
            </thead>
            <tbody>
              ${filteredUsers
                .map((u) => {
                  const name = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
                  return `
                    <tr>
                      <td>${name}</td>
                      <td>${u.email}</td>
                      <td>${u.role}</td>
                      <td>${u.is_active ? 'Active' : 'Inactive'}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `users-${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-black tracking-tighter">User Management</h3>
          <p className="text-slate-500 text-sm">Search to view users. Sellers are listed under the Sellers tab.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCSVDownload}
            disabled={!hasSearched || filteredUsers.length === 0}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download CSV
          </button>
          <button
            onClick={handleExcelDownload}
            disabled={!hasSearched || filteredUsers.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download Excel
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-red-500"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="support">Support</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
        >
          Search
        </button>
      </div>

      {!hasSearched ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">Search to view users</h4>
          <p className="text-slate-600">Click Search to load and view user data</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No users found</h4>
          <p className="text-slate-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const name = user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim();
            return (
              <div key={user.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{name || 'Unknown User'}</h4>
                      <p className="text-slate-600 text-sm">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          user.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'support' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewUser(user)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(user)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(user.id)}
                      className={`p-2 rounded-lg transition-all ${
                        user.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={user.is_active ? 'Disable' : 'Enable'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black">User Details</h4>
              <button onClick={() => setViewUser(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold">Name:</span> {viewUser.name || `${viewUser.first_name || ''} ${viewUser.last_name || ''}`.trim()}</div>
              <div><span className="font-semibold">Email:</span> {viewUser.email}</div>
              <div><span className="font-semibold">Role:</span> {viewUser.role}</div>
              <div><span className="font-semibold">Status:</span> {viewUser.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewUser(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black">Edit User</h4>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-slate-200 rounded-lg px-3 py-2"
                placeholder="First name"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2"
                placeholder="Last name"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 md:col-span-2"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditUser(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-red-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sellers Tab Component
const SellersTab: React.FC<{
  sellers: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRefresh: () => void;
  onUpdate: (id: string, updates: Record<string, any>) => void;
  onToggleStatus: (id: string) => void;
}> = ({ sellers, onApprove, onReject, onRefresh, onUpdate, onToggleStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [viewSeller, setViewSeller] = useState<any | null>(null);
  const [editSeller, setEditSeller] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', company_name: '', phone: '', is_active: true });

  const filteredSellers = sellers.filter((seller) => {
    const name = seller.name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim();
    const email = (seller.email || '').toLowerCase();
    const company = (seller.company_name || '').toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = query.length === 0 || name.toLowerCase().includes(query) || email.includes(query) || company.includes(query);
    const isActive = seller.is_active ?? (seller.status ? seller.status.toLowerCase() === 'active' : false);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && isActive) || (statusFilter === 'inactive' && !isActive);
    return matchesQuery && matchesStatus;
  });

  const handleSearch = () => {
    setHasSearched(true);
  };

  const openEdit = (seller: any) => {
    const name = seller.name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim();
    setEditSeller(seller);
    setEditForm({
      name,
      email: seller.email || '',
      company_name: seller.company_name || seller.storeName || '',
      phone: seller.phone || '',
      is_active: seller.is_active ?? (seller.status ? seller.status.toLowerCase() === 'active' : false)
    });
  };

  const handleSaveEdit = () => {
    if (!editSeller) return;
    const [first_name, ...rest] = editForm.name.split(' ');
    const last_name = rest.join(' ');
    onUpdate(editSeller.id, {
      name: editForm.name,
      first_name,
      last_name,
      email: editForm.email,
      company_name: editForm.company_name,
      phone: editForm.phone,
      is_active: editForm.is_active,
      status: editForm.is_active ? 'ACTIVE' : 'SUSPENDED'
    });
    setEditSeller(null);
  };

  const handleCSVDownload = () => {
    if (!hasSearched || filteredSellers.length === 0) return;
    const headers = ['Name', 'Email', 'Company', 'Status', 'Approved', 'Verified'];
    const rows = filteredSellers.map((s) => [
      s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
      s.email,
      s.company_name || 'N/A',
      s.is_active ? 'Active' : 'Inactive',
      s.seller_approved ? 'Approved' : 'Pending',
      s.is_verified ? 'Verified' : 'Unverified'
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `sellers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExcelDownload = () => {
    if (!hasSearched || filteredSellers.length === 0) return;
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
                <th>Status</th>
                <th>Approved</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSellers
                .map((s) => {
                  const name = s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim();
                  return `
                    <tr>
                      <td>${name}</td>
                      <td>${s.email}</td>
                      <td>${s.company_name || 'N/A'}</td>
                      <td>${s.is_active ? 'Active' : 'Inactive'}</td>
                      <td>${s.seller_approved ? 'Approved' : 'Pending'}</td>
                      <td>${s.is_verified ? 'Verified' : 'Unverified'}</td>
                    </tr>
                  `;
                })
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `sellers-${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-3xl font-black tracking-tighter">Seller Management</h3>
          <p className="text-slate-500 text-sm">Search to view sellers and download reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCSVDownload}
            disabled={!hasSearched || filteredSellers.length === 0}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download CSV
          </button>
          <button
            onClick={handleExcelDownload}
            disabled={!hasSearched || filteredSellers.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 inline mr-2" />
            Download Excel
          </button>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-red-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
        >
          Search
        </button>
      </div>

      {!hasSearched ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">Search to view sellers</h4>
          <p className="text-slate-600">Click Search to load and view seller data</p>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No sellers found</h4>
          <p className="text-slate-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSellers.map((seller) => {
            const name = seller.name || `${seller.first_name || ''} ${seller.last_name || ''}`.trim();
            return (
              <div key={seller.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{name || 'Unknown Seller'}</h4>
                      <p className="text-slate-600 text-sm">{seller.email}</p>
                      <p className="text-slate-500 text-xs">{seller.company_name || 'N/A'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          seller.seller_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {seller.seller_approved ? 'Approved' : 'Pending'}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          seller.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {seller.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!seller.seller_approved && (
                      <>
                        <button
                          onClick={() => onApprove(seller.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(seller.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                        >
                          <XCircle className="w-4 h-4 inline mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setViewSeller(seller)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEdit(seller)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(seller.id)}
                      className={`p-2 rounded-lg transition-all ${
                        (seller.is_active ?? (seller.status ? seller.status.toLowerCase() === 'active' : false))
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      title={(seller.is_active ?? (seller.status ? seller.status.toLowerCase() === 'active' : false)) ? 'Disable' : 'Enable'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black">Seller Details</h4>
              <button onClick={() => setViewSeller(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <div><span className="font-semibold">Name:</span> {viewSeller.name || `${viewSeller.first_name || ''} ${viewSeller.last_name || ''}`.trim()}</div>
              <div><span className="font-semibold">Email:</span> {viewSeller.email}</div>
              <div><span className="font-semibold">Company:</span> {viewSeller.company_name || viewSeller.storeName || 'N/A'}</div>
              <div><span className="font-semibold">Phone:</span> {viewSeller.phone || 'N/A'}</div>
              <div><span className="font-semibold">Status:</span> {(viewSeller.is_active ?? (viewSeller.status ? viewSeller.status.toLowerCase() === 'active' : false)) ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewSeller(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {editSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-black">Edit Seller</h4>
              <button onClick={() => setEditSeller(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 md:col-span-2"
                placeholder="Full name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 md:col-span-2"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2"
                placeholder="Company"
                value={editForm.company_name}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2"
                placeholder="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setEditSeller(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-red-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Products Tab Component
const ProductsTab: React.FC<{ products: any[]; onApprove: (id: string) => void; onReject: (id: string) => void; onRefresh: () => void }> = ({ products, onApprove, onReject, onRefresh }) => {
  const [historyMap, setHistoryMap] = useState<Record<string, { timestamp: string; changes: { field: string; from: any; to: any }[] }[]>>({});
  const [historyProduct, setHistoryProduct] = useState<any | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const prevProductsRef = useRef<any[]>([]);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const historyFields: { label: string; get: (product: any) => any }[] = [
    { label: 'Name', get: (p) => p.name },
    { label: 'Price', get: (p) => p.price },
    { label: 'Status', get: (p) => p.status },
    { label: 'Stock', get: (p) => p.stock_quantity ?? p.stock },
    { label: 'Category', get: (p) => p.category_name ?? p.category },
    { label: 'Description', get: (p) => p.description },
    { label: 'Images', get: (p) => (Array.isArray(p.images) ? p.images.length : 0) }
  ];

  const getLastUpdated = (product: any) => {
    return product.updated_at || product.updatedAt || product.created_at || product.createdAt;
  };

  const isRecentlyUpdated = (product: any) => {
    const lastUpdated = getLastUpdated(product);
    if (!lastUpdated) return false;
    const updatedAt = new Date(lastUpdated).getTime();
    if (Number.isNaN(updatedAt)) return false;
    const hoursSinceUpdate = (Date.now() - updatedAt) / (1000 * 60 * 60);
    return hoursSinceUpdate <= 24;
  };

  useEffect(() => {
    const previous = prevProductsRef.current;
    if (previous.length > 0) {
      const previousById = new Map(previous.map((p) => [p.id, p]));
      products.forEach((product) => {
        const prev = previousById.get(product.id);
        if (!prev) return;

        const changes = historyFields
          .map((field) => {
            const before = field.get(prev);
            const after = field.get(product);
            return before !== after ? { field: field.label, from: before, to: after } : null;
          })
          .filter(Boolean) as { field: string; from: any; to: any }[];

        if (changes.length > 0) {
          setHistoryMap((current) => ({
            ...current,
            [product.id]: [
              ...(current[product.id] || []),
              { timestamp: new Date().toISOString(), changes }
            ]
          }));
        }
      });
    }

    prevProductsRef.current = products;
  }, [products]);

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black tracking-tighter">Product Oversight</h3>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Refresh
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No products found</h4>
          <p className="text-slate-600">Product submissions will appear here for review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`border rounded-2xl p-6 hover:shadow-lg transition-all ${
                isRecentlyUpdated(product)
                  ? 'border-indigo-300 bg-indigo-50/30 shadow-sm'
                  : 'border-slate-200'
              }`}
            >
              <div className="aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden">
                <img 
                  src={product.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{product.name}</h4>
              <p className="text-slate-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-black text-slate-900">{formatINR(product.price)}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' :
                  product.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="text-xs text-slate-500">by {product.seller_name}</p>
              <p className="text-xs text-slate-500 mb-4">Last updated: {formatDateTime(getLastUpdated(product))}</p>

              <div className="flex items-center justify-between gap-2 mb-3">
                <button
                  onClick={() => {
                    setHistoryProduct(product);
                    setIsHistoryOpen(true);
                  }}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-all"
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  View History
                </button>
                {isRecentlyUpdated(product) && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Updated
                  </span>
                )}
              </div>
              
              {product.status === 'pending_approval' && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onApprove(product.id)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Approve
                  </button>
                  <button 
                    onClick={() => onReject(product.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isHistoryOpen && historyProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-900">Change History</h4>
                <p className="text-sm text-slate-500">{historyProduct.name}</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(historyMap[historyProduct.id] || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500">No changes recorded yet.</div>
              ) : (
                [...(historyMap[historyProduct.id] || [])].reverse().map((entry, index) => (
                  <div key={`${historyProduct.id}-${index}`} className="border border-slate-200 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-500">
                      {formatDateTime(entry.timestamp)}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {entry.changes.map((change, changeIndex) => (
                        <li key={`${historyProduct.id}-${index}-${changeIndex}`} className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">{change.field}:</span>{' '}
                          <span className="text-slate-400 line-through">{formatValue(change.from)}</span>
                          <span className="mx-2 text-slate-500">→</span>
                          <span className="text-slate-900">{formatValue(change.to)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Orders Tab Component
const OrdersTab: React.FC<{ orders: any[]; onRefresh: () => void }> = ({ orders, onRefresh }) => {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black tracking-tighter">Order Management</h3>
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-slate-900 mb-2">No orders found</h4>
          <p className="text-slate-600">Customer orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">Order #{order.order_number}</h4>
                  <p className="text-slate-600 text-sm">{order.customer_name}</p>
                  <p className="text-slate-500 text-xs">{order.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatINR(order.total_amount)}</p>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">
                  {order.items_count} item(s) • {new Date(order.created_at).toLocaleDateString()}
                </p>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all">
                  <Eye className="w-4 h-4 inline mr-1" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Logistics Tab Component
const LogisticsTab: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogisticsData();
  }, []);

  const loadLogisticsData = async () => {
    setIsLoading(true);
    try {
      // Mock logistics data for demo
      setTrackingData([
        {
          id: '1',
          order_number: 'AMZ12345',
          customer_name: 'Jane Customer',
          tracking_number: 'TRK123456789',
          status: 'in_transit',
          current_location: 'Mumbai Distribution Center',
          destination: 'Delhi',
          estimated_delivery: '2024-02-05',
          carrier: 'BlueDart',
          tracking_history: [
            { status: 'order_placed', location: 'Mumbai', timestamp: '2024-02-01T10:00:00Z', description: 'Order placed successfully' },
            { status: 'picked_up', location: 'Mumbai Warehouse', timestamp: '2024-02-01T14:00:00Z', description: 'Package picked up from seller' },
            { status: 'in_transit', location: 'Mumbai Distribution Center', timestamp: '2024-02-02T08:00:00Z', description: 'Package in transit to destination' }
          ]
        },
        {
          id: '2',
          order_number: 'AMZ12346',
          customer_name: 'David Smith',
          tracking_number: 'TRK987654321',
          status: 'delivered',
          current_location: 'Delivered',
          destination: 'Bangalore',
          estimated_delivery: '2024-02-03',
          carrier: 'FedEx',
          tracking_history: [
            { status: 'order_placed', location: 'Mumbai', timestamp: '2024-01-30T10:00:00Z', description: 'Order placed successfully' },
            { status: 'picked_up', location: 'Mumbai Warehouse', timestamp: '2024-01-30T14:00:00Z', description: 'Package picked up from seller' },
            { status: 'in_transit', location: 'Mumbai Distribution Center', timestamp: '2024-01-31T08:00:00Z', description: 'Package in transit to destination' },
            { status: 'out_for_delivery', location: 'Bangalore Local Facility', timestamp: '2024-02-03T06:00:00Z', description: 'Out for delivery' },
            { status: 'delivered', location: 'Bangalore', timestamp: '2024-02-03T15:30:00Z', description: 'Package delivered successfully' }
          ]
        },
        {
          id: '3',
          order_number: 'AMZ12347',
          customer_name: 'Emily Johnson',
          tracking_number: 'TRK456789123',
          status: 'processing',
          current_location: 'Seller Warehouse',
          destination: 'Chennai',
          estimated_delivery: '2024-02-07',
          carrier: 'DTDC',
          tracking_history: [
            { status: 'order_placed', location: 'Mumbai', timestamp: '2024-02-02T16:00:00Z', description: 'Order placed successfully' },
            { status: 'processing', location: 'Seller Warehouse', timestamp: '2024-02-03T09:00:00Z', description: 'Order being prepared for shipment' }
          ]
        }
      ]);
    } catch (error) {
      console.error('Load logistics data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_transit':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'out_for_delivery':
        return <Navigation className="w-4 h-4 text-purple-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'picked_up':
        return <Package className="w-4 h-4 text-indigo-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black tracking-tighter">Logistics & Tracking</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadLogisticsData}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by tracking number..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Logistics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Truck className="w-8 h-8" />
              <span className="text-2xl font-black">{trackingData.filter(t => t.status === 'in_transit').length}</span>
            </div>
            <p className="text-blue-100 text-sm">In Transit</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Navigation className="w-8 h-8" />
              <span className="text-2xl font-black">{trackingData.filter(t => t.status === 'out_for_delivery').length}</span>
            </div>
            <p className="text-purple-100 text-sm">Out for Delivery</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8" />
              <span className="text-2xl font-black">{trackingData.filter(t => t.status === 'delivered').length}</span>
            </div>
            <p className="text-green-100 text-sm">Delivered</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8" />
              <span className="text-2xl font-black">{trackingData.filter(t => t.status === 'processing').length}</span>
            </div>
            <p className="text-yellow-100 text-sm">Processing</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
            <p className="text-slate-600">Loading logistics data...</p>
          </div>
        ) : trackingData.length === 0 ? (
          <div className="text-center py-16">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">No shipments found</h4>
            <p className="text-slate-600">Shipment tracking data will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trackingData.map((shipment) => (
              <div key={shipment.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(shipment.status)}
                    <div>
                      <h4 className="font-bold text-slate-900">Order #{shipment.order_number}</h4>
                      <p className="text-slate-600 text-sm">{shipment.customer_name}</p>
                      <p className="text-slate-500 text-xs font-mono">{shipment.tracking_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(shipment.status)}`}>
                      {shipment.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-sm text-slate-600 mt-1">via {shipment.carrier}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Current Location</p>
                      <p className="text-sm font-medium text-slate-900">{shipment.current_location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Destination</p>
                      <p className="text-sm font-medium text-slate-900">{shipment.destination}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Est. Delivery</p>
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(shipment.estimated_delivery).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-1">
                      {shipment.tracking_history.slice(0, 4).map((_, index) => (
                        <div 
                          key={index}
                          className={`w-3 h-3 rounded-full border-2 border-white ${
                            index < shipment.tracking_history.length ? 'bg-green-500' : 'bg-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600">
                      {shipment.tracking_history.length} tracking updates
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(shipment)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    View Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tracking Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tracking Timeline</h3>
                <p className="text-slate-600">Order #{selectedOrder.order_number}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {selectedOrder.tracking_history.map((event: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.status === 'delivered' ? 'bg-green-100' :
                      event.status === 'in_transit' ? 'bg-blue-100' :
                      event.status === 'out_for_delivery' ? 'bg-purple-100' :
                      event.status === 'picked_up' ? 'bg-indigo-100' :
                      'bg-yellow-100'
                    }`}>
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 capitalize">
                          {event.status.replace('_', ' ')}
                        </h4>
                        <span className="text-sm text-slate-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-1">{event.description}</p>
                      <p className="text-slate-500 text-xs">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Tab Component
const SettingsTab: React.FC = () => {
  return (
    <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
      <h3 className="text-3xl font-black tracking-tighter mb-8">System Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Platform Configuration</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
                <input 
                  type="text" 
                  value="Amzify"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
                <input 
                  type="email" 
                  value="support@amzify.com"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Security Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Two-Factor Authentication</span>
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs">Enabled</button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Session Timeout</span>
                <span className="text-sm text-slate-500">30 minutes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Payment Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Payment Gateway</span>
                <span className="text-sm text-slate-500">Razorpay</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Commission Rate</span>
                <span className="text-sm text-slate-500">5%</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">System Status</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Database</span>
                <span className="text-sm text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">API Status</span>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">Last Backup</span>
                <span className="text-sm text-slate-500">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Feedback Tab Component
const FeedbackTab: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [allFeedback, setAllFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState({ new: 0, under_review: 0, responded: 0, avg_rating: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch all feedback on mount to get complete stats
  useEffect(() => {
    fetchAllFeedback();
    fetchFeedbackStats();
  }, []);

  const fetchAllFeedback = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/admin/feedback`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      
      const data = await response.json();
      setAllFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setAllFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/admin/feedback/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
    }
  };

  const handleRespond = async (feedbackId: string) => {
    if (!responseText.trim()) return;

    setIsResponding(true);
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/admin/feedback/${feedbackId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: responseText })
      });

      if (!response.ok) {
        throw new Error('Failed to send response');
      }

      setSelectedFeedback(null);
      setResponseText('');
      fetchAllFeedback(); // Refresh data
      fetchFeedbackStats(); // Refresh stats
      onRefresh();
    } catch (error) {
      console.error('Respond to feedback error:', error);
      alert('Failed to send response');
    } finally {
      setIsResponding(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://ecommerce-amzify-v1.onrender.com';
      const response = await fetch(`${API_BASE_URL}/api/admin/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchAllFeedback(); // Refresh data
      fetchFeedbackStats(); // Refresh stats
      onRefresh();
    } catch (error) {
      console.error('Update feedback status error:', error);
      alert('Failed to update status');
    }
  };

  // Filter out responded feedback from the display list
  const displayFeedback = allFeedback.filter(f => f.status !== 'responded');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complaint':
        return 'bg-red-100 text-red-800';
      case 'suggestion':
        return 'bg-purple-100 text-purple-800';
      case 'product':
        return 'bg-indigo-100 text-indigo-800';
      case 'service':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
        ★
      </span>
    ));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm p-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-black tracking-tighter">Customer Feedback</h3>
          <button 
            onClick={fetchAllFeedback}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all"
          >
            <RefreshCw className="w-4 h-4 inline mr-2" />
            Refresh
          </button>
        </div>

        {/* Feedback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-8 h-8" />
              <span className="text-2xl font-black">{stats.new}</span>
            </div>
            <p className="text-blue-100 text-sm">New Feedback</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8" />
              <span className="text-2xl font-black">{stats.under_review}</span>
            </div>
            <p className="text-yellow-100 text-sm">Under Review</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8" />
              <span className="text-2xl font-black">{stats.responded}</span>
            </div>
            <p className="text-green-100 text-sm">Responded</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8" />
              <span className="text-2xl font-black">{stats.avg_rating}</span>
            </div>
            <p className="text-purple-100 text-sm">Avg Rating</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-spin" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">Loading feedback...</h4>
          </div>
        ) : displayFeedback.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-900 mb-2">No pending feedback</h4>
            <p className="text-slate-600">All feedback has been responded to or there are no new submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayFeedback.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-slate-900">{item.customer_name}</h4>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">{item.customer_email}</p>
                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(item.rating)}
                        <span className="text-sm text-slate-600">({item.rating}/5)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      {item.status === 'new' && (
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'reviewed')}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-all"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      {(item.status === 'new' || item.status === 'reviewed') && (
                        <button
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-all"
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white rounded-t-2xl border-b border-slate-100 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Respond to Feedback</h3>
              <button 
                onClick={() => {
                  setSelectedFeedback(null);
                  setResponseText('');
                }}
                className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-bold text-slate-900">{selectedFeedback.customer_name}</h4>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(selectedFeedback.type)}`}>
                    {selectedFeedback.type}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderStars(selectedFeedback.rating)}
                  </div>
                </div>
                <p className="text-slate-700">{selectedFeedback.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Response:
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response to the customer..."
                  className="w-full p-4 border border-slate-300 rounded-xl resize-none h-32 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedFeedback(null);
                    setResponseText('');
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all"
                  disabled={isResponding}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespond(selectedFeedback.id)}
                  disabled={isResponding || !responseText.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResponding ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Chatbot for Admins */}
      <Chatbot userType="admin" />
    </div>
  );
};

export default App;