import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, DollarSign, Tag, Clock, FileText } from 'lucide-react';
import { Debt, DebtStatus } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString } from '../utils/formatters';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: Debt | null;
}

const CATEGORIAS_DEUDA = [
  'Tarjeta de Crédito',
  'Préstamo Bancario / Libre Inversión',
  'Préstamo Personal / Amigo',
  'Préstamo Familiar',
  'Compra a Crédito / Cuotas',
  'Crédito Vehicular',
  'Crédito Hipotecario',
  'Otro Pasivo'
];

const COLOR_OPTIONS = [
  { label: 'Ámbar (Tarjeta)', hex: '#F59E0B' },
  { label: 'Rojo (Urgente/Alto)', hex: '#EF4444' },
  { label: 'Violeta (Personal)', hex: '#8B5CF6' },
  { label: 'Azul (Bancario)', hex: '#3B82F6' },
  { label: 'Esmeralda (Familiar)', hex: '#10B981' },
  { label: 'Rosa (Comercio)', hex: '#EC4899' },
  { label: 'Cian (Inversión)', hex: '#06B6D4' },
];

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  debtToEdit
}) => {
  const { addDebt, updateDebt, configLists, currencySymbol } = useFinance();

  const [acreedor, setAcreedor] = useState('');
  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS_DEUDA[0]);
  const [montoTotal, setMontoTotal] = useState('');
  const [fechaInicio, setFechaInicio] = useState(getTodayDateString());
  const [fechaLimite, setFechaLimite] = useState('');
  const [tasaInteres, setTasaInteres] = useState('');
  const [numeroCuotas, setNumeroCuotas] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0].hex);
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (debtToEdit) {
      setAcreedor(debtToEdit.acreedor);
      setConcepto(debtToEdit.concepto);
      setCategoria(debtToEdit.categoria || CATEGORIAS_DEUDA[0]);
      setMontoTotal(String(debtToEdit.montoTotal));
      setFechaInicio(debtToEdit.fechaInicio);
      setFechaLimite(debtToEdit.fechaLimite || '');
      setTasaInteres(debtToEdit.tasaInteres || '');
      setNumeroCuotas(debtToEdit.numeroCuotas ? String(debtToEdit.numeroCuotas) : '');
      setColor(debtToEdit.color || COLOR_OPTIONS[0].hex);
      setNotas(debtToEdit.notas || '');
    } else {
      setAcreedor('');
      setConcepto('');
      setCategoria(CATEGORIAS_DEUDA[0]);
      setMontoTotal('');
      setFechaInicio(getTodayDateString());
      setFechaLimite('');
      setTasaInteres('');
      setNumeroCuotas('');
      setColor(COLOR_OPTIONS[0].hex);
      setNotas('');
    }
  }, [debtToEdit, isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(montoTotal);
    if (!acreedor.trim() || isNaN(numMonto) || numMonto <= 0) return;

    const cuotasNum = numeroCuotas ? parseInt(numeroCuotas, 10) : undefined;

    if (debtToEdit) {
      updateDebt(debtToEdit.id, {
        acreedor: acreedor.trim(),
        concepto: concepto.trim() || 'Deuda registrada',
        categoria,
        montoTotal: numMonto,
        fechaInicio,
        fechaLimite: fechaLimite || undefined,
        tasaInteres: tasaInteres.trim() || undefined,
        numeroCuotas: cuotasNum && !isNaN(cuotasNum) ? cuotasNum : undefined,
        color,
        notas: notas.trim() || undefined
      });
    } else {
      addDebt({
        acreedor: acreedor.trim(),
        concepto: concepto.trim() || 'Deuda registrada',
        categoria,
        montoTotal: numMonto,
        fechaInicio,
        fechaLimite: fechaLimite || undefined,
        tasaInteres: tasaInteres.trim() || undefined,
        numeroCuotas: cuotasNum && !isNaN(cuotasNum) ? cuotasNum : undefined,
        cuotasPagadas: 0,
        color,
        estado: 'Pendiente',
        notas: notas.trim() || undefined
      });
    }

    onClose();
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
        {/* Header con gradiente temático */}
        <div 
          className="px-6 py-5 border-b text-white flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${color} 0%, #0F172A 100%)` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {debtToEdit ? 'Editar Deuda / Obligación' : 'Registrar Nueva Deuda'}
              </h3>
              <p className="text-xs text-white/80">
                Lleva el control de lo que debes a bancos, tarjetas o personas
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Acreedor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ¿A quién le debes? (Acreedor / Entidad) *
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ej. Bancolombia Tarjeta, Nu, Tío Juan, Tienda de ropa"
                value={acreedor}
                onChange={e => setAcreedor(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Categoría y Concepto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-slate-800 font-medium"
              >
                {CATEGORIAS_DEUDA.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Concepto o Motivo
              </label>
              <input
                type="text"
                placeholder="Ej. Compra celular, Capital negocio"
                value={concepto}
                onChange={e => setConcepto(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-800"
              />
            </div>
          </div>

          {/* Monto Total */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Monto Total de la Deuda ({currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-base">{currencySymbol}</span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="0"
                value={montoTotal}
                onChange={e => setMontoTotal(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha Adquisición *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Fecha Límite / Corte (Opcional)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={fechaLimite}
                  onChange={e => setFechaLimite(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Cuotas y Tasa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Número de Cuotas
              </label>
              <input
                type="number"
                min="1"
                max="360"
                placeholder="Ej. 12 cuotas (opcional)"
                value={numeroCuotas}
                onChange={e => setNumeroCuotas(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tasa o Interés (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. 2.1% E.M., Sin interés"
                value={tasaInteres}
                onChange={e => setTasaInteres(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800"
              />
            </div>
          </div>

          {/* Color temático para la tarjeta */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Color Distintivo
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.hex}
                  onClick={() => setColor(opt.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    color === opt.hex 
                      ? 'ring-2 ring-offset-1 ring-slate-900 border-transparent shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  style={{ 
                    backgroundColor: `${opt.hex}15`,
                    color: opt.hex,
                    borderColor: color === opt.hex ? opt.hex : undefined
                  }}
                >
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: opt.hex }} 
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles del acuerdo, días de corte, número de tarjeta, etc."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-800"
            />
          </div>

          {/* Botones de acción */}
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
              className="px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all hover:brightness-110 active:scale-98"
              style={{ backgroundColor: color }}
            >
              {debtToEdit ? 'Guardar Cambios' : 'Registrar Deuda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
