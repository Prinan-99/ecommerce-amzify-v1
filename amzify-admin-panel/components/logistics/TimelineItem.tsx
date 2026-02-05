import React from 'react';
import { ShipmentUpdate } from '../../types';

interface TimelineItemProps {
  update: ShipmentUpdate;
  isLatest?: boolean;
}

const getTypeColor = (type: 'INFO' | 'WARNING' | 'SUCCESS') => {
  switch (type) {
    case 'SUCCESS':
      return { dot: 'bg-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50' };
    case 'WARNING':
      return { dot: 'bg-rose-500', border: 'border-rose-200', bg: 'bg-rose-50' };
    case 'INFO':
    default:
      return { dot: 'bg-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' };
  }
};

const getRoleColor = (role: 'SELLER' | 'DELIVERY_PARTNER' | 'SYSTEM') => {
  switch (role) {
    case 'SELLER':
      return 'text-purple-600 bg-purple-100';
    case 'DELIVERY_PARTNER':
      return 'text-blue-600 bg-blue-100';
    case 'SYSTEM':
      return 'text-slate-600 bg-slate-100';
  }
};

const TimelineItem: React.FC<TimelineItemProps> = ({ update, isLatest = false }) => {
  const typeColor = getTypeColor(update.type);
  const roleColor = getRoleColor(update.authorRole);
  const timestamp = new Date(update.timestamp);

  return (
    <div className={`relative pl-8 pb-6 ${!isLatest ? 'border-l-2' : ''} ${typeColor.border}`}>
      {/* Timeline dot */}
      <div className={`absolute -left-3 top-0 w-4 h-4 rounded-full border-2 border-white shadow-md ${typeColor.dot}`}></div>

      {/* Timeline content card */}
      <div className={`p-4 rounded-xl border ${typeColor.border} ${typeColor.bg}`}>
        {/* Header with role and time */}
        <div className="flex justify-between items-start mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${roleColor}`}>
            {update.authorRole === 'DELIVERY_PARTNER' ? '🚚' : update.authorRole === 'SELLER' ? '🏪' : '⚙️'}
            {update.authorRole.replace('_', ' ')}
          </span>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-600">
              {timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs font-black text-slate-500">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{update.message}"</p>

        {/* Author info */}
        <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">by {update.author}</p>
      </div>
    </div>
  );
};

export default TimelineItem;
