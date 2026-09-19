import React from 'react';
import { formatCurrency } from '../../utils/calculations';

interface MoneyDisplayProps {
  amount: number;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'primary' | 'muted';
  className?: string;
}

export const MoneyDisplay: React.FC<MoneyDisplayProps> = ({
  amount = 0,
  prefix = 'Rs. ',
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold tracking-tight',
    xl: 'text-2xl font-black tracking-tight',
    '2xl': 'text-3xl font-black tracking-tight',
    '3xl': 'text-4xl sm:text-5xl font-black tracking-tight',
  };

  const variantClasses = {
    default: 'text-slate-900',
    primary: 'text-indigo-600',
    success: 'text-emerald-600',
    danger: 'text-rose-600',
    warning: 'text-amber-600',
    muted: 'text-slate-500',
  };

  return (
    <span className={`font-mono inline-flex items-baseline ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {formatCurrency(amount, prefix)}
    </span>
  );
};
