import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { SummaryView } from './components/SummaryView';
import { PersonalFinanceView } from './components/PersonalFinanceView';
import { SavingsView } from './components/SavingsView';
import { DebtsView } from './components/DebtsView';
import { InvestorsView } from './components/InvestorsView';
import { BuyersView } from './components/BuyersView';
import { DebtorsView } from './components/DebtorsView';
import { MyInvestmentsView } from './components/MyInvestmentsView';
import { AccountsView } from './components/AccountsView';
import { ListsSettingsView } from './components/ListsSettingsView';
import { QuickAddModal } from './components/QuickAddModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Cloud, HardDrive, LogIn } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, currentProfile } = useFinance();
  const { user, signInWithGoogle } = useAuth();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col lg:flex-row bg-slate-100/60 text-slate-900">
      {/* Modern Sidebar Navigation */}
      <Sidebar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden pb-20 lg:pb-0">
        {/* Cloud Alert Banner if not logged in */}
        {!user && (
          <div className="bg-slate-900 text-white px-4 py-2.5 text-xs border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  ¿Deseas acceder desde tu celular o sincronizar con otras personas? Inicia sesión con Google para guardar tus datos en la nube.
                </span>
              </div>
              <button
                onClick={() => signInWithGoogle()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors shrink-0 shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Conectar Nube</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-w-0 overflow-x-hidden">
          {activeTab === 'resumen' && (
            <SummaryView onOpenQuickAdd={() => setIsQuickAddOpen(true)} />
          )}
          {activeTab === 'personales' && <PersonalFinanceView />}
          {activeTab === 'ahorros' && <SavingsView />}
          {activeTab === 'deudas' && <DebtsView />}
          {activeTab === 'inversionistas' && <InvestorsView />}
          {activeTab === 'compradores' && <BuyersView />}
          {activeTab === 'deudores' && <DebtorsView />}
          {activeTab === 'mis_inversiones' && <MyInvestmentsView />}
          {activeTab === 'cuentas' && <AccountsView />}
          {activeTab === 'listas' && <ListsSettingsView />}
        </main>

        <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 safe-bottom-padding w-full overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              Control Financiero — Suite de Finanzas Personales, Inversionistas, Compradores, Deudores e Inversiones
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {user ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sincronizado en Nube ({user.email})</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-600">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Almacenamiento Local</span>
                  </span>
                )}
              </div>
              <span aria-hidden="true">·</span>
              <span>
                Perfil Activo: <strong className="text-slate-800">{currentProfile.nombre}</strong>
              </span>
            </div>
          </div>
        </footer>
      </div>

      <OfflineIndicator />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FinanceProvider>
          <MainContent />
        </FinanceProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
