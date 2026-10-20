import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Movement, MovementType } from '../types/finance';
import { useFinance } from '../context/FinanceContext';
import { getTodayDateString } from '../utils/formatters';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movementToEdit?: Movement | null;
  defaultType?: MovementType;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  movementToEdit,
  defaultType = 'Gasto'
}) => {
  const { addMovement, updateMovement, configLists } = useFinance();

  const [fecha, setFecha] = useState(getTodayDateString());
  const [tipo, setTipo] = useState<MovementType>(defaultType);
  const [categoria, setCategoria] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [cuenta, setCuenta] = useState('');
  const [cuentaDestino, setCuentaDestino] = useState('');
  const [notas, setNotas] = useState('');

  const initializedForRef = React.useRef<string | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      initializedForRef.current = null;
      return;
    }

    const currentKey = movementToEdit ? movementToEdit.id : `new_${defaultType}`;
    if (initializedForRef.current !== currentKey) {
      initializedForRef.current = currentKey;

      if (movementToEdit) {
        setFecha(movementToEdit.fecha);
        setTipo(movementToEdit.tipo);
        setCategoria(movementToEdit.categoria);
        setConcepto(movementToEdit.concepto);
        setMonto(String(movementToEdit.monto));
        setCuenta(movementToEdit.cuenta);
        setCuentaDestino(movementToEdit.cuentaDestino || '');
        setNotas(movementToEdit.notas || '');
      } else {
        setFecha(getTodayDateString());
        setTipo(defaultType);
        if (defaultType === 'Ingreso') {
          setCategoria(configLists.categoriasIngreso[0] || 'Salario / Nómina');
        } else if (defaultType === 'Gasto') {
          setCategoria(configLists.categoriasGasto[0] || 'Alimentación y Mercado');
        } else if (defaultType === 'Ahorro') {
          setCategoria('Ahorro Fondo');
        } else {
          setCategoria('Transferencia entre cuentas');
        }
        setConcepto('');
        setMonto('');
        setCuenta(configLists.cuentas[0] || 'Nequi');
        setCuentaDestino(configLists.cuentas[1] || 'Nu');
        setNotas('');
      }
    }
  }, [isOpen, movementToEdit, defaultType, configLists]);

  // Adjust default category when type changes
  const handleTypeChange = (newType: MovementType) => {
    setTipo(newType);
    if (newType === 'Ingreso') {
      setCategoria(configLists.categoriasIngreso[0] || 'Salario / Nómina');
    } else if (newType === 'Gasto') {
      setCategoria(configLists.categoriasGasto[0] || 'Alimentación y Mercado');
    } else if (newType === 'Ahorro') {
      setCategoria('Ahorro Fondo');
    } else if (newType === 'Transferencia') {
      setCategoria('Transferencia entre cuentas');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) return;

    if (movementToEdit) {
      updateMovement(movementToEdit.id, {
        fecha,
        tipo,
        categoria,
        concepto,
        monto: numMonto,
        cuenta,
        cuentaDestino: tipo === 'Transferencia' ? cuentaDestino : undefined,
        notas
      });
    } else {
      addMovement({
        fecha,
        tipo,
        categoria,
        concepto,
        monto: numMonto,
        cuenta,
        cuentaDestino: tipo === 'Transferencia' ? cuentaDestino : undefined,
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
              {movementToEdit ? 'Editar Movimiento' : 'Registrar Movimiento Personal'}
            </h3>
            <p className="text-xs text-neutral-500">
              Finanzas personales: Ingresos, gastos, transferencias y ahorros
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo de movimiento Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 rounded-lg">
              {(['Ingreso', 'Gasto', 'Transferencia', 'Ahorro'] as MovementType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    tipo === t
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Fecha
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
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Monto
              </label>
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
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Categoría
            </label>
            {tipo === 'Ingreso' ? (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {configLists.categoriasIngreso.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : tipo === 'Gasto' ? (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {configLists.categoriasGasto.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Categoría"
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            )}
          </div>

          {/* Concepto / Descripción */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Concepto / Descripción
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pago quincenal nómina, Mercado, Alquiler"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          {/* Cuentas */}
          <div className={tipo === 'Transferencia' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-2"}>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                {tipo === 'Transferencia' ? 'Cuenta Origen' : tipo === 'Ahorro' ? 'Cuenta bancaria donde se aparta el ahorro *' : 'Lugar / Cuenta *'}
              </label>
              <select
                value={cuenta}
                onChange={(e) => setCuenta(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
              >
                {configLists.cuentas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {tipo === 'Transferencia' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Cuenta Destino *
                </label>
                <select
                  value={cuentaDestino}
                  onChange={(e) => setCuentaDestino(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                >
                  {configLists.cuentas.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {tipo === 'Ahorro' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 leading-relaxed">
              <span className="font-bold block mb-0.5">💡 Recuerda: el ahorro no es una cuenta</span>
              El dinero permanece en tu cuenta real ({cuenta || 'seleccionada'}), apartado en una cajita, bolsillo o alcancía para que no lo cuentes en tu saldo disponible para gastar.
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales, número de recibo, etc."
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
              {movementToEdit ? 'Guardar Cambios' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
