'use client';

import { clsx } from 'clsx';
import { AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: 'red' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Подтвердить',
  confirmColor = 'primary',
  loading,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-float w-full max-w-md mx-4 p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
              confirmColor === 'red' ? 'bg-rose-50' : 'bg-brand-50',
            )}
          >
            <AlertTriangle
              size={20}
              className={confirmColor === 'red' ? 'text-rose-500' : 'text-brand-500'}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              'px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors disabled:opacity-50',
              confirmColor === 'red'
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-brand-500 hover:bg-brand-600',
            )}
          >
            {loading ? 'Загрузка...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
