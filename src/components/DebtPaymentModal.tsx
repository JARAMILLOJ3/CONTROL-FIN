import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Calendar, Wallet, CheckCircle2, ArrowRight } from 'lucide-react';
import { Debt } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString, formatCurrency } from '../utils/formatters';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtId?: string; // Preselected debt
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debtId
}) => {
  const { debts, addDebtPayment, configLists, currencySymbol, summary } = useFinance();

  const availableAccounts = (configLists?.cuentas && Array.isArray(configLists.cuentas) && configLists.cuentas.length > 0)
    ? configLists.cuentas
    : ['Efectivo', 'Nequi', 'Nu', 'Bancolombia'];

  const [selectedDebtId, setSelectedDebtId] = useState<string>(() => {
    if (debtId) return debtId;
    const firstActive = debts.find(d => d.estado !== 'Saldada');
    return firstActive?.id || debts[0]?.id || '';
  });
  const [monto, setMonto] = useState('');
  const [cuentaOrigen, setCuentaOrigen] = useState(availableAccounts[0] || 'Nequi');
  const [fecha, setFecha] = useState(getTodayDateString());
  const [numeroCuota, setNumeroCuota] = useState('');
  const [nota, setNota] = useState('');
  const [registrarComoMovimiento, setRegistrarComoMovimiento] = useState(true);

  const activeDebts = debts.filter(d => d.estado !== 'Saldada');
  const currentDebt = debts.find(d => d.id === selectedDebtId) || activeDebts[0] || debts[0] || null;

  useEffect(() => {
    if (debtId) {
      setSelectedDebtId(debtId);
    } else if (!selectedDebtId && debts.length > 0) {
      const firstActive = debts.find(d => d.estado !== 'Saldada');
      setSelectedDebtId(firstActive?.id || debts[0]?.id || '');
    }
  }, [debtId, debts, selectedDebtId]);

  useEffect(() => {
    if (isOpen) {
      setMonto('');
      setFecha(getTodayDateString());
      setNumeroCuota('');
      setNota('');
      setRegistrarComoMovimiento(true);
      if (availableAccounts.length > 0) {
        setCuentaOrigen(availableAccounts[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saldoPendiente = currentDebt 
    ? Math.max(0, Number(currentDebt.montoTotal || 0) - Number(currentDebt.montoPagado || 0)) 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);
    const targetDebtId = selectedDebtId || currentDebt?.id || (debts[0]?.id);
    if (!targetDebtId || isNaN(numMonto) || numMonto <= 0) return;

    const cuotaNum = numeroCuota ? parseInt(numeroCuota, 10) : undefined;

    addDebtPayment(targetDebtId, {
      fecha,
      monto: numMonto,
      cuentaOrigen: cuentaOrigen || availableAccounts[0] || 'Nequi',
      numeroCuota: cuotaNum && !isNaN(cuotaNum) ? cuotaNum : undefined,
      nota: nota.trim() || undefined,
      registrarComoMovimiento
    });

    onClose();
  };

  // Cerrar modal con Escape y bloquear scroll del fondo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handlePagarTodo = () => {
    if (saldoPendiente > 0) {
      setMonto(String(saldoPendiente));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Registrar Abono a Deuda</h3>
              <p className="text-xs text-rose-100">
                Paga cuotas y descuenta de tu saldo disponible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de Deuda si hay varias */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Seleccionar Deuda / Acreedor *
            </label>
            {debts.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                No tienes ninguna deuda registrada aún. Por favor crea primero una deuda.
              </div>
            ) : (
              <select
                value={selectedDebtId || currentDebt?.id || ''}
                onChange={e => setSelectedDebtId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-slate-800 font-semibold"
              >
                {debts.map(d => {
                  const saldo = Math.max(0, Number(d.montoTotal || 0) - Number(d.montoPagado || 0));
                  return (
                    <option key={d.id} value={d.id}>
                      {d.acreedor} — Saldo pendiente: {currencySymbol} {formatCurrency(saldo)} ({d.categoria || 'Deuda'})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Tarjeta de estado actual de la deuda seleccionada */}
          {currentDebt && (
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium">Deuda total: </span>
                <span className="font-bold text-slate-800">{currencySymbol} {formatCurrency(currentDebt.montoTotal)}</span>
                <div className="text-slate-500 mt-0.5">
                  Pagado hasta hoy: <span className="text-emerald-700 font-semibold">{currencySymbol} {formatCurrency(currentDebt.montoPagado)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-slate-500 font-medium">Saldo Restante:</div>
                <div className="text-sm font-extrabold text-rose-600">
                  {currencySymbol} {formatCurrency(saldoPendiente)}
                </div>
                {saldoPendiente > 0 && (
                  <button
                    type="button"
                    onClick={handlePagarTodo}
                    className="mt-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Abonar saldo total
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Monto del Abono */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monto a Abonar ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-base">{currencySymbol}</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="0"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-900"
              />
            </div>
          </div>

          {/* Cuenta Origen (de dónde sale el dinero) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ¿De qué cuenta sale el dinero? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableAccounts.map(cuenta => {
                const saldoCuenta = summary?.saldosPorLugar?.[cuenta] ?? 0;
                const isSelected = cuentaOrigen === cuenta;
                return (
                  <button
                    type="button"
                    key={cuenta}
                    onClick={() => setCuentaOrigen(cuenta)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 truncate">{cuenta}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      Disp: <span className={saldoCuenta >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                        {currencySymbol} {formatCurrency(saldoCuenta)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fecha y Número de Cuota */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha del Abono *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Número de Cuota (Opcional)
              </label>
              <input
                type="number"
                min="1"
                placeholder={currentDebt?.numeroCuotas ? `Ej. Cuota ${(currentDebt.cuotasPagadas || 0) + 1} de ${currentDebt.numeroCuotas}` : 'Ej. 1, 2, 3...'}
                value={numeroCuota}
                onChange={e => setNumeroCuota(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
              />
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nota o Comprobante (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Transferencia #4892, Pago en sucursal"
              value={nota}
              onChange={e => setNota(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
            />
          </div>

          {/* Checkbox vincular movimiento */}
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-3">
            <input
              id="chk-mov-deuda"
              type="checkbox"
              checked={registrarComoMovimiento}
              onChange={e => setRegistrarComoMovimiento(e.target.checked)}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 h-4 w-4 border-slate-300"
            />
            <label htmlFor="chk-mov-deuda" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 block">
                Descontar automáticamente de mi saldo ({cuentaOrigen})
              </span>
              Registra un movimiento de gasto en Finanzas Personales con la categoría "Pago de Deudas" para mantener tus cuentas exactas.
            </label>
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={debts.length === 0}
              className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              Registrar Abono
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
