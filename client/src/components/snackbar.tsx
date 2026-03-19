'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useNotificationStore } from '@/stores/notification';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  error: 'bg-rose-50 text-rose-800 border-rose-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  info: 'bg-brand-50 text-brand-800 border-brand-200',
};

export function Snackbar() {
  const { show, text, type, hide } = useNotificationStore();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(hide, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, hide]);

  if (!show) return null;

  const Icon = icons[type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={clsx(
          'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-float min-w-[300px] text-sm font-medium',
          styles[type],
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="flex-1">{text}</span>
        <button onClick={hide} className="hover:opacity-60 shrink-0 transition-opacity">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
