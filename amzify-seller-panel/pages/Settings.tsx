
import React, { useState } from 'react';
import { AdminApi } from '../services/api';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    commissionRate: 5.5,
    platformFee: 2.0,
    maintenanceMode: false,
    maxCampaignDuration: 30,
    allowGuestCheckout: true
  });

  const handleSave = async () => {
    try {
      await AdminApi.updateSettings(settings);
      alert("Settings saved to platform configuration.");
    } catch {
      alert("Error saving settings.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Configuration</h2>
        <p className="text-slate-500">Global settings for Nexus E-commerce</p>
      </div>

      <div className="space-y-6">
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Financial Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Standard Commission Rate (%)</label>
              <input 
                type="number" 
                value={settings.commissionRate}
                onChange={(e) => setSettings({...settings, commissionRate: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Flat Platform Fee ($)</label>
              <input 
                type="number" 
                value={settings.platformFee}
                onChange={(e) => setSettings({...settings, platformFee: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">System Controls</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Redirects all users to a maintenance page</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">Allow Guest Checkout</p>
                <p className="text-xs text-slate-500">Users can shop without an account</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, allowGuestCheckout: !settings.allowGuestCheckout})}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowGuestCheckout ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowGuestCheckout ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
