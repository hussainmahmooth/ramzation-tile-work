import React from 'react';
import { ProjectStatus, PaymentStatus } from '../../types';

interface ProjectBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ProjectStatusBadge: React.FC<ProjectBadgeProps> = ({ status, size = 'md' }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  switch (status) {
    case 'Draft':
      color = 'bg-slate-100 text-slate-700 border-slate-200';
      dot = 'bg-slate-400';
      break;
    case 'In Progress':
      color = 'bg-blue-50 text-blue-700 border-blue-200';
      dot = 'bg-blue-500 animate-pulse';
      break;
    case 'Payment Pending':
      color = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'Completed':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'Cancelled':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${color} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};

interface PaymentBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const PaymentStatusBadge: React.FC<PaymentBadgeProps> = ({ status, size = 'md' }) => {
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  switch (status) {
    case 'Unpaid':
      color = 'bg-rose-50 text-rose-700 border-rose-200';
      dot = 'bg-rose-500';
      break;
    case 'Partially Paid':
      color = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'Fully Paid':
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${color} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {status}
    </span>
  );
};
