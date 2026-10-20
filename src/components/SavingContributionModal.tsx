import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, PiggyBank, CreditCard, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingGoal } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface SavingContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGoalId?: string;
  defaultType?: 'Aporte' | 'Retiro';
}

export const SavingContributionModal: React.FC<SavingContributionModalProps> = ({
  isOpen,
  onClose,
  defaultGoalId,
  defaultType = 'Aporte'
}) => {
  const { 
    savings, 
    accounts, 
    summary, 
    currencySymbol, 
    addSavingContribution 
  } = useFinance();

  const [goalId, setGoalId] = useState<string>('');
  const [tipo, setTipo] = useState<'Aporte' | 'Retiro'>(defaultType);
  const [monto, setMonto] = useState<string>('');
  const [cuentaOrigen, setCuentaOrigen] = useState<string>('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [nota, setNota] = useState('');

  useEffect(() => {
    if (defaultGoalId) {
      setGoalId(defaultGoalId);
    } else if (savings.length > 0 && !goalId) {
      setGoalId(savings[0].id);
    }

    if (accounts.length > 0 && !cuentaOrigen) {
      setCuentaOrigen(accounts[0].nombre);
    }

    setTipo(defaultType);
    setMonto('');
    setNota('');
    setFecha(new Date().toISOString().slice(0, 10));
  }, [defaultGoalId, defaultType, isOpen, savings, accounts]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const selectedGoal = savings.find(s => s.id === goalId) || savings[0];
  const selectedAccountBalance = cuentaOrigen && summary.saldosPorLugar[cuentaOrigen] !== undefined
    ? summary.saldosPorLugar[cuentaOrigen]
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || !monto || parseFloat(monto) <= 0 || !cuentaOrigen) return;

    addSavingContribution(goalId, {
      monto: parseFloat(monto),
      fecha,
      tipo,
      cuentaOrigen,
      nota: nota.trim() || undefined
    });

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          tipo === 'Aporte' ? 'bg-slate-900' : 'bg-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              tipo === 'Aporte' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {tipo === 'Aporte' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {tipo === 'Aporte' ? 'Meter Plata al Ahorro' : 'Retirar Plata del Ahorro'}
              </h3>
              <p className="text-xs text-slate-300">
                {tipo === 'Aporte' 
                  ? 'Pasa saldo de tus finanzas hacia tu alcancía' 
                  : 'Regresa fondos a tus finanzas disponibles'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between Aporte vs Retiro */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setTipo('Aporte')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tipo === 'Aporte'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            + Aportar (Meter Plata)
          </button>
          <button
            type="button"
            onClick={() => setTipo('Retiro')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tipo === 'Retiro'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            - Retirar hacia mis Finanzas
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Seleccionar Meta de Ahorro */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Meta o Alcancía de Destino *
            </label>
            <select
              required
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              {savings.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre} (Acumulado: {formatCurrency(s.montoActual, currencySymbol)})
                </option>
              ))}
            </select>
          </div>

          {/* Seleccionar Cuenta (Nequi, Efectivo, Nu, Bancolombia, etc.) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                {tipo === 'Aporte' ? 'Cuenta bancaria de donde apartas la plata *' : 'Cuenta que recibe los fondos liberados *'}
              </label>
              <span className="text-[11px] text-slate-500 tabular-nums">
                Disponible: <strong className="text-emerald-700">{formatCurrency(summary.disponiblePorCuenta[cuentaOrigen] ?? selectedAccountBalance, currencySymbol)}</strong>
              </span>
            </div>
            <select
              required
              value={cuentaOrigen}
              onChange={(e) => setCuentaOrigen(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              {accounts.map(acc => {
                const disp = summary.disponiblePorCuenta[acc.nombre] ?? summary.saldosPorLugar[acc.nombre] ?? Number(acc.saldoInicial || 0);
                return (
                  <option key={acc.id} value={acc.nombre}>
                    {acc.nombre} — Disponible: {formatCurrency(disp, currencySymbol)}
                  </option>
                );
              })}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              💡 La plata se aparta en este bolsillo sin salir de tu cuenta {cuentaOrigen || 'bancaria'}.
            </span>
          </div>

          {/* Monto */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Monto a {tipo === 'Aporte' ? 'transferir' : 'retirar'} ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400">
                {currencySymbol}
              </span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 150000"
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold tabular-nums focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Fecha de la Operación *
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Nota opcional */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detalle o Nota Opcional
            </label>
            <input
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: Aporte de quincena, ahorro del fin de semana, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Sincronización Automática Explicativa */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {tipo === 'Aporte' ? (
                <>
                  Se descontará automáticamente de <strong>{cuentaOrigen || 'tu cuenta'}</strong> y 
                  quedará registrado como un movimiento tipo <strong>"Ahorro"</strong> en Finanzas Personales.
                </>
              ) : (
                <>
                  Los fondos se sumarán a <strong>{cuentaOrigen || 'tu cuenta'}</strong> y 
                  se registrará un movimiento tipo <strong>"Ingreso"</strong> en Finanzas Personales.
                </>
              )}
            </p>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl font-bold text-white shadow-xs transition-colors cursor-pointer ${
                tipo === 'Aporte' 
                  ? 'bg-emerald-600 hover:bg-emerald-500' 
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {tipo === 'Aporte' ? 'Confirmar Aporte' : 'Confirmar Retiro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
