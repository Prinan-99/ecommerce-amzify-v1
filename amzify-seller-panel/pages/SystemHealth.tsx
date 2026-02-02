
import React, { useEffect, useState } from 'react';
import { AdminApi } from '../services/api';
import { SystemMetric } from '../types';

const HealthMetricCard: React.FC<{ metric: SystemMetric }> = ({ metric }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h3 className="font-black text-slate-900">{metric.service}</h3>
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
        metric.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-700' :
        metric.status === 'DEGRADED' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
      }`}>
        {metric.status}
      </span>
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500 font-medium">Latency</span>
        <span className={`font-bold ${metric.latency > 150 ? 'text-rose-600' : 'text-slate-900'}`}>{metric.latency}ms</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-500 ${metric.latency > 150 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{width: `${Math.min(100, (metric.latency / 300) * 100)}%`}}></div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500 font-medium">Error Rate</span>
        <span className="font-bold text-slate-900">{metric.errorRate}%</span>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase">CPU</p>
          <p className="text-lg font-black text-slate-900">{metric.cpu}%</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase">MEM</p>
          <p className="text-lg font-black text-slate-900">{metric.memory}%</p>
        </div>
      </div>
    </div>
  </div>
);

const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminApi.getSystemMetrics().then(data => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Establishing persistent connection to cloud services...</div>;

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">System Telemetry</h2>
          <p className="text-slate-500 font-medium">Real-time health status of distributed microservices</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-xl shadow-slate-200">
          Reboot Services
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map(m => <HealthMetricCard key={m.service} metric={m} />)}
      </div>

      <div className="bg-slate-900 p-8 rounded-2xl text-white">
        <h3 className="text-xl font-bold mb-6">Service Dependency Graph</h3>
        <div className="h-[200px] flex items-center justify-center border border-slate-800 rounded-xl bg-slate-800/50">
           <p className="text-slate-500 font-mono text-sm animate-pulse">Rendering distributed tracing data...</p>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
