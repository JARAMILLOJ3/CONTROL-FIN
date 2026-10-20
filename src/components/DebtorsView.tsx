import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  HandCoins, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  History,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Debtor, DebtorStatus } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportImport';
import { DebtorModal } from './DebtorModal';
import { DebtorPaymentModal } from './DebtorPaymentModal';
import { PeriodFilter } from './PeriodFilter';
import { ConfirmModal } from './ConfirmModal';

export const DebtorsView: React.FC = () => {
  const { 
    debtors, 
    deleteDebtor, 
    deleteDebtorPayment, 
    currencySymbol, 
    summary 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DebtorStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debtorToEdit, setDebtorToEdit] = useState<Debtor | null>(null);

  // Payment modal state
  const [selectedDebtorForPayment, setSelectedDebtorForPayment] = useState<Debtor | null>(null);
  const [expandedDebtorId, setExpandedDebtorId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const getDebtorStatus = (deb: Debtor): DebtorStatus => {
    const total = Number(deb.totalACobrar || deb.montoPrestado || 0);
    const abonado = Number(deb.montoAbonado || 0);
    if (abonado >= total) return 'Cobrado';
    if (deb.estado === 'En mora') return 'En mora';
    if (abonado > 0) return 'Parcial';
    return 'Pendiente';
  };

  const filteredList = debtors.filter(deb => {
    const matchesSearch = 
      deb.deudor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deb.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deb.contacto && deb.contacto.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = getDebtorStatus(deb);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenNew = () => {
    setDebtorToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (deb: Debtor) => {
    setDebtorToEdit(deb);
    setIsModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'Deudor',
      'Contacto',
      'Concepto',
      'Fecha Préstamo',
      'Fecha Compromiso',
      'Monto Prestado',
      'Interés Pactado',
      'Total a Cobrar',
      'Monto Abonado',
      'Saldo Pendiente',
      'Estado',
      'Cuenta Origen',
      'Notas'
    ];
    const rows = filteredList.map(deb => {
      const total = Number(deb.totalACobrar || deb.montoPrestado);
      const abonado = Number(deb.montoAbonado || 0);
      const saldo = Math.max(0, total - abonado);
      const status = getDebtorStatus(deb);
      return [
        deb.deudor,
        deb.contacto || '',
        deb.concepto,
        deb.fechaPrestamo,
        deb.fechaCompromiso || '',
        deb.montoPrestado,
        deb.interesPactado || '',
        total,
        abonado,
        saldo,
        status,
        deb.cuentaOrigen || '',
        deb.notas || ''
      ];
    });
    exportToCsv('deudores_cobros_control', headers, rows);
  };

  const getStatusBadge = (status: DebtorStatus) => {
    switch (status) {
      case 'Cobrado':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cobrado Total</span>
          </span>
        );
      case 'Parcial':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Abono Parcial</span>
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Por Cobrar</span>
          </span>
        );
      case 'En mora':
        return (
          <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>En Mora</span>
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
            <span>Cobros a Terceros</span>
            <span aria-hidden="true">·</span>
            <span>Préstamos personales, adelantos y cuentas por cobrar</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Control de Deudores y Préstamos
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Lleva el control exacto de quién te debe dinero, bajo qué acuerdo y los abonos que vas recibiendo.
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
            <span>Registrar Deudor</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total prestado a terceros</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {formatCurrency(summary.totalPrestadoDeudores, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total recuperado / abonado</span>
          <span className="text-base font-bold text-emerald-700 tabular-nums">
            {formatCurrency(summary.totalAbonadoDeudores, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Saldo pendiente por cobrar</span>
          <span className="text-base font-bold text-amber-700 tabular-nums">
            {formatCurrency(summary.porCobrarDeudores, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Deudores activos</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {debtors.filter(d => getDebtorStatus(d) !== 'Cobrado').length} de {debtors.length}
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
              placeholder="Buscar por deudor, concepto o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md">
          {(['All', 'Pendiente', 'Parcial', 'Cobrado', 'En mora'] as const).map((s) => (
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

      {/* Debtors List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <HandCoins className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-800">No hay deudores registrados</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Haz clic en "Registrar Deudor" para anotar los préstamos o dineros pendientes por cobrar.
            </p>
          </div>
        ) : (
          filteredList.map((deb) => {
            const totalACobrar = Number(deb.totalACobrar || deb.montoPrestado || 0);
            const abonado = Number(deb.montoAbonado || 0);
            const saldoPendiente = Math.max(0, totalACobrar - abonado);
            const status = getDebtorStatus(deb);
            const isExpanded = expandedDebtorId === deb.id;
            const porcentajeRecuperado = totalACobrar > 0 ? (abonado / totalACobrar) * 100 : 0;

            return (
              <div
                key={deb.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-neutral-900">
                        {deb.deudor}
                      </h3>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-600 font-medium">{deb.concepto}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      {getStatusBadge(status)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Prestado: {formatDate(deb.fechaPrestamo)}</span>
                      {deb.fechaCompromiso && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className={saldoPendiente > 0 ? 'text-amber-700 font-medium' : ''}>
                            Compromiso: {formatDate(deb.fechaCompromiso)}
                          </span>
                        </>
                      )}
                      {deb.contacto && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{deb.contacto}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {saldoPendiente > 0 && (
                      <button
                        onClick={() => setSelectedDebtorForPayment(deb)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Registrar Abono</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedDebtorId(isExpanded ? null : deb.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{deb.abonos?.length || 0} Abonos</span>
                    </button>

                    <button
                      onClick={() => handleEdit(deb)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setConfirmAction({
                          title: '¿Eliminar registro de deudor?',
                          message: `¿Estás seguro de eliminar el registro de préstamo a "${deb.deudor}" (${formatCurrency(deb.montoPrestado, currencySymbol)})?`,
                          confirmLabel: 'Sí, eliminar',
                          onConfirm: () => {
                            deleteDebtor(deb.id);
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

                {/* Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 py-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Monto Prestado</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(deb.montoPrestado, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Total a Cobrar</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(totalACobrar, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Total Abonado</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(abonado, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Saldo Pendiente</span>
                    <span className={`font-bold tabular-nums ${saldoPendiente > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatCurrency(saldoPendiente, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Condición / Interés</span>
                    <span className="font-medium text-neutral-700 truncate block">
                      {deb.interesPactado || 'Sin interés'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                    <span>Recuperado: {porcentajeRecuperado.toFixed(1)}%</span>
                    {deb.cuentaOrigen && <span>Salida de fondos: {deb.cuentaOrigen}</span>}
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-neutral-900 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, porcentajeRecuperado)}%` }}
                    />
                  </div>
                </div>

                {/* Abonos Expansion */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-700">
                      <span>Historial de Abonos Recibidos de este Deudor</span>
                      <span>Total abonado: {formatCurrency(deb.montoAbonado, currencySymbol)}</span>
                    </div>

                    {(!deb.abonos || deb.abonos.length === 0) ? (
                      <p className="text-xs text-neutral-400 py-2">
                        No hay abonos registrados para este deudor aún.
                      </p>
                    ) : (
                      <div className="divide-y divide-neutral-100 bg-neutral-50 rounded-lg p-3">
                        {deb.abonos.map((p) => (
                          <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-medium text-neutral-800">{formatDate(p.fecha)}</span>
                              {p.cuentaDestino && (
                                <span className="text-neutral-500 ml-2">({p.cuentaDestino})</span>
                              )}
                              {p.nota && (
                                <span className="text-neutral-400 ml-2">· {p.nota}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-emerald-700 tabular-nums">
                                {formatCurrency(p.monto, currencySymbol)}
                              </span>
                              <button
                                onClick={() => {
                                  setConfirmAction({
                                    title: '¿Eliminar este abono?',
                                    message: `¿Estás seguro de eliminar el abono de ${formatCurrency(p.monto, currencySymbol)}?`,
                                    confirmLabel: 'Sí, eliminar',
                                    onConfirm: () => {
                                      deleteDebtorPayment(deb.id, p.id);
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

      <DebtorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        debtorToEdit={debtorToEdit}
      />

      <DebtorPaymentModal
        isOpen={!!selectedDebtorForPayment}
        onClose={() => setSelectedDebtorForPayment(null)}
        debtor={selectedDebtorForPayment}
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
