import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none">
      <div className="bg-neutral-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-full shadow-xl border border-neutral-700/60 flex items-center gap-2 text-xs font-semibold max-w-md text-center">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
