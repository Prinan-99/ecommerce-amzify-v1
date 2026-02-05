import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';

// Types
interface UserProfile {
  initial: string;
  name: string;
  tier: string;
  memberSince: string;
  rewardPoints: number;
  lifetimeSpent: number;
  nextTierTarget: number;
}

import { 
  User, 
  Lock, 
  CreditCard, 
  MapPin, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Edit3,
  Trash2,
  Download,
  MessageSquare,
  X
} from 'lucide-react';

interface SettingsPageProps {
  user: UserProfile;
  onBack?: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const settingsSections = [
    {
      id: 'account',
      title: 'Account Information',
      description: 'Manage your personal details and contact information',
      icon: User,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Password, two-factor authentication, and privacy settings',
      icon: Lock,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Manage your cards, wallets, and billing information',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'addresses',
      title: 'Addresses',
      description: 'Shipping and billing addresses',
      icon: MapPin,
      color: 'bg-red-50 text-red-600'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Email, SMS, and push notification preferences',
      icon: Bell,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'privacy',
      title: 'Data & Privacy',
      description: 'Control your data sharing and privacy preferences',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 'feedback',
      title: 'Share Feedback',
      description: 'Help us improve by sharing your experience and suggestions',
      icon: MessageSquare,
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  const quickActions = [
    {
      id: 'download-data',
      title: 'Download My Data',
      description: 'Get a copy of your account data',
      icon: Download,
      action: () => console.log('Download data')
    },
    {
      id: 'delete-account',
      title: 'Delete Account',
      description: 'Permanently delete your account and data',
      icon: Trash2,
      action: () => console.log('Delete account'),
      danger: true
    }
  ];

  return (
    <>
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="px-6 mb-12">
        <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mb-2 block">Account</span>
        <h2 className="text-4xl font-serif text-gray-900 leading-tight tracking-tight mb-6">Settings</h2>
        
        {/* User Quick Info */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-50 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#C5A059] rounded-2xl flex items-center justify-center text-white text-xl font-serif font-bold">
            {user.initial}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{user.tier} Member</span>
            </div>
          </div>
          <button className="p-3 bg-gray-50 hover:bg-[#C5A059] hover:text-white rounded-2xl transition-all group">
            <Edit3 size={18} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                if (section.id === 'feedback') {
                  setIsFeedbackOpen(true);
                } else {
                  setActiveSection(section.id);
                }
              }}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 text-left hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${section.color} group-hover:scale-110 transition-transform duration-500`}>
                  <section.icon size={24} strokeWidth={1.5} />
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-[#C5A059] group-hover:translate-x-1 transition-all" />
              </div>
              
              <h4 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#C5A059] transition-colors">
                {section.title}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {section.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-12">
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="space-y-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`w-full bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50 text-left hover:shadow-2xl transition-all duration-500 group flex items-center justify-between ${
                action.danger ? 'hover:border-red-200 hover:bg-red-50' : 'hover:border-[#C5A059]/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  action.danger ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
                } group-hover:scale-110 transition-transform duration-500`}>
                  <action.icon size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className={`font-bold mb-1 ${action.danger ? 'text-red-600' : 'text-gray-900'}`}>
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
              <ChevronRight size={16} className={`${
                action.danger ? 'text-red-300 group-hover:text-red-500' : 'text-gray-300 group-hover:text-[#C5A059]'
              } group-hover:translate-x-1 transition-all`} />
            </button>
          ))}
        </div>
      </div>

      {/* Support & Help */}
      <div className="px-6">
        <div className="bg-gradient-to-br from-[#1A1A1A] to-gray-800 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 gold-gradient opacity-10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
              <HelpCircle size={32} className="text-[#C5A059]" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4">Need Help?</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Our premium support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-[#C5A059] hover:text-white transition-all shadow-xl">
                Contact Support
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all border border-white/20">
                Help Center
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-12">
        <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-[2rem] p-6 font-bold transition-all border border-red-100 hover:border-red-200 flex items-center justify-center gap-3 group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>

      {/* Detail Modal */}
      {activeSection && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#C5A059] to-amber-600 text-white px-8 py-8 flex items-center justify-between rounded-t-[2.5rem]">
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {settingsSections.find(s => s.id === activeSection)?.title}
                </h3>
                <p className="text-amber-100 text-sm">
                  {settingsSections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              <button
                onClick={() => setActiveSection(null)}
                className="p-3 hover:bg-white/20 rounded-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Email Address</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <button className="w-full bg-[#C5A059] text-white py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all">
                    Save Changes
                  </button>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Current Password</label>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <input type="checkbox" className="rounded" />
                    <span className="font-medium text-gray-900">Enable Two-Factor Authentication</span>
                  </label>
                  <button className="w-full bg-[#C5A059] text-white py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all">
                    Update Security
                  </button>
                </div>
              )}

              {activeSection === 'payment' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-[#C5A059] text-white py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all">
                    Add Payment Method
                  </button>
                </div>
              )}

              {activeSection === 'addresses' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Street Address</label>
                    <input
                      type="text"
                      placeholder="Enter your street address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Postal Code</label>
                    <input
                      type="text"
                      placeholder="Postal code"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-[#C5A059] focus:outline-none transition-all"
                    />
                  </div>
                  <button className="w-full bg-[#C5A059] text-white py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all">
                    Save Address
                  </button>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">Email Notifications</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">SMS Notifications</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">Push Notifications</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">Marketing Emails</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <button className="w-full bg-[#C5A059] text-white py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all mt-4">
                    Save Preferences
                  </button>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">Share profile with sellers</span>
                    <input type="checkbox" className="rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">Allow personalized recommendations</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all">
                    <span className="font-medium text-gray-900">Share usage data for improvement</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </label>
                  <button className="w-full bg-[#C5A059] text-white py-3 rounded-2xl font-bold hover:bg-amber-700 transition-all mt-4">
                    Save Privacy Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    <FeedbackModal
      isOpen={isFeedbackOpen}
      onClose={() => setIsFeedbackOpen(false)}
      onSubmit={async (data) => {
        try {
          const API_BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:5009';
          const response = await fetch(`${API_BASE_URL}/api/auth/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              rating: data.rating,
              message: data.comment,
              type: 'general'
            })
          });

          if (response.ok) {
            console.log('Feedback submitted successfully');
            setIsFeedbackOpen(false);
          } else {
            console.error('Failed to submit feedback');
          }
        } catch (error) {
          console.error('Feedback submission error:', error);
        }
      }}
    />
    </>
  );
};

export default SettingsPage;