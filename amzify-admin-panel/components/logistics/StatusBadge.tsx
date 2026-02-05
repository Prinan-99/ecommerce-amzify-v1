import React from 'react';
import { ShipmentStatus } from '../../types';

interface StatusBadgeProps {
  status: ShipmentStatus;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
}

const statusConfig: Record<ShipmentStatus, { color: string; bgColor: string; icon: string; label: string; borderColor?: string }> = {
  [ShipmentStatus.PICKUP_PENDING]: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    icon: '📦',
    label: 'Pickup Pending'
  },
  [ShipmentStatus.IN_TRANSIT]: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
    icon: '🚚',
    label: 'In Transit'
  },
  [ShipmentStatus.OUT_FOR_DELIVERY]: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-100',
    icon: '📍',
    label: 'Out for Delivery'
  },
  [ShipmentStatus.DELIVERED]: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-100',
    icon: '✓',
    label: 'Delivered'
  },
  [ShipmentStatus.RETURNED]: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
    icon: '↩️',
    label: 'Returned'
  },
  [ShipmentStatus.EXCEPTION]: {
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    icon: '⚠️',
    label: 'Exception'
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md', 
  variant = 'solid' 
}) => {
  const config = statusConfig[status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  if (variant === 'outline') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold border rounded-full ${sizeClasses[size]} ${config.color} border-current`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 font-bold border rounded-full ${sizeClasses[size]} ${config.color} ${config.bgColor} border-current border-opacity-20`}>
      <span>{config.icon}</span>
      <span className="font-black uppercase tracking-widest text-[10px]">{config.label}</span>
    </span>
  );
};

export default StatusBadge;
