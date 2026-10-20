import React, { useState } from 'react';
import { 
  Plus, 
  CreditCard, 
  Edit2, 
  Check, 
  Trash2, 
  Info,
  DollarSign,
  PiggyBank,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { AccountPlace } from '../types/finance';
import { ConfirmModal } from './ConfirmModal';

export const AccountsView: React.FC = () => {
  const { 
    accounts, 
    updateAccountInitialBalance, 
    addAccount, 
    deleteAccount, 
    summary, 
    savings,
    currencySymbol,
    setActiveTab
  } = useFinance();

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<AccountPlace | null>(null);

  // New account form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newSaldoInicial, setNewSaldoInicial] = useState('');

  const handleStartEdit = (id: string, currentInitial: number) => {
    setEditingAccountId(id);
    setEditingBalance(String(currentInitial));
  };

  const handleSaveEdit = (id: string) => {
    const num = parseFloat(editingBalance);
    if (!isNaN(num)) {
      updateAccountInitialBalance(id, num);
    }
    setEditingAccountId(null);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newSaldoInicial) || 0;
    if (!newNombre.trim()) return;

    addAccount(newNombre.trim(), num);
    setNewNombre('');
    setNewSaldoInicial('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Cuentas & Billeteras</span>
            <span aria-hidden="true">·</span>
            <span>Saldos Reales & Bolsillos de Ahorro</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Dinero en Cuentas y Bolsillos
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Tus cuentas bancarias reales (Nequi, Nu, Bancolombia, Efectivo) con el desglose de lo que tienes disponible y lo apartado en ahorros.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Cuenta / Banco</span>
        </button>
      </div>

      {/* Tripe Banner: Total en Bancos | Apartado en Ahorros | Disponible Libre */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Total en Cuentas Bancarias */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Real en Bancos
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-neutral-900 tabular-nums">
            {formatCurrency(summary.totalEnCuentas, currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Suma de todos tus extractos bancarios ({accounts.length} cuentas)
          </p>
        </div>

        {/* 2. Apartado en Ahorros / Bolsillos */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Apartado en Ahorros
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {formatCurrency(summary.totalAhorros, currencySymbol)}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-neutral-500">En cajitas y alcancías protegidas</span>
            <button 
              onClick={() => setActiveTab('ahorros')}
              className="text-emerald-700 hover:underline font-semibold inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver metas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. Disponible Líquido para Gastar */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Disponible para Gastar
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tabular-nums">
            {formatCurrency(summary.totalDisponible, currencySymbol)}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Plata libre para tus gastos diarios sin tocar tus ahorros
          </p>
        </div>
      </div>

      {/* Banner Explicativo Fundamental: El ahorro no es una cuenta */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
        <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700 shrink-0 mt-0.5">
          <PiggyBank className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold block mb-0.5">Recuerda: El ahorro no es una cuenta bancaria</span>
          <p className="text-slate-600 leading-relaxed">
            Aquí solo registras tus cuentas y billeteras reales (Nequi, Nu, Bancolombia, Efectivo). Tus apartados de dinero (cajitas, bolsillos o alcancías) se configuran en <strong>"Metas de Ahorro"</strong> para proteger ese saldo sin sacarlo de tu banco.
          </p>
        </div>
      </div>

      {/* Formulario Nueva Cuenta */}
      {showAddForm && (
        <form onSubmit={handleCreateAccount} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Registrar Nueva Cuenta Bancaria o Billetera
              </h3>
              <p className="text-[11px] text-neutral-500">
                Agrega un banco real o billetera física/digital
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-neutral-500 hover:text-neutral-900"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nombre del Banco o Billetera Real *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Bancolombia, Daviplata, Lulo Bank, Falabella"
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Saldo Inicial Real en el Banco *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={newSaldoInicial}
                onChange={(e) => setNewSaldoInicial(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
            >
              Guardar Cuenta
            </button>
          </div>
        </form>
      )}

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const saldoTotal = summary.saldosPorLugar[acc.nombre] ?? acc.saldoInicial;
          const enAhorros = summary.ahorrosPorCuenta[acc.nombre] ?? 0;
          const disponible = summary.disponiblePorCuenta[acc.nombre] ?? (saldoTotal - enAhorros);
          
          const accountGoals = savings.filter(
            s => s.cuentaPreferida === acc.nombre && Number(s.montoActual || 0) > 0
          );

          const porcentajeTotal = summary.totalEnCuentas > 0 
            ? (saldoTotal / summary.totalEnCuentas) * 100 
            : 0;

          const isEditing = editingAccountId === acc.id;

          const getAccountColor = (name: string, fallback?: string) => {
            const n = name.toLowerCase();
            if (n.includes('nequi')) return '#EC4899';
            if (n.includes('nu')) return '#8B5CF6';
            if (n.includes('bancolombia')) return '#F59E0B';
            if (n.includes('daviplata')) return '#EF4444';
            if (n.includes('efectivo')) return '#10B981';
            return fallback || '#3B82F6';
          };
          const accColor = getAccountColor(acc.nombre, acc.color);

          return (
            <div
              key={acc.id}
              className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden"
              style={{ borderColor: `${accColor}40` }}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: accColor }}
              />

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0"
                      style={{ backgroundColor: accColor }}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-neutral-900 leading-tight">
                        {acc.nombre}
                      </h3>
                      <span className="text-[11px] text-neutral-500">
                        {acc.nombre.toLowerCase().includes('nu') ? 'Cuenta de ahorros Nu (Cajitas)' :
                         acc.nombre.toLowerCase().includes('nequi') ? 'Billetera Nequi (Bolsillos)' :
                         acc.nombre.toLowerCase().includes('efectivo') ? 'Efectivo en mano' : 'Cuenta bancaria'}
                      </span>
                    </div>
                  </div>

                  {acc.nombre !== 'Efectivo' && acc.nombre !== 'Nequi' && acc.nombre !== 'Nu' && (
                    <button
                      onClick={() => setAccountToDelete(acc)}
                      className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Eliminar cuenta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="py-4 space-y-3.5">
                  {/* Saldo Total Real en el Banco */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 block font-medium">
                        Saldo Total en {acc.nombre}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        (Extracto total bancario)
                      </span>
                    </div>
                    <div className="text-lg font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(saldoTotal, currencySymbol)}
                    </div>
                  </div>

                  {/* Desglose de Ahorros / Cajitas adentro */}
                  {enAhorros > 0 ? (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <PiggyBank className="w-3.5 h-3.5" />
                          <span>Apartado en Ahorros / Cajitas:</span>
                        </div>
                        <span className="font-bold text-emerald-700 tabular-nums">
                          {formatCurrency(enAhorros, currencySymbol)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {accountGoals.map(g => (
                          <span 
                            key={g.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-emerald-900 border border-emerald-200 shadow-2xs"
                          >
                            <span>{g.nombre}:</span>
                            <span className="font-bold">{formatCurrency(g.montoActual, currencySymbol)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-neutral-50 rounded-xl text-[11px] text-neutral-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-neutral-500">
                        <PiggyBank className="w-3 h-3 text-neutral-400" />
                        <span>Sin cajitas de ahorro aquí</span>
                      </span>
                      <button 
                        onClick={() => setActiveTab('ahorros')}
                        className="text-emerald-700 hover:underline font-semibold text-[10px] cursor-pointer"
                      >
                        + Crear bolsillo
                      </button>
                    </div>
                  )}

                  {/* Saldo Líquido Disponible para Gastar */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-slate-300 block">
                        Disponible para Gastar
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (Libre sin tocar ahorros)
                      </span>
                    </div>
                    <div className="text-lg font-extrabold text-emerald-400 tabular-nums">
                      {formatCurrency(disponible, currencySymbol)}
                    </div>
                  </div>

                  {/* Saldo Inicial Editable */}
                  <div className="pt-2 border-t border-neutral-100 text-xs">
                    <div className="flex items-center justify-between text-neutral-500 mb-1">
                      <span>Saldo Inicial Base:</span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(acc.id, acc.saldoInicial)}
                          className="text-neutral-400 hover:text-neutral-900 p-0.5 cursor-pointer"
                          title="Ajustar saldo inicial"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          step="any"
                          value={editingBalance}
                          onChange={(e) => setEditingBalance(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                        />
                        <button
                          onClick={() => handleSaveEdit(acc.id)}
                          className="p-1 text-white bg-neutral-900 rounded hover:bg-neutral-800 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-neutral-800 tabular-nums">
                        {formatCurrency(acc.saldoInicial, currencySymbol)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar representing share of total funds */}
              <div className="pt-2 border-t border-neutral-100 text-xs">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                  <span>Participación en patrimonio total</span>
                  <span className="font-medium text-neutral-700">{formatPercent(porcentajeTotal)}</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, porcentajeTotal))}%`,
                      backgroundColor: accColor 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-neutral-700">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-neutral-900 font-bold block text-sm">
            💡 ¿Cómo conviven tus cuentas bancarias y tus ahorros?
          </strong>
          <p className="leading-relaxed">
            <strong>El ahorro no es una cuenta separada:</strong> es un bolsillo o cajita que vive dentro de tus cuentas (por ejemplo, las <em>Cajitas de Nu</em>, los <em>Bolsillos de Nequi</em> o tus sobres en <em>Efectivo</em>).
          </p>
          <p className="leading-relaxed">
            Por eso aquí puedes ver el <strong>Saldo Total en el Banco</strong> (el extracto exacto que ves en tu app bancaria) y el <strong>Disponible para Gastar</strong>, que descuenta lo que tienes protegido en tus metas para que no lo toques por error.
          </p>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(accountToDelete)}
        title="¿Eliminar cuenta?"
        message={`¿Estás seguro de eliminar la cuenta "${accountToDelete?.nombre}"?`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => {
          if (accountToDelete) {
            deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          }
        }}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
};
