import React, { useState, useEffect } from 'react';
import { 
  Store, CheckCircle, XCircle, Clock, User, Building, Phone, Mail, 
  MapPin, CreditCard, FileText, AlertCircle, Search, Filter, ChevronDown
} from 'lucide-react';

interface SellerApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  business_type: string;
  business_description: string;
  business_address: string;
  city: string;
  state: string;
  postal_code: string;
  gst_number: string;
  pan_number: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

const SellerApplications: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<SellerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/seller-applications${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/seller-applications/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Are you sure you want to approve this seller application?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/seller-applications/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Application approved successfully! Seller account created.');
        fetchApplications();
        fetchStats();
        setSelectedApp(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve application');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this application?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/seller-applications/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        alert('Application rejected');
        fetchApplications();
        fetchStats();
        setSelectedApp(null);
        setRejectionReason('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject application');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    }
  };

  const filteredApplications = applications.filter(app => 
    app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Seller Applications</h1>
        <p className="text-slate-600">Review and manage seller registration requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Pending</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Approved</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Rejected</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.rejected}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Total</span>
            <Store className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.total}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company name, email, or applicant name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-3 rounded-xl font-bold text-sm capitalize transition-all ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Applications Found</h3>
            <p className="text-slate-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No seller applications match the selected filter'}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-black text-slate-900">{app.company_name}</h3>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      {app.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4" />
                      {app.first_name} {app.last_name}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      {app.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      {app.phone}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building className="w-4 h-4" />
                      {app.business_type}
                    </div>
                  </div>
                </div>
                {app.status === 'pending' && (
                  <button
                    onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all"
                  >
                    {selectedApp?.id === app.id ? 'Hide Details' : 'Review'}
                  </button>
                )}
              </div>

              {/* Application Details */}
              {selectedApp?.id === app.id && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {app.first_name} {app.last_name}</div>
                        <div><span className="font-medium">Email:</span> {app.email}</div>
                        <div><span className="font-medium">Phone:</span> {app.phone}</div>
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <Building className="w-5 h-5 text-indigo-600" />
                        Business Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Company:</span> {app.company_name}</div>
                        <div><span className="font-medium">Type:</span> {app.business_type}</div>
                        <div><span className="font-medium">GST:</span> {app.gst_number}</div>
                        <div><span className="font-medium">PAN:</span> {app.pan_number}</div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        Business Address
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>{app.business_address}</div>
                        <div>{app.city}, {app.state} {app.postal_code}</div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        Bank Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Bank:</span> {app.bank_name}</div>
                        <div><span className="font-medium">Account:</span> {app.account_number}</div>
                        <div><span className="font-medium">IFSC:</span> {app.ifsc_code}</div>
                        <div><span className="font-medium">Holder:</span> {app.account_holder_name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Business Description */}
                  {app.business_description && (
                    <div className="mb-6">
                      <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Business Description
                      </h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">{app.business_description}</p>
                    </div>
                  )}

                  {/* Rejection Reason Input (if rejecting) */}
                  <div className="mb-6">
                    <label className="block font-bold text-slate-900 mb-2">Rejection Reason (Optional)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a reason if rejecting this application..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Application
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Application
                    </button>
                  </div>
                </div>
              )}

              {/* Show rejection reason for rejected applications */}
              {app.status === 'rejected' && app.rejection_reason && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Rejection Reason
                    </h4>
                    <p className="text-sm text-red-800">{app.rejection_reason}</p>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-4 text-xs text-slate-400">
                Submitted {new Date(app.created_at).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerApplications;
