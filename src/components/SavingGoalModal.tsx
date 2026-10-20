import React, { useState, useEffect } from 'react';
import { X, PiggyBank, Target, Calendar, Tag, CreditCard, Palette } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingGoal, SavingGoalStatus } from '../types/finance';

interface SavingGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingGoal | null;
}

const PRESET_COLORS = [
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#0EA5E9', // Cyan
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#0F172A'  // Slate
];

export const SavingGoalModal: React.FC<SavingGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit
}) => {
  const { addSavingGoal, updateSavingGoal, accounts, currencySymbol } = useFinance();

  const [nombre, setNombre] = useState('');
  const [motivo, setMotivo] = useState('');
  const [montoObjetivo, setMontoObjetivo] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaObjetivo, setFechaObjetivo] = useState('');
  const [cuentaPreferida, setCuentaPreferida] = useState('');
  const [color, setColor] = useState('#10B981');
  const [estado, setEstado] = useState<SavingGoalStatus>('En progreso');

  const initializedForRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initializedForRef.current = null;
      return;
    }

    const currentKey = goalToEdit ? goalToEdit.id : 'new_goal';
    if (initializedForRef.current !== currentKey) {
      initializedForRef.current = currentKey;

      if (goalToEdit) {
        setNombre(goalToEdit.nombre);
        setMotivo(goalToEdit.motivo || '');
        setMontoObjetivo(goalToEdit.montoObjetivo ? String(goalToEdit.montoObjetivo) : '');
        setFechaInicio(goalToEdit.fechaInicio);
        setFechaObjetivo(goalToEdit.fechaObjetivo || '');
        setCuentaPreferida(goalToEdit.cuentaPreferida || (accounts[0]?.nombre || ''));
        setColor(goalToEdit.color || '#10B981');
        setEstado(goalToEdit.estado);
      } else {
        setNombre('');
        setMotivo('');
        setMontoObjetivo('');
        setFechaInicio(new Date().toISOString().slice(0, 10));
        setFechaObjetivo('');
        setCuentaPreferida(accounts[0]?.nombre || 'Nequi');
        setColor('#10B981');
        setEstado('En progreso');
      }
    }
  }, [goalToEdit, isOpen, accounts]);

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
    if (!nombre.trim()) return;

    const numMeta = montoObjetivo ? parseFloat(montoObjetivo) : undefined;

    if (goalToEdit) {
      updateSavingGoal(goalToEdit.id, {
        nombre: nombre.trim(),
        motivo: motivo.trim(),
        montoObjetivo: numMeta,
        fechaInicio,
        fechaObjetivo: fechaObjetivo || undefined,
        cuentaPreferida: cuentaPreferida || undefined,
        color,
        estado
      });
    } else {
      addSavingGoal({
        nombre: nombre.trim(),
        motivo: motivo.trim() || 'Ahorro personal',
        montoObjetivo: numMeta,
        fechaInicio,
        fechaObjetivo: fechaObjetivo || undefined,
        cuentaPreferida: cuentaPreferida || undefined,
        color,
        estado
      });
    }

    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white shrink-0"
              style={{ backgroundColor: color }}
            >
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {goalToEdit ? 'Editar Meta de Ahorro' : 'Nueva Meta de Ahorro / Alcancía'}
              </h3>
              <p className="text-xs text-slate-300">
                Organiza tu dinero por motivos específicos y objetivos
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Nombre del ahorro */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre del Ahorro *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Fondo de Emergencia, Vacaciones en Cancún, Comprar Moto"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Motivo / Razón */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Motivo o Descripción del Ahorro
            </label>
            <textarea
              rows={2}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Guardar 3 meses de gastos fijos ante cualquier imprevisto laboral o de salud."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          {/* Monto Objetivo Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Meta u Objetivo ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={montoObjetivo}
                  onChange={(e) => setMontoObjetivo(e.target.value)}
                  placeholder="Ej: 5000000"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold tabular-nums focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                Opcional: puedes dejarlo vacío para ahorro libre
              </span>
            </div>

            {/* Dónde se guarda habitualmente */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cuenta bancaria donde vive este ahorro *
              </label>
              <select
                value={cuentaPreferida}
                onChange={(e) => setCuentaPreferida(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.nombre}>
                    {acc.nombre.toLowerCase().includes('nu') ? `Cajita en ${acc.nombre}` :
                     acc.nombre.toLowerCase().includes('nequi') ? `Bolsillo en ${acc.nombre}` :
                     `Dentro de ${acc.nombre}`}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                💡 El ahorro vive dentro de tu cuenta (como Cajita Nu o Bolsillo Nequi)
              </span>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha Límite Estimada
              </label>
              <input
                type="date"
                value={fechaObjetivo}
                onChange={(e) => setFechaObjetivo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color del ahorro */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Color identificador
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-slate-900 ring-offset-2 scale-110 shadow-xs' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Estado si se edita */}
          {goalToEdit && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Estado de la Meta
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value as SavingGoalStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="En progreso">En progreso</option>
                <option value="Completado">Completado</option>
                <option value="Pausado">Pausado</option>
              </select>
            </div>
          )}

          {/* Footer buttons */}
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              {goalToEdit ? 'Guardar Cambios' : 'Crear Meta de Ahorro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
