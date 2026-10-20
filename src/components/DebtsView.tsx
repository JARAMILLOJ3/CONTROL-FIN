import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Trash2,
  Edit2,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Download,
  ChevronDown,
  ChevronUp,
  Receipt,
  ShieldAlert,
  Percent,
  Check,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Debt, DebtPayment } from '../types/finance';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { DebtModal } from './DebtModal';
import { DebtPaymentModal } from './DebtPaymentModal';
import { ConfirmModal } from './ConfirmModal';
import { exportToCsv } from '../utils/exportImport';

export type DebtDisplayStatus = 'Al día' | 'Próxima a vencer' | 'Vencida' | 'Parcial' | 'Saldada';

export const DebtsView: React.FC = () => {
  const { 
    debts, 
    deleteDebt, 
    deleteDebtPayment, 
    currencySymbol,
    summary,
    setActiveTab
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | DebtDisplayStatus>('All');
  
  // Modals state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<Debt | null>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<string | undefined>(undefined);

  const [expandedHistoryDebtId, setExpandedHistoryDebtId] = useState<string | null>(null);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<{ debtId: string; paymentId: string } | null>(null);

  // Helper para determinar con precisión el estado (Al día, Próxima a vencer, Vencida, Parcial, Saldada)
  const getDebtStatusInfo = (d: Debt) => {
    const saldoPendiente = Math.max(0, d.montoTotal - d.montoPagado);
    if (d.estado === 'Saldada' || saldoPendiente === 0) {
      return {
        status: 'Saldada' as DebtDisplayStatus,
        label: 'Saldada',
        icon: CheckCircle2,
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    }

    if (d.fechaLimite) {
      const today = new Date().setHours(0, 0, 0, 0);
      const dueDate = new Date(d.fechaLimite).getTime();
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          status: 'Vencida' as DebtDisplayStatus,
          label: `Vencida (${Math.abs(diffDays)}d)`,
          icon: AlertCircle,
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          dias: diffDays
        };
      }
      if (diffDays <= 5) {
        return {
          status: 'Próxima a vencer' as DebtDisplayStatus,
          label: diffDays === 0 ? 'Vence hoy' : `Próxima a vencer (${diffDays}d)`,
          icon: Clock,
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
          dias: diffDays
        };
      }
    }

    if (d.estado === 'Parcial' || d.montoPagado > 0) {
      return {
        status: 'Parcial' as DebtDisplayStatus,
        label: 'Parcial',
        icon: History,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    }

    return {
      status: 'Al día' as DebtDisplayStatus,
      label: 'Al día',
      icon: ShieldCheck,
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
    };
  };

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts.filter(d => {
      const matchesSearch = 
        d.acreedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.concepto && d.concepto.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.categoria && d.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const statusInfo = getDebtStatusInfo(d);
      const matchesStatus = statusFilter === 'All' || statusInfo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [debts, searchTerm, statusFilter]);

  // Overall totals
  const totalDeudaGlobal = useMemo(() => {
    return debts.reduce((sum, d) => sum + Number(d.montoTotal || 0), 0);
  }, [debts]);

  const totalPagadoGlobal = useMemo(() => {
    return debts.reduce((sum, d) => sum + Number(d.montoPagado || 0), 0);
  }, [debts]);

  const saldoPendienteGlobal = Math.max(0, totalDeudaGlobal - totalPagadoGlobal);

  const porcentajeAmortizado = totalDeudaGlobal > 0 
    ? Math.min(100, (totalPagadoGlobal / totalDeudaGlobal) * 100) 
    : 0;

  const deudasActivasCount = debts.filter(d => d.estado !== 'Saldada').length;
  const deudasSaldadasCount = debts.filter(d => d.estado === 'Saldada').length;

  // Próximo vencimiento
  const proximoVencimiento = useMemo(() => {
    const activasConFecha = debts
      .filter(d => d.estado !== 'Saldada' && d.fechaLimite && (d.montoTotal - d.montoPagado) > 0)
      .map(d => ({
        acreedor: d.acreedor,
        fecha: d.fechaLimite!,
        dias: Math.ceil((new Date(d.fechaLimite!).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return activasConFecha[0] || null;
  }, [debts]);

  // Deuda más urgente (vencida o con menor plazo)
  const deudaMasUrgente = useMemo(() => {
    const activas = debts
      .filter(d => d.estado !== 'Saldada' && (d.montoTotal - d.montoPagado) > 0)
      .map(d => {
        let dias = 9999;
        if (d.fechaLimite) {
          const today = new Date().setHours(0, 0, 0, 0);
          dias = Math.ceil((new Date(d.fechaLimite).getTime() - today) / (1000 * 60 * 60 * 24));
        }
        return {
          debt: d,
          dias,
          saldo: Math.max(0, d.montoTotal - d.montoPagado)
        };
      })
      .sort((a, b) => a.dias - b.dias);

    return activas[0] || null;
  }, [debts]);

  const handleOpenNewDebt = () => {
    setDebtToEdit(null);
    setIsDebtModalOpen(true);
  };

  const handleEditDebt = (debt: Debt) => {
    setDebtToEdit(debt);
    setIsDebtModalOpen(true);
  };

  const handleOpenPayment = (debtId?: string) => {
    setSelectedDebtForPayment(debtId);
    setIsPaymentModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = ['Acreedor', 'Categoría', 'Concepto', 'Monto Total', 'Monto Pagado', 'Saldo Pendiente', 'Fecha Inicio', 'Fecha Límite', 'Estado', 'Tasa', 'Cuotas'];
    const rows = filteredDebts.map(d => [
      d.acreedor,
      d.categoria || '',
      d.concepto || '',
      d.montoTotal,
      d.montoPagado,
      Math.max(0, d.montoTotal - d.montoPagado),
      d.fechaInicio,
      d.fechaLimite || '',
      d.estado,
      d.tasaInteres || '',
      d.numeroCuotas ? `${d.cuotasPagadas || 0}/${d.numeroCuotas}` : ''
    ]);
    exportToCsv('mis_deudas_y_obligaciones', headers, rows);
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* 1. Header con métricas ejecutivas coloridas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4" />
              <span>Cuentas por Pagar & Pasivos Personales</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Mis Deudas & Obligaciones
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Controla lo que debes a bancos, tarjetas de crédito, créditos de consumo y personas
            </p>
          </div>

          {/* Botones de acción principales */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Descargar reporte en formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => handleOpenPayment()}
              disabled={debts.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Abono / Pago</span>
            </button>

            <button
              onClick={handleOpenNewDebt}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-600 via-rose-700 to-slate-900 hover:brightness-110 rounded-xl shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Deuda</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de métricas con los 5 puntos clave de deuda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
          {/* 1. Saldo Pendiente por Pagar */}
          <div className="bg-white p-4 rounded-xl border border-rose-200/90 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
              <span>Saldo Pendiente</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-rose-700 tracking-tight tabular-nums">
              {formatCurrency(saldoPendienteGlobal, currencySymbol)}
            </div>
            <div className="text-[11px] text-rose-600/90 mt-1 font-medium">
              {deudasActivasCount} {deudasActivasCount === 1 ? 'deuda activa' : 'deudas activas'}
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          </div>

          {/* 2. Total Pagado / Amortizado */}
          <div className="bg-white p-4 rounded-xl border border-emerald-200/90 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
              <span>Total Pagado</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-700 tracking-tight tabular-nums">
              {formatCurrency(totalPagadoGlobal, currencySymbol)}
            </div>
            <div className="text-[11px] text-emerald-700 font-bold mt-1">
              {porcentajeAmortizado.toFixed(1)}% amortizado
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          </div>

          {/* 3. Próximo Vencimiento */}
          <div className="bg-white p-4 rounded-xl border border-amber-200/90 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
              <span>Próximo Vencimiento</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            {proximoVencimiento ? (
              <>
                <div className="text-sm font-black text-amber-950 truncate tracking-tight">
                  {proximoVencimiento.acreedor}
                </div>
                <div className="text-xs text-amber-800 font-semibold mt-1">
                  {formatDate(proximoVencimiento.fecha)}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-slate-800">
                  {deudasSaldadasCount > 0 ? '¡Al día en todo!' : 'Sin fechas límite'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Sin compromisos pendientes
                </div>
              </>
            )}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          </div>

          {/* 4. Deuda Más Urgente */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1">
              <span>Deuda Más Urgente</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            {deudaMasUrgente ? (
              <>
                <div className="text-sm font-black text-slate-900 truncate tracking-tight">
                  {deudaMasUrgente.debt.acreedor}
                </div>
                <div className="text-xs font-semibold text-rose-700 mt-1 tabular-nums">
                  Saldo: {formatCurrency(deudaMasUrgente.saldo, currencySymbol)}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold text-emerald-700">
                  Sin urgencias
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Todo está solventado
                </div>
              </>
            )}
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900" />
          </div>

          {/* 5. Total Deuda Adquirida */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Deuda Adquirida</span>
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalDeudaGlobal, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {debts.length} {debts.length === 1 ? 'deuda total' : 'deudas totales'}
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-400" />
          </div>
        </div>

        {/* Barra de progreso global */}
        {totalDeudaGlobal > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                Progreso General de Cancelación de Deudas
              </span>
              <span className="font-extrabold text-slate-900">
                {currencySymbol} {formatCurrency(totalPagadoGlobal)} / {currencySymbol} {formatCurrency(totalDeudaGlobal)} ({porcentajeAmortizado.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${porcentajeAmortizado}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Barra de búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por acreedor, tarjeta, banco o concepto..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Filtros de estado con los 5 estados explícitos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {(['All', 'Al día', 'Próxima a vencer', 'Vencida', 'Parcial', 'Saldada'] as const).map(status => {
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'All' ? 'Todas' : status}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Grid de Deudas */}
      {filteredDebts.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-rose-500/20">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {debts.length === 0 ? 'No tienes deudas registradas' : 'No se encontraron deudas con esos filtros'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            {debts.length === 0
              ? 'Lleva un registro ordenado de tarjetas de crédito, préstamos de bancos o compromisos con personas. Registra los abonos y mira cómo disminuye tu saldo.'
              : 'Intenta limpiar el buscador o seleccionar otro estado de filtro.'}
          </p>
          {debts.length === 0 && (
            <button
              onClick={handleOpenNewDebt}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Mi Primera Deuda</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebts.map(debt => {
            const saldoPendiente = Math.max(0, debt.montoTotal - debt.montoPagado);
            const porcentaje = debt.montoTotal > 0 
              ? Math.min(100, (debt.montoPagado / debt.montoTotal) * 100) 
              : 0;
            const isExpanded = expandedHistoryDebtId === debt.id;
            const isSaldada = debt.estado === 'Saldada' || saldoPendiente === 0;
            const cardColor = debt.color || '#F59E0B';

            return (
              <div 
                key={debt.id}
                className="bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                style={{ borderColor: isSaldada ? '#10B981' : `${cardColor}40` }}
              >
                {/* Indicador de color en el borde superior */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: isSaldada ? '#10B981' : cardColor }}
                />

                <div>
                  {/* Cabecera de la deuda */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-base shadow-sm shrink-0"
                        style={{ backgroundColor: isSaldada ? '#10B981' : cardColor }}
                      >
                        {isSaldada ? <Check className="w-6 h-6" /> : (debt.acreedor?.charAt(0)?.toUpperCase() || 'D')}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900 truncate">
                            {debt.acreedor}
                          </h4>
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{ 
                              backgroundColor: `${cardColor}15`,
                              borderColor: `${cardColor}40`,
                              color: cardColor
                            }}
                          >
                            {debt.categoria}
                          </span>
                        </div>
                        {debt.concepto && (
                          <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                            {debt.concepto}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estado Pill con iconos y texto claro (no solo color) */}
                    <div>
                      {(() => {
                        const info = getDebtStatusInfo(debt);
                        const StatusIcon = info.icon;
                        return (
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${info.badgeClass}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{info.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Cifras Principales */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Monto Total</div>
                      <div className="text-xs font-black text-slate-900 mt-0.5">
                        {currencySymbol} {formatCurrency(debt.montoTotal)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Pagado</div>
                      <div className="text-xs font-black text-emerald-700 mt-0.5">
                        {currencySymbol} {formatCurrency(debt.montoPagado)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Saldo Restante</div>
                      <div className={`text-xs font-black mt-0.5 ${isSaldada ? 'text-slate-400' : 'text-rose-600'}`}>
                        {currencySymbol} {formatCurrency(saldoPendiente)}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso visual con gradiente */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Progreso de pago</span>
                      <span className="font-extrabold text-slate-800">
                        {porcentaje.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${porcentaje}%`,
                          backgroundColor: isSaldada ? '#10B981' : cardColor
                        }}
                      />
                    </div>
                  </div>

                  {/* Tags informativos: Cuotas, Fechas, Interés */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mb-4">
                    {debt.numeroCuotas && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                        <Receipt className="w-3 h-3 text-slate-500" />
                        <span>Cuotas: {debt.cuotasPagadas || 0} / {debt.numeroCuotas}</span>
                      </span>
                    )}

                    {debt.tasaInteres && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                        <Percent className="w-3 h-3 text-slate-500" />
                        <span>{debt.tasaInteres}</span>
                      </span>
                    )}

                    {debt.fechaLimite && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-medium">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        <span>Límite: {formatDate(debt.fechaLimite)}</span>
                      </span>
                    )}
                  </div>

                  {debt.notas && (
                    <p className="text-[11px] text-slate-500 italic mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{debt.notas}"
                    </p>
                  )}
                </div>

                {/* Acciones de la Deuda */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedHistoryDebtId(isExpanded ? null : debt.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>{(debt.pagos || []).length} abonos</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditDebt(debt)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar deuda"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDebtToDelete(debt)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar deuda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {!isSaldada && (
                        <button
                          onClick={() => handleOpenPayment(debt.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all hover:brightness-110 active:scale-98 ml-1"
                          style={{ backgroundColor: cardColor }}
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Abonar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Historial de Abonos desplegable */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Historial de Pagos</span>
                        {!isSaldada && (
                          <button
                            onClick={() => handleOpenPayment(debt.id)}
                            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Nuevo abono
                          </button>
                        )}
                      </div>

                      {(debt.pagos || []).length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded-lg">
                          Aún no has registrado ningún pago a esta deuda.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {(debt.pagos || []).map((p, index) => (
                            <div 
                              key={p.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/80 transition-colors"
                            >
                              <div>
                                <div className="font-bold text-slate-800">
                                  {currencySymbol} {formatCurrency(p.monto)}
                                  {p.numeroCuota && (
                                    <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                                      (Cuota {p.numeroCuota})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                  <span>{formatDate(p.fecha)}</span>
                                  <span>•</span>
                                  <span className="font-medium text-slate-700">Cuenta: {p.cuentaOrigen}</span>
                                </div>
                                {p.nota && (
                                  <div className="text-[10px] text-slate-400 italic mt-0.5">
                                    {p.nota}
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => setPaymentToDelete({ debtId: debt.id, paymentId: p.id })}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                                title="Eliminar abono"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setDebtToEdit(null);
        }}
        debtToEdit={debtToEdit}
      />

      <DebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedDebtForPayment(undefined);
        }}
        debtId={selectedDebtForPayment}
      />

      {/* Modal de confirmación para eliminar deuda */}
      {debtToDelete && (
        <ConfirmModal
          isOpen={true}
          title="¿Eliminar esta deuda?"
          message={`¿Estás seguro de que deseas eliminar la deuda con "${debtToDelete.acreedor}"? Esta acción borrará la deuda y su historial de abonos.`}
          confirmLabel="Sí, Eliminar Deuda"
          confirmVariant="danger"
          onCancel={() => setDebtToDelete(null)}
          onConfirm={() => {
            deleteDebt(debtToDelete.id);
            setDebtToDelete(null);
          }}
        />
      )}

      {/* Modal de confirmación para eliminar abono */}
      {paymentToDelete && (
        <ConfirmModal
          isOpen={true}
          title="¿Eliminar este abono?"
          message="¿Deseas revertir este abono? El saldo de la deuda aumentará nuevamente y se ajustará el historial."
          confirmLabel="Sí, Eliminar Abono"
          confirmVariant="danger"
          onCancel={() => setPaymentToDelete(null)}
          onConfirm={() => {
            deleteDebtPayment(paymentToDelete.debtId, paymentToDelete.paymentId);
            setPaymentToDelete(null);
          }}
        />
      )}
    </div>
  );
};
