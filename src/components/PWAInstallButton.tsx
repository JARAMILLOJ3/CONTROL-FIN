import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallGuideModal } from './InstallGuideModal';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'card' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running in standalone mode (iOS Home Screen or PWA installed)
  if (isInstalled) {
    if (variant === 'badge' || variant === 'card') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>App instalada en modo independiente</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = () => {
    if (isInstallable && !isIOS) {
      install();
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'card') {
    return (
      <>
        <div className="p-4 border border-neutral-200 rounded-lg flex flex-col justify-between bg-gradient-to-br from-white to-neutral-50/60">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">
                Instalar en Pantalla de Inicio (iPhone)
              </h4>
            </div>
            <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
              Agrega la app a la pantalla de tu iPhone o móvil para usarla a pantalla completa como una app normal sin barras de Safari.
            </p>
          </div>
          <button
            onClick={handleClick}
            className="w-full py-2 px-3 text-xs font-semibold rounded-md bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Ver instrucciones de instalación</span>
          </button>
        </div>

        <InstallGuideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200 cursor-pointer shrink-0"
        title="Instalar en tu iPhone o pantalla de inicio"
      >
        <Smartphone className="w-3.5 h-3.5 text-neutral-700" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">App</span>
      </button>

      <InstallGuideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
