import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { BuyerSale } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getTodayDateString } from '../utils/formatters';

interface BuyerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: BuyerSale | null;
}

export const BuyerPaymentModal: React.FC<BuyerPaymentModalProps> = ({
  isOpen,
  onClose,
  sale
}) => {
  const { addBuyerPayment, currencySymbol, configLists } = useFinance();
  const [fecha, setFecha] = useState(getTodayDateString());
  const [monto, setMonto] = useState('');
  const [metodo, setMetodo] = useState(configLists.metodosPago[0] || 'Transferencia Bancaria');
  const [cuentaDestino, setCuentaDestino] = useState(configLists.cuentas[0] || 'Nu');
  const [nota, setNota] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFecha(getTodayDateString());
      setMonto('');
      setNota('');
      if (configLists.metodosPago.length > 0) setMetodo(configLists.metodosPago[0]);
      if (configLists.cuentas.length > 0) setCuentaDestino(configLists.cuentas[0]);
    }
  }, [isOpen]);

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

  if (!isOpen || !sale) return null;

  const totalVendido = Number(sale.montoVendido || 0);
  const totalRecibido = Number(sale.montoRecibido || 0);
  const saldoPendiente = Math.max(0, totalVendido - totalRecibido);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) return;

    addBuyerPayment(sale.id, {
      fecha,
      monto: numMonto,
      metodo,
      cuentaDestino,
      nota
    });

    setMonto('');
    setNota('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Registrar Abono de Comprador
            </h3>
            <p className="text-xs text-neutral-500">
              {sale.comprador} · {sale.productoServicio}
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
            <span className="text-neutral-500 block">Total vendido: {formatCurrency(totalVendido, currencySymbol)}</span>
            <span className="text-neutral-500 block">Pagado: {formatCurrency(totalRecibido, currencySymbol)}</span>
          </div>
          <div className="text-right">
            <span className="text-neutral-500 block font-medium">Saldo por cobrar</span>
            <span className="text-sm font-bold text-amber-700 tabular-nums">
              {formatCurrency(saldoPendiente, currencySymbol)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Fecha del Pago
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
                Monto Recibido
              </label>
              {saldoPendiente > 0 && (
                <button
                  type="button"
                  onClick={() => setMonto(String(saldoPendiente))}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Cobrar saldo completo
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Método de Pago
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {configLists.metodosPago.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cuenta Destino
              </label>
              <select
                value={cuentaDestino}
                onChange={(e) => setCuentaDestino(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {configLists.cuentas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Comprobante / Detalle del Pago
            </label>
            <input
              type="text"
              placeholder="Ej: Transferencia Nequi ref #98231, abono 50%"
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
              <span>Guardar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
