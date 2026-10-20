import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-lg animate-in slide-in-from-bottom duration-200">
      <WifiOff className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
      <span>Modo sin conexión — Tus datos locales siguen disponibles</span>
    </div>
  );
};
