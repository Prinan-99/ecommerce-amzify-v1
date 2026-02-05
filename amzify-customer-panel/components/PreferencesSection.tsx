import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { Settings, Bell, Mail, Smartphone, ShoppingBag, Heart, Tag } from 'lucide-react';

interface PreferencesSectionProps {
  preferences: UserPreferences;
  onUpdate?: (preferences: UserPreferences) => void;
}

const PreferencesSection: React.FC<PreferencesSectionProps> = ({ preferences, onUpdate }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [isEditing, setIsEditing] = useState(false);

  const handleNotificationToggle = (key: keyof typeof preferences.notifications) => {
    const updated = {
      ...localPrefs,
      notifications: {
        ...localPrefs.notifications,
        [key]: !localPrefs.notifications[key]
      }
    };
    setLocalPrefs(updated);
    onUpdate?.(updated);
  };

  const handleSave = () => {
    onUpdate?.(localPrefs);
    setIsEditing(false);
  };

  return (
    <section className="px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-2 block">Personalization</span>
          <h3 className="text-3xl font-serif text-gray-900 leading-tight">Your Preferences</h3>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C5A059] transition-all shadow-xl"
        >
          <Settings size={14} />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shopping Preferences */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#C5A059]/10 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-[#C5A059]" />
            </div>
            <h4 className="text-xl font-serif font-bold text-gray-900">Shopping Preferences</h4>
          </div>

          <div className="space-y-6">
            {/* Favorite Categories */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-3 block">Favorite Categories</label>
              <div className="flex flex-wrap gap-2">
                {localPrefs.categories.map((category) => (
                  <span 
                    key={category}
                    className="px-4 py-2 bg-[#C5A059]/10 text-[#C5A059] rounded-full text-xs font-bold border border-[#C5A059]/20"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-3 block">Price Range</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 mb-1 block">Min</span>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold">
                    ₹{localPrefs.priceRange.min.toLocaleString()}
                  </div>
                </div>
                <div className="w-4 h-0.5 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-xs text-gray-500 mb-1 block">Max</span>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold">
                    ₹{localPrefs.priceRange.max.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Brands */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-3 block">Favorite Brands</label>
              <div className="flex flex-wrap gap-2">
                {localPrefs.brands.map((brand) => (
                  <span 
                    key={brand}
                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-xs font-bold border border-gray-100 flex items-center gap-2"
                  >
                    <Heart size={10} className="text-red-400" />
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Bell size={20} className="text-blue-600" />
            </div>
            <h4 className="text-xl font-serif font-bold text-gray-900">Notifications</h4>
          </div>

          <div className="space-y-4">
            {[
              { key: 'email' as const, label: 'Email Notifications', icon: Mail, desc: 'Order updates and exclusive offers' },
              { key: 'sms' as const, label: 'SMS Alerts', icon: Smartphone, desc: 'Delivery updates and urgent notices' },
              { key: 'push' as const, label: 'Push Notifications', icon: Bell, desc: 'App notifications and reminders' },
              { key: 'marketing' as const, label: 'Marketing Communications', icon: Tag, desc: 'Promotional content and deals' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <item.icon size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationToggle(item.key)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                    localPrefs.notifications[item.key] 
                      ? 'bg-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.3)]' 
                      : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 absolute top-0.5 ${
                    localPrefs.notifications[item.key] ? 'left-6' : 'left-0.5'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreferencesSection;