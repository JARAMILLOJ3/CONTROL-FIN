import React, { useState } from 'react';
import { 
  BarChart3, 
  Wallet, 
  Users, 
  ShoppingBag, 
  HandCoins,
  TrendingUp, 
  CreditCard, 
  Settings, 
  Plus,
  ChevronDown,
  Cloud,
  CloudCheck,
  LogIn,
  LogOut
} from 'lucide-react';
import { useFinance, ActiveTabType } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd }) => {
  const { activeTab, setActiveTab, currentProfile, cloudSyncStatus } = useFinance();
  const { user, signInWithGoogle, logout } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems: { id: ActiveTabType; label: string; icon: React.ElementType }[] = [
    { id: 'resumen', label: 'Resumen', icon: BarChart3 },
    { id: 'personales', label: 'Finanzas Personales', icon: Wallet },
    { id: 'inversionistas', label: 'Inversionistas', icon: Users },
    { id: 'compradores', label: 'Compradores', icon: ShoppingBag },
    { id: 'deudores', label: 'Deudores / Cobros', icon: HandCoins },
    { id: 'mis_inversiones', label: 'Mis Inversiones', icon: TrendingUp },
    { id: 'cuentas', label: 'Dinero Disponible', icon: CreditCard },
    { id: 'listas', label: 'Listas y Config', icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 safe-top-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-2 shrink-0">
              <span 
                onClick={() => setActiveTab('resumen')}
                className="text-lg font-bold tracking-tight text-neutral-900 cursor-pointer whitespace-nowrap select-none hover:text-neutral-700 transition-colors"
              >
                Control Financiero
              </span>
            </div>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Cloud Auth, PWA Install, Profile Switcher & Primary Action */}
            <div className="flex items-center gap-2 shrink-0">
              {/* PWA Install Button */}
              <PWAInstallButton variant="navbar" />

              {/* Cloud Login / User Indicator */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-700 bg-emerald-50/60 border border-emerald-200/80 rounded-lg hover:bg-emerald-100/60 transition-colors"
                    title={user.email || 'Conectado a la nube'}
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded-full object-cover shrink-0" 
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-bold">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="max-w-[70px] sm:max-w-[100px] truncate text-[11px] font-semibold text-emerald-900">
                      {user.displayName?.split(' ')[0] || 'Mi Nube'}
                    </span>
                    <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 p-2 z-50 text-xs animate-in fade-in">
                      <div className="px-2 py-1.5 border-b border-neutral-100 mb-1">
                        <span className="font-semibold text-neutral-900 block truncate">{user.displayName || 'Usuario'}</span>
                        <span className="text-[11px] text-neutral-500 block truncate">{user.email}</span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-1">
                          <Cloud className="w-3 h-3 text-emerald-600" />
                          <span>Sincronización en la nube activa</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-neutral-700 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar sesión en la nube</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-lg transition-colors"
                  title="Inicia sesión con Google para guardar tus finanzas en la nube gratis"
                >
                  <LogIn className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Acceder</span>
                </button>
              )}

              {/* Profile button */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors border border-neutral-200 cursor-pointer"
                title={`Perfil activo: ${currentProfile.nombre} (clic para cambiar o gestionar)`}
              >
                <div 
                  className="w-4 h-4 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
                  style={{ backgroundColor: currentProfile.color || '#0F172A' }}
                >
                  {currentProfile.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[70px] truncate">{currentProfile.nombre}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {/* Primary Action Button */}
              <button
                onClick={onOpenQuickAdd}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nuevo Registro</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </div>
          </div>

          {/* Subnav for tablets / mobile */}
          <div className="flex lg:hidden items-center gap-1 overflow-x-auto py-2 border-t border-neutral-100 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 bg-neutral-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
