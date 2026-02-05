import React from 'react';
import { UserProfile } from '../types';
import { Edit3, MapPin, Mail, Phone, Calendar, Crown } from 'lucide-react';

interface ProfileHeaderProps {
  user: UserProfile;
  onEdit?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEdit }) => {
  return (
    <div className="relative">
      {/* Hero Background */}
      <div className="h-48 gold-gradient rounded-[3rem] relative overflow-hidden mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -ml-20 -mb-20"></div>
        
        {/* Edit Button */}
        <button 
          onClick={onEdit}
          className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-2xl transition-all border border-white/20 group"
        >
          <Edit3 size={18} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Profile Avatar & Info */}
      <div className="relative -mt-20 px-8">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border-4 border-white/50 backdrop-blur-md">
              <span className="text-4xl font-serif font-bold text-gray-900">{user.initial}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 gold-gradient rounded-2xl flex items-center justify-center shadow-xl">
              <Crown size={20} className="text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-white/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{user.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Member since {user.memberSince}</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{user.address?.city}, {user.address?.country}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Mail size={12} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Phone size={12} />
                    <span>{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.loyaltyStats?.totalOrders}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C5A059]">₹{user.loyaltyStats?.totalSaved.toLocaleString()}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.loyaltyStats?.membershipDays}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;