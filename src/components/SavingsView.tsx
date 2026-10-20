import React, { useState, useMemo } from 'react';
import {
  PiggyBank,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Target,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  CreditCard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingGoal, SavingContribution } from '../types/finance';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { SavingGoalModal } from './SavingGoalModal';
import { SavingContributionModal } from './SavingContributionModal';
import { ConfirmModal } from './ConfirmModal';
import { exportToCsv } from '../utils/exportImport';

export const SavingsView: React.FC = () => {
  const { 
    savings, 
    deleteSavingGoal, 
    deleteSavingContribution, 
    currencySymbol, 
    summary,
    setActiveTab
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'En progreso' | 'Completado' | 'Pausado'>('All');
  
  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingGoal | null>(null);
  
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedGoalForContribution, setSelectedGoalForContribution] = useState<string | undefined>(undefined);
  const [contributionType, setContributionType] = useState<'Aporte' | 'Retiro'>('Aporte');

  const [expandedHistoryGoalId, setExpandedHistoryGoalId] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingGoal | null>(null);
  const [contribToDelete, setContribToDelete] = useState<{ goalId: string; contribId: string } | null>(null);

  // Filtered savings
  const filteredSavings = useMemo(() => {
    return savings.filter(s => {
      const matchesSearch = 
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.motivo && s.motivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.cuentaPreferida && s.cuentaPreferida.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'All' || s.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [savings, searchTerm, statusFilter]);

  const totalAhorrado = useMemo(() => {
    return savings.reduce((sum, s) => sum + Number(s.montoActual || 0), 0);
  }, [savings]);

  const metasCompletadas = useMemo(() => {
    return savings.filter(s => s.estado === 'Completado').length;
  }, [savings]);

  const handleOpenNewGoal = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: SavingGoal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleOpenAporte = (goalId?: string) => {
    setSelectedGoalForContribution(goalId);
    setContributionType('Aporte');
    setIsContributionModalOpen(true);
  };

  const handleOpenRetiro = (goalId?: string) => {
    setSelectedGoalForContribution(goalId);
    setContributionType('Retiro');
    setIsContributionModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = ['Nombre', 'Motivo', 'Monto Actual', 'Monto Objetivo', 'Fecha Inicio', 'Fecha Objetivo', 'Estado', 'Lugar'];
    const rows = filteredSavings.map(s => [
      s.nombre,
      s.motivo || '',
      s.montoActual,
      s.montoObjetivo || '',
      s.fechaInicio,
      s.fechaObjetivo || '',
      s.estado,
      s.cuentaPreferida || ''
    ]);
    exportToCsv('mis_metas_de_ahorro', headers, rows);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* 1. Header con Resumen & Acciones */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Metas & Alcancías</span>
              <span aria-hidden="true">·</span>
              <span>Fondos Protegidos</span>
              <span aria-hidden="true">·</span>
              <span>Sincronizado con Movimientos</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Mis Metas de Ahorro
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Crea bolsillos de ahorro para objetivos puntuales y transfiere plata desde tus cuentas en cualquier momento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            {savings.length > 0 && (
              <button
                onClick={() => handleOpenAporte()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <ArrowDownRight className="w-4 h-4 text-emerald-700" />
                <span>+ Meter Plata</span>
              </button>
            )}

            <button
              onClick={handleOpenNewGoal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Nueva Meta</span>
            </button>
          </div>
        </div>

        {/* 2. Tarjetas KPI de Ahorro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Total Ahorrado Acumulado
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(totalAhorrado, currencySymbol)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Metas Activas en Progreso
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-indigo-700 tabular-nums">
                {savings.filter(s => s.estado === 'En progreso').length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Metas Completadas
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 tabular-nums">
                {metasCompletadas} de {savings.length}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, motivo o cuenta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl text-xs">
          {(['All', 'En progreso', 'Completado', 'Pausado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st === 'All' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Lista o Grid de Metas de Ahorro */}
      {filteredSavings.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {savings.length === 0 
              ? 'No tienes metas de ahorro creadas todavía' 
              : 'No se encontraron metas con los filtros seleccionados'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-4 leading-relaxed">
            {savings.length === 0 
              ? 'Crea tu primera alcancía (por ejemplo: Fondo de Emergencia, Viaje o Moto) y transfiere plata desde tu Nequi o Efectivo cuando desees.' 
              : 'Intenta cambiar el término de búsqueda o selecciona "Todas".'}
          </p>
          {savings.length === 0 && (
            <button
              onClick={handleOpenNewGoal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Crear mi primer Ahorro</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSavings.map((goal) => {
            const percentage = goal.montoObjetivo && goal.montoObjetivo > 0
              ? Math.min(100, (goal.montoActual / goal.montoObjetivo) * 100)
              : null;
            
            const isExpanded = expandedHistoryGoalId === goal.id;
            const goalColor = goal.color || '#10B981';

            return (
              <div
                key={goal.id}
                className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  {/* Top Bar with Color Pill and Actions */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: goalColor }}
                        >
                          <PiggyBank className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm truncate" title={goal.nombre}>
                            {goal.nombre}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                              <CreditCard className="w-3 h-3 text-slate-500" />
                              <span>
                                {goal.cuentaPreferida 
                                  ? (goal.cuentaPreferida.toLowerCase().includes('nu') ? `Cajita en ${goal.cuentaPreferida}` :
                                     goal.cuentaPreferida.toLowerCase().includes('nequi') ? `Bolsillo en ${goal.cuentaPreferida}` :
                                     `Dentro de ${goal.cuentaPreferida}`)
                                  : 'En cuenta flexible'}
                              </span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className={`font-semibold ${
                              goal.estado === 'Completado' 
                                ? 'text-emerald-700' 
                                : goal.estado === 'Pausado' 
                                ? 'text-slate-400' 
                                : 'text-indigo-600'
                            }`}>
                              {goal.estado}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar meta"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setGoalToDelete(goal)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar meta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Motivo */}
                    {goal.motivo && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {goal.motivo}
                      </p>
                    )}

                    {/* Monto Actual y Meta */}
                    <div className="mt-4 p-3.5 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Acumulado
                        </span>
                        <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                          {formatCurrency(goal.montoActual, currencySymbol)}
                        </span>
                      </div>

                      {goal.montoObjetivo ? (
                        <>
                          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                            <span>Meta: <strong className="text-slate-800">{formatCurrency(goal.montoObjetivo, currencySymbol)}</strong></span>
                            <span className="font-semibold text-emerald-700 tabular-nums">
                              {percentage?.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: goalColor
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Meta libre (sin límite fijo)
                        </div>
                      )}
                    </div>

                    {/* Fechas */}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Inicio: {formatDate(goal.fechaInicio)}</span>
                      {goal.fechaObjetivo && (
                        <span>Meta: {formatDate(goal.fechaObjetivo)}</span>
                      )}
                    </div>
                  </div>

                  {/* Historial Desplegable */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-1 border-b border-slate-200/80">
                        <span>Historial de Movimientos ({goal.aportes.length})</span>
                      </div>

                      {goal.aportes.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-2 text-center">
                          Aún no hay aportes registrados en este ahorro.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                          {goal.aportes.map((apt) => (
                            <div
                              key={apt.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  {apt.tipo === 'Aporte' ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                      <ArrowDownRight className="w-3 h-3" />
                                      <span>Aporte</span>
                                    </span>
                                  ) : (
                                    <span className="text-rose-700 font-bold flex items-center gap-0.5">
                                      <ArrowUpRight className="w-3 h-3" />
                                      <span>Retiro</span>
                                    </span>
                                  )}
                                  <span className="text-slate-400">·</span>
                                  <span className="text-[11px] text-slate-500">{formatDate(apt.fecha)}</span>
                                </div>
                                <div className="text-[11px] text-slate-600 truncate mt-0.5">
                                  {apt.cuentaOrigen} {apt.nota ? `— ${apt.nota}` : ''}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className={`font-bold tabular-nums ${
                                  apt.tipo === 'Aporte' ? 'text-slate-900' : 'text-rose-600'
                                }`}>
                                  {apt.tipo === 'Aporte' ? '+' : '-'}{formatCurrency(apt.monto, currencySymbol)}
                                </span>
                                <button
                                  onClick={() => setContribToDelete({ goalId: goal.id, contribId: apt.id })}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                  title="Eliminar este movimiento"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons Footer */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setExpandedHistoryGoalId(isExpanded ? null : goal.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Movimientos</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenRetiro(goal.id)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Retirar dinero de este ahorro"
                    >
                      - Retirar
                    </button>
                    <button
                      onClick={() => handleOpenAporte(goal.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Meter Plata</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <SavingGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <SavingContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        defaultGoalId={selectedGoalForContribution}
        defaultType={contributionType}
      />

      {/* Confirmar Eliminación de Meta */}
      <ConfirmModal
        isOpen={Boolean(goalToDelete)}
        title="¿Eliminar esta meta de ahorro?"
        message={`Se eliminará "${goalToDelete?.nombre}". Los movimientos históricos en Finanzas Personales se mantendrán.`}
        confirmLabel="Sí, eliminar meta"
        confirmVariant="danger"
        onConfirm={() => {
          if (goalToDelete) {
            deleteSavingGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        onCancel={() => setGoalToDelete(null)}
      />

      {/* Confirmar Eliminación de Aporte individual */}
      <ConfirmModal
        isOpen={Boolean(contribToDelete)}
        title="¿Eliminar este movimiento de ahorro?"
        message="Se recalculará el saldo acumulado en la meta y se revertirá el movimiento automático en Finanzas Personales."
        confirmLabel="Sí, revertir movimiento"
        confirmVariant="danger"
        onConfirm={() => {
          if (contribToDelete) {
            deleteSavingContribution(contribToDelete.goalId, contribToDelete.contribId);
            setContribToDelete(null);
          }
        }}
        onCancel={() => setContribToDelete(null)}
      />
    </div>
  );
};
