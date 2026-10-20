import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  History,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Investor, InvestorStatus } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportImport';
import { InvestorModal } from './InvestorModal';
import { RepaymentModal } from './RepaymentModal';
import { PeriodFilter } from './PeriodFilter';
import { ConfirmModal } from './ConfirmModal';

export const InvestorsView: React.FC = () => {
  const { 
    investors, 
    deleteInvestor, 
    deleteRepayment, 
    currencySymbol, 
    summary 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InvestorStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investorToEdit, setInvestorToEdit] = useState<Investor | null>(null);

  // Repayment modal
  const [selectedInvestorForRepay, setSelectedInvestorForRepay] = useState<Investor | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const filteredList = investors.filter(inv => {
    const matchesSearch = 
      inv.inversionista.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.acuerdo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.contacto && inv.contacto.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || inv.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNew = () => {
    setInvestorToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv: Investor) => {
    setInvestorToEdit(inv);
    setIsModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'Inversionista', 
      'Contacto', 
      'Fecha Inicio', 
      'Fecha Vencimiento', 
      'Monto Recibido', 
      'Acuerdo', 
      'Tasa Retorno', 
      'Retorno Pactado', 
      'Monto Devuelto', 
      'Saldo Pendiente', 
      'Estado', 
      'Cuenta Receptora', 
      'Notas'
    ];
    const rows = filteredList.map(inv => {
      const saldo = Math.max(0, (inv.retornoPactado || inv.montoRecibido) - inv.montoDevuelto);
      return [
        inv.inversionista,
        inv.contacto || '',
        inv.fechaInicio,
        inv.fechaVencimiento || '',
        inv.montoRecibido,
        inv.acuerdo,
        inv.tasaRetorno || '',
        inv.retornoPactado,
        inv.montoDevuelto,
        saldo,
        inv.estado,
        inv.cuentaReceptora || '',
        inv.notas || ''
      ];
    });
    exportToCsv('inversionistas_control', headers, rows);
  };

  const getStatusBadge = (estado: InvestorStatus) => {
    switch (estado) {
      case 'Activo':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Activo</span>
          </span>
        );
      case 'Liquidado':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Liquidado</span>
          </span>
        );
      case 'En mora':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>En mora</span>
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
            <span>Módulo 2</span>
            <span aria-hidden="true">·</span>
            <span>Inversionistas y acuerdos de capital</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Control de Inversionistas
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Anota quién te ha invertido, cuánto, bajo qué acuerdo y cuánto has devuelto.
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
            <span>Nuevo Inversionista</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Inversiones recibidas</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {formatCurrency(summary.inversionesRecibidas, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Monto devuelto</span>
          <span className="text-base font-bold text-emerald-700 tabular-nums">
            {formatCurrency(
              investors.reduce((acc, inv) => acc + (inv.montoDevuelto || 0), 0),
              currencySymbol
            )}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Saldo por devolver</span>
          <span className="text-base font-bold text-amber-700 tabular-nums">
            {formatCurrency(summary.saldoPendienteInversionistas, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Inversionistas activos</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {investors.filter(i => i.estado === 'Activo').length} de {investors.length}
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
              placeholder="Buscar por inversionista, acuerdo o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md">
          {(['All', 'Activo', 'Liquidado', 'En mora'] as const).map((s) => (
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

      {/* Investors List / Table */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-800">No hay inversionistas registrados</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Haz clic en "Nuevo Inversionista" para registrar los acuerdos de capital.
            </p>
          </div>
        ) : (
          filteredList.map((inv) => {
            const retornoPactado = Number(inv.retornoPactado || inv.montoRecibido || 0);
            const devuelto = Number(inv.montoDevuelto || 0);
            const saldoPendiente = Math.max(0, retornoPactado - devuelto);
            const porcentajeDevuelto = retornoPactado > 0 ? (devuelto / retornoPactado) * 100 : 0;
            const isExpanded = expandedHistoryId === inv.id;

            return (
              <div
                key={inv.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-neutral-900">
                        {inv.inversionista}
                      </h3>
                      <span className="text-xs text-neutral-400">·</span>
                      {getStatusBadge(inv.estado)}
                    </div>
                    {inv.contacto && (
                      <p className="text-xs text-neutral-500">
                        {inv.contacto}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {saldoPendiente > 0 && (
                      <button
                        onClick={() => setSelectedInvestorForRepay(inv)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Registrar Devolución</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedHistoryId(isExpanded ? null : inv.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{inv.repagos?.length || 0} Abonos</span>
                    </button>

                    <button
                      onClick={() => handleEdit(inv)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setConfirmAction({
                          title: '¿Eliminar inversionista?',
                          message: `¿Estás seguro de eliminar a "${inv.inversionista}" y todo su registro de capital y abonos?`,
                          confirmLabel: 'Sí, eliminar',
                          onConfirm: () => {
                            deleteInvestor(inv.id);
                            setConfirmAction(null);
                          }
                        });
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Fecha Inicio</span>
                    <span className="font-medium text-neutral-800">{formatDate(inv.fechaInicio)}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Fecha Límite</span>
                    <span className="font-medium text-neutral-800">{formatDate(inv.fechaVencimiento)}</span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Capital Recibido</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(inv.montoRecibido, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Total a Devolver</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(retornoPactado, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Monto Devuelto</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(devuelto, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Saldo Pendiente</span>
                    <span className={`font-bold tabular-nums ${saldoPendiente > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatCurrency(saldoPendiente, currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Progress bar of repayment */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                    <span>Progreso de devolución: {porcentajeDevuelto.toFixed(1)}%</span>
                    <span>Acuerdo: {inv.acuerdo}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-neutral-900 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, porcentajeDevuelto)}%` }}
                    />
                  </div>
                </div>

                {/* Repayment History Dropdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-700">
                      <span>Historial de Devoluciones y Abonos Realizados</span>
                      <span>{inv.repagos?.length || 0} registros</span>
                    </div>

                    {(!inv.repagos || inv.repagos.length === 0) ? (
                      <p className="text-xs text-neutral-400 py-2">
                        No hay devoluciones registradas aún para este inversionista.
                      </p>
                    ) : (
                      <div className="divide-y divide-neutral-100 bg-neutral-50 rounded-lg p-3">
                        {inv.repagos.map((rep) => (
                          <div key={rep.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-medium text-neutral-800">{formatDate(rep.fecha)}</span>
                              {rep.cuentaOrigen && (
                                <span className="text-neutral-500 ml-2">({rep.cuentaOrigen})</span>
                              )}
                              {rep.nota && (
                                <span className="text-neutral-400 ml-2">· {rep.nota}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-700 tabular-nums">
                                {formatCurrency(rep.monto, currencySymbol)}
                              </span>
                              <button
                                onClick={() => {
                                  setConfirmAction({
                                    title: '¿Eliminar este abono?',
                                    message: `¿Estás seguro de eliminar el abono de ${formatCurrency(rep.monto, currencySymbol)}?`,
                                    confirmLabel: 'Sí, eliminar',
                                    onConfirm: () => {
                                      deleteRepayment(inv.id, rep.id);
                                      setConfirmAction(null);
                                    }
                                  });
                                }}
                                className="text-neutral-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="Eliminar abono"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <InvestorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        investorToEdit={investorToEdit}
      />

      <RepaymentModal
        isOpen={!!selectedInvestorForRepay}
        onClose={() => setSelectedInvestorForRepay(null)}
        investor={selectedInvestorForRepay}
      />

      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Eliminar'}
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => confirmAction?.onConfirm()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
