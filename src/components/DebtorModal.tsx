import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Debtor, DebtorStatus } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString } from '../utils/formatters';

interface DebtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtorToEdit?: Debtor | null;
}

export const DebtorModal: React.FC<DebtorModalProps> = ({
  isOpen,
  onClose,
  debtorToEdit
}) => {
  const { addDebtor, updateDebtor, configLists } = useFinance();

  const [deudor, setDeudor] = useState('');
  const [contacto, setContacto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [fechaPrestamo, setFechaPrestamo] = useState(getTodayDateString());
  const [fechaCompromiso, setFechaCompromiso] = useState('');
  const [montoPrestado, setMontoPrestado] = useState('');
  const [interesPactado, setInteresPactado] = useState('Sin interés');
  const [totalACobrar, setTotalACobrar] = useState('');
  const [cuentaOrigen, setCuentaOrigen] = useState(configLists.cuentas[0] || 'Nequi');
  const [estado, setEstado] = useState<DebtorStatus>('Pendiente');
  const [notas, setNotas] = useState('');

  const initializedForRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initializedForRef.current = null;
      return;
    }

    const currentKey = debtorToEdit ? debtorToEdit.id : 'new_debtor';
    if (initializedForRef.current !== currentKey) {
      initializedForRef.current = currentKey;

      if (debtorToEdit) {
        setDeudor(debtorToEdit.deudor);
        setContacto(debtorToEdit.contacto || '');
        setConcepto(debtorToEdit.concepto);
        setFechaPrestamo(debtorToEdit.fechaPrestamo);
        setFechaCompromiso(debtorToEdit.fechaCompromiso || '');
        setMontoPrestado(String(debtorToEdit.montoPrestado));
        setInteresPactado(debtorToEdit.interesPactado || 'Sin interés');
        setTotalACobrar(String(debtorToEdit.totalACobrar));
        setCuentaOrigen(debtorToEdit.cuentaOrigen || configLists.cuentas[0] || 'Nequi');
        setEstado(debtorToEdit.estado);
        setNotas(debtorToEdit.notas || '');
      } else {
        setDeudor('');
        setContacto('');
        setConcepto('');
        setFechaPrestamo(getTodayDateString());
        setFechaCompromiso('');
        setMontoPrestado('');
        setInteresPactado('Sin interés');
        setTotalACobrar('');
        setCuentaOrigen(configLists.cuentas[0] || 'Nequi');
        setEstado('Pendiente');
        setNotas('');
      }
    }
  }, [debtorToEdit, isOpen, configLists]);

  if (!isOpen) return null;

  const handleMontoPrestadoChange = (val: string) => {
    setMontoPrestado(val);
    if (!totalACobrar || totalACobrar === montoPrestado) {
      setTotalACobrar(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrestado = parseFloat(montoPrestado);
    const numTotal = parseFloat(totalACobrar) || numPrestado;

    if (isNaN(numPrestado) || numPrestado <= 0) return;

    if (debtorToEdit) {
      updateDebtor(debtorToEdit.id, {
        deudor,
        contacto,
        concepto,
        fechaPrestamo,
        fechaCompromiso: fechaCompromiso || undefined,
        montoPrestado: numPrestado,
        interesPactado,
        totalACobrar: numTotal,
        cuentaOrigen,
        estado,
        notas
      });
    } else {
      addDebtor({
        deudor,
        contacto,
        concepto,
        fechaPrestamo,
        fechaCompromiso: fechaCompromiso || undefined,
        montoPrestado: numPrestado,
        interesPactado,
        totalACobrar: numTotal,
        cuentaOrigen,
        estado,
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
              {debtorToEdit ? 'Editar Registro de Deudor' : 'Registrar Cuenta por Cobrar / Deudor'}
            </h3>
            <p className="text-xs text-neutral-500">
              Control de préstamos a terceros, amigos, familiares o socios
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nombre del Deudor
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Alejandro Morales, Felipe Sandoval"
                value={deudor}
                onChange={(e) => setDeudor(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contacto (Teléfono o Email)
              </label>
              <input
                type="text"
                placeholder="+57 311 450 7890"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Concepto / Motivo de la Deuda
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Préstamo personal, Adelanto de dinero, Pago compartido"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha del Préstamo
              </label>
              <input
                type="date"
                required
                value={fechaPrestamo}
                onChange={(e) => setFechaPrestamo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha Compromiso de Pago
              </label>
              <input
                type="date"
                value={fechaCompromiso}
                onChange={(e) => setFechaCompromiso(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Monto Prestado Original
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={montoPrestado}
                onChange={(e) => handleMontoPrestadoChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Total Acordado a Cobrar
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="Capital + Interés"
                value={totalACobrar}
                onChange={(e) => setTotalACobrar(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Interés / Condiciones
              </label>
              <input
                type="text"
                placeholder="Sin interés, 2% mensual"
                value={interesPactado}
                onChange={(e) => setInteresPactado(e.target.value)}
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

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as DebtorStatus)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Parcial">Parcial</option>
                <option value="Cobrado">Cobrado / Liquidado</option>
                <option value="En mora">En mora</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              rows={2}
              placeholder="Detalles del acuerdo, comprobante o recordatorio..."
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
              {debtorToEdit ? 'Guardar Cambios' : 'Registrar Deudor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
