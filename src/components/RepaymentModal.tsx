import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Investor } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getTodayDateString } from '../utils/formatters';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: Investor | null;
}

export const RepaymentModal: React.FC<RepaymentModalProps> = ({
  isOpen,
  onClose,
  investor
}) => {
  const { addRepayment, currencySymbol, configLists } = useFinance();
  const [fecha, setFecha] = useState(getTodayDateString());
  const [monto, setMonto] = useState('');
  const [cuentaOrigen, setCuentaOrigen] = useState(configLists.cuentas[0] || 'Nu');
  const [nota, setNota] = useState('');

  if (!isOpen || !investor) return null;

  const pactado = Number(investor.retornoPactado || investor.montoRecibido || 0);
  const devuelto = Number(investor.montoDevuelto || 0);
  const saldoPendiente = Math.max(0, pactado - devuelto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) return;

    addRepayment(investor.id, {
      fecha,
      monto: numMonto,
      cuentaOrigen,
      nota
    });

    setMonto('');
    setNota('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Registrar Devolución a Inversionista
            </h3>
            <p className="text-xs text-neutral-500">
              {investor.inversionista}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumen del Saldo */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-100 text-xs flex justify-between items-center">
          <div>
            <span className="text-neutral-500 block">Pactado: {formatCurrency(pactado, currencySymbol)}</span>
            <span className="text-neutral-500 block">Devuelto: {formatCurrency(devuelto, currencySymbol)}</span>
          </div>
          <div className="text-right">
            <span className="text-neutral-500 block font-medium">Saldo por devolver</span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">
              {formatCurrency(saldoPendiente, currencySymbol)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Fecha de la Devolución
            </label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-neutral-700">
                Monto Devuelto
              </label>
              {saldoPendiente > 0 && (
                <button
                  type="button"
                  onClick={() => setMonto(String(saldoPendiente))}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Pagar total pendiente
                </button>
              )}
            </div>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Cuenta de donde sale el dinero
            </label>
            <select
              value={cuentaOrigen}
              onChange={(e) => setCuentaOrigen(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              {configLists.cuentas.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Comprobante / Nota de la devolución
            </label>
            <input
              type="text"
              placeholder="Ej: Cuota 3 de amortización, pago de intereses"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Guardar Devolución</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
