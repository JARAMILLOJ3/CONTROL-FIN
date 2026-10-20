import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MyInvestment, InvestmentType, InvestmentStatus } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString, formatCurrency, formatPercent } from '../utils/formatters';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investmentToEdit?: MyInvestment | null;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  investmentToEdit
}) => {
  const { addMyInvestment, updateMyInvestment, configLists, currencySymbol } = useFinance();

  const [activoProyecto, setActivoProyecto] = useState('');
  const [tipoActivo, setTipoActivo] = useState<InvestmentType>('CDT / Renta Fija');
  const [fechaInversion, setFechaInversion] = useState(getTodayDateString());
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [montoInvertido, setMontoInvertido] = useState('');
  const [valorActual, setValorActual] = useState('');
  const [rendimientoCobrado, setRendimientoCobrado] = useState('');
  const [tasaEstimada, setTasaEstimada] = useState('');
  const [estado, setEstado] = useState<InvestmentStatus>('Activa');
  const [cuentaOrigen, setCuentaOrigen] = useState(configLists.cuentas[0] || 'Ahorro');
  const [notas, setNotas] = useState('');

  const initializedForRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initializedForRef.current = null;
      return;
    }

    const currentKey = investmentToEdit ? investmentToEdit.id : 'new_investment';
    if (initializedForRef.current !== currentKey) {
      initializedForRef.current = currentKey;

      if (investmentToEdit) {
        setActivoProyecto(investmentToEdit.activoProyecto);
        setTipoActivo(investmentToEdit.tipoActivo);
        setFechaInversion(investmentToEdit.fechaInversion);
        setFechaVencimiento(investmentToEdit.fechaVencimiento || '');
        setMontoInvertido(String(investmentToEdit.montoInvertido));
        setValorActual(String(investmentToEdit.valorActual));
        setRendimientoCobrado(String(investmentToEdit.rendimientoCobrado || 0));
        setTasaEstimada(investmentToEdit.tasaEstimada || '');
        setEstado(investmentToEdit.estado);
        setCuentaOrigen(investmentToEdit.cuentaOrigen || configLists.cuentas[0] || 'Ahorro');
        setNotas(investmentToEdit.notas || '');
      } else {
        setActivoProyecto('');
        setTipoActivo('CDT / Renta Fija');
        setFechaInversion(getTodayDateString());
        setFechaVencimiento('');
        setMontoInvertido('');
        setValorActual('');
        setRendimientoCobrado('0');
        setTasaEstimada('');
        setEstado('Activa');
        setCuentaOrigen(configLists.cuentas[0] || 'Ahorro');
        setNotas('');
      }
    }
  }, [investmentToEdit, isOpen, configLists]);

  if (!isOpen) return null;

  const numInvertido = parseFloat(montoInvertido) || 0;
  const numValorActual = parseFloat(valorActual) || numInvertido;
  const numCobrado = parseFloat(rendimientoCobrado) || 0;
  const gananciaNeta = (numValorActual + numCobrado) - numInvertido;
  const roi = numInvertido > 0 ? (gananciaNeta / numInvertido) * 100 : 0;

  const handleMontoInvertidoChange = (val: string) => {
    setMontoInvertido(val);
    if (!valorActual && val) {
      setValorActual(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numInvertido <= 0) return;

    if (investmentToEdit) {
      updateMyInvestment(investmentToEdit.id, {
        activoProyecto,
        tipoActivo,
        fechaInversion,
        fechaVencimiento: fechaVencimiento || undefined,
        montoInvertido: numInvertido,
        valorActual: numValorActual,
        rendimientoCobrado: numCobrado,
        tasaEstimada,
        estado,
        cuentaOrigen,
        notas
      });
    } else {
      addMyInvestment({
        activoProyecto,
        tipoActivo,
        fechaInversion,
        fechaVencimiento: fechaVencimiento || undefined,
        montoInvertido: numInvertido,
        valorActual: numValorActual,
        rendimientoCobrado: numCobrado,
        tasaEstimada,
        estado,
        cuentaOrigen,
        notas
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              {investmentToEdit ? 'Editar Inversión Propia' : 'Registrar Inversión Propia'}
            </h3>
            <p className="text-xs text-neutral-500">
              Registra lo que has invertido en cada proyecto o activo y su rendimiento
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nombre del Activo o Proyecto
            </label>
            <input
              type="text"
              required
              placeholder="Ej: CDT Bancolombia, Fondo Indexado S&P500, Negocio Cafetería"
              value={activoProyecto}
              onChange={(e) => setActivoProyecto(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tipo de Inversión
              </label>
              <select
                value={tipoActivo}
                onChange={(e) => setTipoActivo(e.target.value as InvestmentType)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {configLists.tiposInversion.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as InvestmentStatus)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Activa">Activa</option>
                <option value="Liquidada">Liquidada / Cerrada</option>
                <option value="En evaluación">En evaluación</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha de Inversión
              </label>
              <input
                type="date"
                required
                value={fechaInversion}
                onChange={(e) => setFechaInversion(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha Vencimiento (Opcional)
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Capital Invertido
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={montoInvertido}
                onChange={(e) => handleMontoInvertidoChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Valor Actual Estimado
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={valorActual}
                onChange={(e) => setValorActual(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Rendimientos Cobrados
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={rendimientoCobrado}
                onChange={(e) => setRendimientoCobrado(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Cálculo automático de Rendimiento y ROI */}
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-neutral-500 block">Rendimiento / Ganancia total:</span>
              <span className={`font-bold tabular-nums text-sm ${gananciaNeta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(gananciaNeta, currencySymbol)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block">Retorno ROI %:</span>
              <span className={`font-bold tabular-nums text-sm ${roi >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                {formatPercent(roi)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tasa Estimada / Interés
              </label>
              <input
                type="text"
                placeholder="Ej: 11.5% E.A. o 1.2% mensual"
                value={tasaEstimada}
                onChange={(e) => setTasaEstimada(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cuenta de Origen
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notas y Seguimiento
            </label>
            <textarea
              rows={2}
              placeholder="Detalles de la entidad, estrategia, condiciones de retiro..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
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
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              {investmentToEdit ? 'Guardar Cambios' : 'Registrar Inversión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
