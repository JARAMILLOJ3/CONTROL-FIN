import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MyInvestment, InvestmentStatus } from '../types/finance';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportImport';
import { InvestmentModal } from './InvestmentModal';
import { PeriodFilter } from './PeriodFilter';
import { ConfirmModal } from './ConfirmModal';

export const MyInvestmentsView: React.FC = () => {
  const { 
    myInvestments, 
    deleteMyInvestment, 
    currencySymbol, 
    summary 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InvestmentStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState<MyInvestment | null>(null);
  const [investmentToDelete, setInvestmentToDelete] = useState<MyInvestment | null>(null);

  const filteredList = myInvestments.filter(inv => {
    const matchesSearch = 
      inv.activoProyecto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.tipoActivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.notas && inv.notas.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || inv.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNew = () => {
    setInvestmentToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv: MyInvestment) => {
    setInvestmentToEdit(inv);
    setIsModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'Proyecto / Activo',
      'Tipo de Inversión',
      'Fecha Inversión',
      'Fecha Vencimiento',
      'Monto Invertido',
      'Valor Actual',
      'Rendimiento Cobrado',
      'Ganancia Neta',
      'ROI %',
      'Tasa Estimada',
      'Estado',
      'Cuenta Origen',
      'Notas'
    ];
    const rows = filteredList.map(inv => {
      const ganancia = (inv.valorActual + (inv.rendimientoCobrado || 0)) - inv.montoInvertido;
      const roi = inv.montoInvertido > 0 ? (ganancia / inv.montoInvertido) * 100 : 0;
      return [
        inv.activoProyecto,
        inv.tipoActivo,
        inv.fechaInversion,
        inv.fechaVencimiento || '',
        inv.montoInvertido,
        inv.valorActual,
        inv.rendimientoCobrado || 0,
        ganancia,
        `${roi.toFixed(1)}%`,
        inv.tasaEstimada || '',
        inv.estado,
        inv.cuentaOrigen,
        inv.notas || ''
      ];
    });
    exportToCsv('mis_inversiones_control', headers, rows);
  };

  const getStatusBadge = (estado: InvestmentStatus) => {
    switch (estado) {
      case 'Activa':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Activa</span>
          </span>
        );
      case 'Liquidada':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Liquidada</span>
          </span>
        );
      case 'En evaluación':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>En evaluación</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Módulo 4</span>
            <span aria-hidden="true">·</span>
            <span>Portafolio de activos y rendimientos propios</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Mis Inversiones
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Registra lo que tú has invertido en cada proyecto o activo y su rendimiento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Inversión</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Capital invertido</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {formatCurrency(summary.misInversiones, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Valoración actual</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {formatCurrency(summary.valorActualMisInversiones, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Ganancia neta total</span>
          <span className={`text-base font-bold tabular-nums ${summary.rendimientoTotalInversiones >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(summary.rendimientoTotalInversiones, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Retorno global ROI</span>
          <span className={`text-base font-bold tabular-nums ${summary.misInversiones > 0 ? 'text-indigo-700' : 'text-neutral-700'}`}>
            {summary.misInversiones > 0 
              ? formatPercent((summary.rendimientoTotalInversiones / summary.misInversiones) * 100) 
              : '0.0%'}
          </span>
        </div>
      </div>

      <PeriodFilter />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por proyecto, activo o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md">
          {(['All', 'Activa', 'Liquidada', 'En evaluación'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 font-medium rounded transition-colors whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {s === 'All' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Inversiones Cards */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <TrendingUp className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-800">No hay inversiones propias registradas</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Haz clic en "Nueva Inversión" para registrar tus CDTs, negocios, acciones o activos.
            </p>
          </div>
        ) : (
          filteredList.map((inv) => {
            const cobrado = Number(inv.rendimientoCobrado || 0);
            const gananciaNeta = (inv.valorActual + cobrado) - inv.montoInvertido;
            const roi = inv.montoInvertido > 0 ? (gananciaNeta / inv.montoInvertido) * 100 : 0;

            return (
              <div
                key={inv.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-neutral-900">
                        {inv.activoProyecto}
                      </h3>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-600 font-medium">{inv.tipoActivo}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      {getStatusBadge(inv.estado)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Invertido: {formatDate(inv.fechaInversion)}</span>
                      {inv.fechaVencimiento && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Vence: {formatDate(inv.fechaVencimiento)}</span>
                        </>
                      )}
                      {inv.tasaEstimada && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-neutral-700">Tasa: {inv.tasaEstimada}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>Origen: {inv.cuentaOrigen}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(inv)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Actualizar Valoración</span>
                    </button>

                    <button
                      onClick={() => setInvestmentToDelete(inv)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 py-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Capital Invertido</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(inv.montoInvertido, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Valor Actual Estimado</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(inv.valorActual, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Rendimientos Cobrados</span>
                    <span className="font-medium text-emerald-700 tabular-nums">
                      {formatCurrency(cobrado, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Ganancia Neta</span>
                    <span className={`font-bold tabular-nums ${gananciaNeta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatCurrency(gananciaNeta, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Rendimiento (ROI %)</span>
                    <span className={`font-bold tabular-nums ${roi >= 0 ? 'text-indigo-700' : 'text-rose-700'}`}>
                      {formatPercent(roi)}
                    </span>
                  </div>
                </div>

                {inv.notas && (
                  <div className="pt-2 text-xs text-neutral-500 border-t border-neutral-100">
                    <span className="font-medium text-neutral-600">Notas: </span>
                    {inv.notas}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        investmentToEdit={investmentToEdit}
      />

      <ConfirmModal
        isOpen={Boolean(investmentToDelete)}
        title="¿Eliminar inversión?"
        message={`¿Estás seguro de eliminar el registro de inversión en "${investmentToDelete?.activoProyecto}" (${investmentToDelete ? formatCurrency(investmentToDelete.montoInvertido, currencySymbol) : ''})?`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => {
          if (investmentToDelete) {
            deleteMyInvestment(investmentToDelete.id);
            setInvestmentToDelete(null);
          }
        }}
        onCancel={() => setInvestmentToDelete(null)}
      />
    </div>
  );
};
