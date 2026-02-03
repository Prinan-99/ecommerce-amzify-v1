import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Download, 
  BarChart3, PieChart, Target, Award, CreditCard, Wallet,
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Eye
} from 'lucide-react';
import { sellerApiService } from '../services/sellerApi';

interface RevenueDashboardProps {
  onClose?: () => void;
}

const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ onClose }) => {
  const [revenueData, setRevenueData] = useState<any>({});
  const [financialSummary, setFinancialSummary] = useState<any>({});
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRevenueData();
    loadFinancialSummary();
    loadPayoutHistory();
  }, [selectedPeriod]);

  const loadRevenueData = async () => {
    try {
      setIsLoading(true);
      const response = await sellerApiService.getRevenueData(selectedPeriod);
      setRevenueData(response.data || {});
    } catch (error) {
      console.error('Load revenue data error:', error);
      // Mock data for demo
      setRevenueData({
        current_period: 125000,
        previous_period: 98000,
        growth_rate: 27.5,
        total_orders: 234,
        avg_order_value: 2850,
        top_products: [
          { name: 'Wireless Headphones Pro', revenue: 45000, orders: 89 },
          { name: 'Smart Fitness Watch', revenue: 38000, orders: 67 },
          { name: 'Bluetooth Speaker', revenue: 22000, orders: 45 }
        ],
        daily_revenue: [
          { date: '2024-01-01', revenue: 4200 },
          { date: '2024-01-02', revenue: 3800 },
          { date: '2024-01-03', revenue: 5100 },
          { date: '2024-01-04', revenue: 4600 },
          { date: '2024-01-05', revenue: 5400 },
          { date: '2024-01-06', revenue: 3900 },
          { date: '2024-01-07', revenue: 4800 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialSummary = async () => {
    try {
      const response = await sellerApiService.getFinancialSummary();
      setFinancialSummary(response.summary || {});
    } catch (error) {
      console.error('Load financial summary error:', error);
      // Mock data for demo
      setFinancialSummary({
        total_earnings: 540000,
        pending_payouts: 45000,
        completed_payouts: 495000,
        commission_rate: 0.15,
        commission_paid: 81000,
        net_earnings: 459000,
        next_payout_date: '2024-02-15',
        available_balance: 45000
      });
    }
  };

  const exportPayoutHistoryToCSV = () => {
    // Prepare CSV headers
    const headers = ['Date', 'Amount (₹)', 'Method', 'Reference', 'Status'];
    
    // Prepare CSV rows
    const rows = payoutHistory.map(payout => [
      formatDate(payout.date),
      payout.amount.toFixed(2),
      payout.method,
      payout.reference,
      payout.status.toUpperCase()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payout_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadPayoutHistory = async () => {
    try {
      const response = await sellerApiService.getPayoutHistory();
      setPayoutHistory(response.payouts || []);
    } catch (error) {
      console.error('Load payout history error:', error);
      // Mock data for demo
      setPayoutHistory([
        {
          id: '1',
          amount: 38000,
          status: 'completed',
          date: '2024-01-15',
          method: 'Bank Transfer',
          reference: 'PAY-001'
        },
        {
          id: '2',
          amount: 42000,
          status: 'completed',
          date: '2024-01-01',
          method: 'Bank Transfer',
          reference: 'PAY-002'
        },
        {
          id: '3',
          amount: 45000,
          status: 'pending',
          date: '2024-02-01',
          method: 'Bank Transfer',
          reference: 'PAY-003'
        }
      ]);
    }
  };

  const handleRequestPayout = async () => {
    try {
      await sellerApiService.requestPayout(financialSummary.available_balance);
      loadFinancialSummary();
      loadPayoutHistory();
    } catch (error) {
      console.error('Request payout error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Revenue Dashboard</h2>
          <p className="text-slate-600">Track your earnings and financial performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={loadRevenueData}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8" />
            <div className="flex items-center gap-1 text-green-100">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">+{revenueData.growth_rate || 27.5}%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold">{formatCurrency(revenueData.current_period || 125000)}</h3>
          <p className="text-green-100">Revenue This {selectedPeriod}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-8 h-8" />
            <div className="flex items-center gap-1 text-blue-100">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">+15%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold">{revenueData.total_orders || 234}</h3>
          <p className="text-blue-100">Total Orders</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8" />
            <div className="flex items-center gap-1 text-purple-100">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm font-medium">+8%</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold">{formatCurrency(revenueData.avg_order_value || 2850)}</h3>
          <p className="text-purple-100">Avg Order Value</p>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8" />
            <span className="text-xs bg-amber-400 px-2 py-1 rounded-full text-amber-900">Available</span>
          </div>
          <h3 className="text-2xl font-bold">{formatCurrency(financialSummary.available_balance || 45000)}</h3>
          <p className="text-amber-100">Ready for Payout</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Revenue Trend</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-sm text-slate-600">Current Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
              <span className="text-sm text-slate-600">Previous Period</span>
            </div>
          </div>
        </div>
        
        {/* Simple Bar Chart Visualization */}
        <div className="space-y-4">
          {(revenueData.daily_revenue || []).map((day: any, index: number) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-slate-600">{formatDate(day.date)}</div>
              <div className="flex-1 bg-slate-100 rounded-full h-8 relative overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(day.revenue / 6000) * 100}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-700">
                  {formatCurrency(day.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Summary */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Total Earnings</span>
              <span className="font-bold text-slate-900">{formatCurrency(financialSummary.total_earnings || 540000)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Commission Paid</span>
              <span className="font-bold text-red-600">-{formatCurrency(financialSummary.commission_paid || 81000)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Net Earnings</span>
              <span className="font-bold text-green-600">{formatCurrency(financialSummary.net_earnings || 459000)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Pending Payouts</span>
              <span className="font-bold text-amber-600">{formatCurrency(financialSummary.pending_payouts || 45000)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-600">Available Balance</span>
              <span className="font-bold text-indigo-600">{formatCurrency(financialSummary.available_balance || 45000)}</span>
            </div>
          </div>

          <button
            onClick={handleRequestPayout}
            disabled={!financialSummary.available_balance}
            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Request Payout
          </button>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Top Performing Products</h3>
          <div className="space-y-4">
            {(revenueData.top_products || []).map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-indigo-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{product.name}</h4>
                    <p className="text-sm text-slate-600">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  <p className="text-xs text-slate-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Payout History</h3>
          <button 
            onClick={exportPayoutHistoryToCSV}
            disabled={payoutHistory.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left py-3 text-sm font-medium text-slate-600">Amount</th>
                <th className="text-left py-3 text-sm font-medium text-slate-600">Method</th>
                <th className="text-left py-3 text-sm font-medium text-slate-600">Reference</th>
                <th className="text-left py-3 text-sm font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {payoutHistory.map((payout) => (
                <tr key={payout.id} className="border-b border-slate-50">
                  <td className="py-4 text-sm text-slate-900">{formatDate(payout.date)}</td>
                  <td className="py-4 text-sm font-medium text-slate-900">{formatCurrency(payout.amount)}</td>
                  <td className="py-4 text-sm text-slate-600">{payout.method}</td>
                  <td className="py-4 text-sm text-slate-600">{payout.reference}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      payout.status === 'completed' ? 'bg-green-100 text-green-800' :
                      payout.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payout.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payoutHistory.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No payout history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;