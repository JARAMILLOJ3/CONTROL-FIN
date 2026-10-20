import React, { useState } from 'react';
import {
  LayoutDashboard,
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
  LogOut,
  LogIn,
  Menu,
  X,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  PiggyBank,
  Receipt,
  RefreshCw
} from 'lucide-react';
import { useFinance, ActiveTabType } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { InstallGuideModal } from './InstallGuideModal';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SidebarProps {
  onOpenQuickAdd: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenQuickAdd }) => {
  const { 
    activeTab, 
    setActiveTab, 
    currentProfile, 
    movements, 
    investors, 
    buyerSales, 
    debtors, 
    myInvestments,
    savings,
    debts,
    cloudSyncStatus,
    syncToCloudNow,
    summary 
  } = useFinance();
  const { user, signInWithGoogle, logout } = useAuth();
  const { isInstalled, isIOS, isInstallable, install } = usePWAInstall();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Cerrar menú móvil con Escape y bloquear scroll del body mientras el menú está abierto
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navGroups = [
    {
      groupTitle: 'PANEL PRINCIPAL',
      items: [
        {
          id: 'resumen' as ActiveTabType,
          label: 'Dashboard Resumen',
          icon: LayoutDashboard,
          badge: null,
          color: 'text-emerald-400'
        },
        {
          id: 'personales' as ActiveTabType,
          label: 'Finanzas Personales',
          icon: Wallet,
          badge: movements.length > 0 ? movements.length : null,
          color: 'text-sky-400'
        },
        {
          id: 'ahorros' as ActiveTabType,
          label: 'Metas de Ahorro',
          icon: PiggyBank,
          badge: savings.length > 0 ? savings.length : null,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          color: 'text-emerald-400'
        },
        {
          id: 'deudas' as ActiveTabType,
          label: 'Mis Deudas',
          icon: Receipt,
          badge: debts.filter(d => d.estado !== 'Saldada').length > 0 ? debts.filter(d => d.estado !== 'Saldada').length : null,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          color: 'text-rose-400'
        }
      ]
    },
    {
      groupTitle: 'GESTIÓN & OPERACIONES',
      items: [
        {
          id: 'inversionistas' as ActiveTabType,
          label: 'Inversionistas',
          icon: Users,
          badge: investors.length > 0 ? investors.length : null,
          color: 'text-indigo-400'
        },
        {
          id: 'compradores' as ActiveTabType,
          label: 'Compradores & Ventas',
          icon: ShoppingBag,
          badge: buyerSales.length > 0 ? buyerSales.length : null,
          color: 'text-teal-400'
        },
        {
          id: 'deudores' as ActiveTabType,
          label: 'Deudores / Cobros',
          icon: HandCoins,
          badge: summary.porCobrarDeudores > 0 ? 'Cobro' : debtors.length > 0 ? debtors.length : null,
          badgeColor: summary.porCobrarDeudores > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : undefined,
          color: 'text-amber-400'
        },
        {
          id: 'mis_inversiones' as ActiveTabType,
          label: 'Mis Inversiones',
          icon: TrendingUp,
          badge: myInvestments.length > 0 ? myInvestments.length : null,
          color: 'text-violet-400'
        }
      ]
    },
    {
      groupTitle: 'TESORERÍA & AJUSTES',
      items: [
        {
          id: 'cuentas' as ActiveTabType,
          label: 'Dinero Disponible',
          icon: CreditCard,
          badge: null,
          color: 'text-cyan-400'
        },
        {
          id: 'listas' as ActiveTabType,
          label: 'Listas & Configuración',
          icon: Settings,
          badge: null,
          color: 'text-slate-400'
        }
      ]
    }
  ];

  const handleSelectTab = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleInstallClick = () => {
    if (isInstallable && !isIOS) {
      install();
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Nav item renderer
  const renderNavItem = (item: any) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleSelectTab(item.id)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer relative ${
          isActive
            ? 'bg-slate-800/90 text-white shadow-sm border border-slate-700/80'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
        }`}
        title={isCollapsed ? item.label : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isActive ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <span className="truncate tracking-normal text-[12.5px] font-medium">
              {item.label}
            </span>
          )}
        </div>

        {!isCollapsed && item.badge && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tabular-nums shrink-0 ${
              item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            {item.badge}
          </span>
        )}

        {/* Active glowing indicator pill on the left edge */}
        {isActive && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        )}
      </button>
    );
  };

  return (
    <>
      {/* 1. Mobile Top Navigation Header (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 safe-top-padding text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-xs">$</span>
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                Control Financiero
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5">
                {currentProfile.nombre}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Instalar en iPhone / Móvil"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenQuickAdd}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>
        </div>
      </header>

      {/* 2. Desktop Sidebar (>= 1024px) */}
      <aside
        className={`hidden lg:flex flex-col bg-slate-950 border-r border-slate-800/90 text-white shrink-0 sticky top-0 h-screen transition-all duration-200 z-20 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Brand Section */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-slate-900 border border-emerald-400/30 flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-black text-sm">$</span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-sm text-white tracking-tight block truncate">
                  Control Financiero
                </span>
                <span className="text-[10.5px] text-emerald-400 font-medium block truncate">
                  Suite de Gestión Integral
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title={isCollapsed ? 'Expandir panel' : 'Colapsar panel'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary "+ Nuevo Registro" Action */}
        <div className="p-3">
          <button
            onClick={onOpenQuickAdd}
            className={`w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Nuevo Registro Rápido (Ingreso, Gasto, Venta, Inversor, Deudor)"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Nuevo Registro</span>}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none">
                  {group.groupTitle}
                </div>
              )}
              {group.items.map((item) => renderNavItem(item))}
            </div>
          ))}
        </div>

        {/* Bottom User Profile & Status Section */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/60">
          {/* Active Profile Switcher */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className={`w-full flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-colors text-left cursor-pointer ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
            title={`Perfil: ${currentProfile.nombre} (clic para cambiar)`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: currentProfile.color || '#059669' }}
              >
                {currentProfile.nombre.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-200 block truncate">
                    {currentProfile.nombre}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Perfil Activo
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {/* Cloud Auth / Sync Status */}
          {!isCollapsed && (
            <div className="relative">
              {user ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0 text-emerald-300">
                      <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-medium truncate" title={user.email || ''}>
                        {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={() => logout()}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                      title="Cerrar sesión en nube"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-1 text-[10.5px]">
                    {cloudSyncStatus === 'syncing' ? (
                      <span className="text-amber-400 flex items-center gap-1 font-medium">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-400" />
                        <span>Sincronizando...</span>
                      </span>
                    ) : cloudSyncStatus === 'offline' ? (
                      <span className="text-rose-400 flex items-center gap-1 font-medium">
                        <span>Sin conexión / Local</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Nube al día</span>
                      </span>
                    )}

                    <button
                      onClick={() => syncToCloudNow()}
                      className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 transition-colors font-medium hover:underline"
                      title="Guardar en nube ahora"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Sincronizar</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <LogIn className="w-3 h-3 text-emerald-400" />
                  <span>Conectar Nube</span>
                </button>
              )}
            </div>
          )}

          {/* PWA Install Button on Desktop / iOS */}
          {!isCollapsed && !isInstalled && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-400 hover:text-emerald-300 transition-colors"
            >
              <Smartphone className="w-3 h-3" />
              <span>Instalar en iPhone / Móvil</span>
            </button>
          )}

          {!isCollapsed && isInstalled && (
            <div className="flex items-center justify-center gap-1 py-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Modo App Independiente</span>
            </div>
          )}
        </div>
      </aside>

      {/* 3. Mobile Slide-Over Drawer (< 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-slate-950 text-white h-full flex flex-col shadow-2xl border-r border-slate-800/80 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between safe-top-padding">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-xs">
                  <span className="text-white font-black text-xs">$</span>
                </div>
                <div>
                  <span className="font-bold text-sm text-white block">Control Financiero</span>
                  <span className="text-[10px] text-emerald-400 block">Menú Principal</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action */}
            <div className="p-3">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  onOpenQuickAdd();
                }}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Registro</span>
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 no-scrollbar">
              {navGroups.map((group) => (
                <div key={group.groupTitle} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                    {group.groupTitle}
                  </div>
                  {group.items.map((item) => renderNavItem(item))}
                </div>
              ))}
            </div>

            {/* Mobile Footer in Drawer */}
            <div className="p-4 border-t border-slate-800 safe-bottom-padding space-y-3 bg-slate-950">
              <div
                onClick={() => {
                  setIsMobileOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: currentProfile.color || '#059669' }}
                  >
                    {currentProfile.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">
                    {currentProfile.nombre}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400">Cambiar</span>
              </div>

              {user ? (
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="truncate max-w-[170px] text-[11px]">{user.email}</span>
                  <button
                    onClick={() => logout()}
                    className="text-rose-400 hover:underline text-[11px]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 border border-slate-800"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conectar Nube con Google</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Mobile Bottom Touch Bar for Quick Thumbs Navigation (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 safe-bottom-padding flex items-center justify-around text-slate-400">
        <button
          onClick={() => setActiveTab('resumen')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10.5px] font-medium transition-colors ${
            activeTab === 'resumen' ? 'text-emerald-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Resumen</span>
        </button>

        <button
          onClick={() => setActiveTab('personales')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10.5px] font-medium transition-colors ${
            activeTab === 'personales' ? 'text-sky-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Personales</span>
        </button>

        {/* Center Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="flex flex-col items-center justify-center w-10 h-10 -mt-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-950/60 transition-transform active:scale-95"
          aria-label="Nuevo registro"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('cuentas')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10.5px] font-medium transition-colors ${
            activeTab === 'cuentas' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cuentas</span>
        </button>

        <button
          onClick={() => setIsMobileOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10.5px] font-medium transition-colors ${
            activeTab !== 'resumen' && activeTab !== 'personales' && activeTab !== 'cuentas'
              ? 'text-emerald-400 font-semibold'
              : 'hover:text-slate-200'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Más</span>
        </button>
      </nav>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </>
  );
};
