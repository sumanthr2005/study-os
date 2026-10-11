import React from 'react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-800/80 bg-[#0c1220]/80 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-slate-700/80 light:bg-white light:border-slate-200 light:shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ElementType;
  title?: string;
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/20 focus:ring-indigo-500',
    secondary:
      'bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-700/60 light:bg-slate-100 light:text-slate-800 light:hover:bg-slate-200 focus:ring-slate-500',
    outline:
      'border border-slate-700/80 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-300 hover:text-white light:text-slate-700 light:hover:bg-slate-100 focus:ring-indigo-500',
    danger:
      'bg-rose-600/90 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-400/20 focus:ring-rose-500',
    ghost:
      'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 light:text-slate-600 light:hover:bg-slate-100',
    success:
      'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 border border-emerald-400/20 focus:ring-emerald-500',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
}) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700 light:bg-slate-100 light:text-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Progress({
  value,
  max = 100,
  className = '',
  barClassName = '',
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`h-2 w-full rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/40 light:bg-slate-200 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 ${barClassName}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-slate-700/80 bg-[#0c1220] p-6 shadow-2xl text-slate-100 light:bg-white light:text-slate-900 light:border-slate-200`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 light:border-slate-200 mb-4">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
