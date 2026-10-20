import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Investor, InvestorStatus } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString } from '../utils/formatters';

interface InvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  investorToEdit?: Investor | null;
}

export const InvestorModal: React.FC<InvestorModalProps> = ({
  isOpen,
  onClose,
  investorToEdit
}) => {
  const { addInvestor, updateInvestor, configLists } = useFinance();

  const [inversionista, setInversionista] = useState('');
  const [contacto, setContacto] = useState('');
  const [fechaInicio, setFechaInicio] = useState(getTodayDateString());
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [acuerdo, setAcuerdo] = useState('');
  const [tasaRetorno, setTasaRetorno] = useState('');
  const [retornoPactado, setRetornoPactado] = useState('');
  const [cuentaReceptora, setCuentaReceptora] = useState('');
  const [estado, setEstado] = useState<InvestorStatus>('Activo');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (investorToEdit) {
      setInversionista(investorToEdit.inversionista);
      setContacto(investorToEdit.contacto || '');
      setFechaInicio(investorToEdit.fechaInicio);
      setFechaVencimiento(investorToEdit.fechaVencimiento || '');
      setMontoRecibido(String(investorToEdit.montoRecibido));
      setAcuerdo(investorToEdit.acuerdo);
      setTasaRetorno(investorToEdit.tasaRetorno || '');
      setRetornoPactado(String(investorToEdit.retornoPactado));
      setCuentaReceptora(investorToEdit.cuentaReceptora || configLists.cuentas[0] || 'Nu');
      setEstado(investorToEdit.estado);
      setNotas(investorToEdit.notas || '');
    } else {
      setInversionista('');
      setContacto('');
      setFechaInicio(getTodayDateString());
      setFechaVencimiento('');
      setMontoRecibido('');
      setAcuerdo('');
      setTasaRetorno('');
      setRetornoPactado('');
      setCuentaReceptora(configLists.cuentas[0] || 'Nu');
      setEstado('Activo');
      setNotas('');
    }
  }, [investorToEdit, isOpen, configLists]);

  if (!isOpen) return null;

  // Auto-calculate suggested retorno pactado if user changes montoRecibido
  const handleMontoRecibidoChange = (val: string) => {
    setMontoRecibido(val);
    if (!retornoPactado && val) {
      setRetornoPactado(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(montoRecibido);
    const numRetorno = parseFloat(retornoPactado) || numMonto;

    if (isNaN(numMonto) || numMonto <= 0) return;

    if (investorToEdit) {
      updateInvestor(investorToEdit.id, {
        inversionista,
        contacto,
        fechaInicio,
        fechaVencimiento: fechaVencimiento || undefined,
        montoRecibido: numMonto,
        acuerdo,
        tasaRetorno,
        retornoPactado: numRetorno,
        cuentaReceptora,
        estado,
        notas
      });
    } else {
      addInvestor({
        inversionista,
        contacto,
        fechaInicio,
        fechaVencimiento: fechaVencimiento || undefined,
        montoRecibido: numMonto,
        acuerdo,
        tasaRetorno,
        retornoPactado: numRetorno,
        cuentaReceptora,
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
              {investorToEdit ? 'Editar Inversionista' : 'Registrar Nuevo Inversionista'}
            </h3>
            <p className="text-xs text-neutral-500">
              Anota quién te invirtió, cuánto, bajo qué acuerdo y retorno pactado
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
              Nombre del Inversionista / Entidad
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Carlos Mendoza, Inversiones Beta"
              value={inversionista}
              onChange={(e) => setInversionista(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Contacto (Teléfono / Email)
            </label>
            <input
              type="text"
              placeholder="+57 300 123 4567 · contacto@ejemplo.com"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha en que invirtió
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha vencimiento / límite
              </label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Monto Recibido (Capital)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                value={montoRecibido}
                onChange={(e) => handleMontoRecibidoChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Retorno Pactado a Devolver
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="Capital + Retorno"
                value={retornoPactado}
                onChange={(e) => setRetornoPactado(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Términos del Acuerdo
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Retorno del 15% en 6 meses"
                value={acuerdo}
                onChange={(e) => setAcuerdo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Tasa / % Retorno Estimado
              </label>
              <input
                type="text"
                placeholder="Ej: 15% semestral"
                value={tasaRetorno}
                onChange={(e) => setTasaRetorno(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cuenta donde entró el dinero
              </label>
              <select
                value={cuentaReceptora}
                onChange={(e) => setCuentaReceptora(e.target.value)}
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
                onChange={(e) => setEstado(e.target.value as InvestorStatus)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="Activo">Activo</option>
                <option value="Liquidado">Liquidado</option>
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
              placeholder="Destino del capital, garantías o condiciones especiales..."
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
              {investorToEdit ? 'Guardar Cambios' : 'Registrar Inversionista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
