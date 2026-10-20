import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  History,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BuyerSale, BuyerSaleStatus } from '../types/finance';
import { formatCurrency, formatPercent, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportImport';
import { BuyerSaleModal } from './BuyerSaleModal';
import { BuyerPaymentModal } from './BuyerPaymentModal';
import { PeriodFilter } from './PeriodFilter';
import { ConfirmModal } from './ConfirmModal';

export const BuyersView: React.FC = () => {
  const { 
    buyerSales, 
    deleteBuyerSale, 
    updateBuyerSale,
    deleteBuyerPayment, 
    accounts,
    currencySymbol, 
    summary 
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BuyerSaleStatus>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<BuyerSale | null>(null);

  // Payment modal state
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<BuyerSale | null>(null);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const getSaleStatus = (sale: BuyerSale): BuyerSaleStatus => {
    const total = Number(sale.montoVendido || 0);
    const recibido = Number(sale.montoRecibido || 0);
    if (recibido >= total) return 'Pagado';
    if (recibido > 0) return 'Parcial';
    return 'Pendiente';
  };

  const filteredList = buyerSales.filter(sale => {
    const matchesSearch = 
      sale.comprador.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productoServicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.contacto && sale.contacto.toLowerCase().includes(searchTerm.toLowerCase()));

    const status = getSaleStatus(sale);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenNew = () => {
    setSaleToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: BuyerSale) => {
    setSaleToEdit(sale);
    setIsModalOpen(true);
  };

  const handleExportCsv = () => {
    const headers = [
      'Fecha',
      'Comprador',
      'Contacto',
      'Producto o Servicio',
      'Monto Vendido',
      'Costo Producto',
      'Ganancia',
      'Margen %',
      'Monto Recibido',
      'Saldo Pendiente',
      'Estado',
      'Método de Pago',
      'Fecha Límite',
      'Notas'
    ];
    const rows = filteredList.map(sale => {
      const ganancia = sale.montoVendido - sale.costoProducto;
      const margen = sale.montoVendido > 0 ? (ganancia / sale.montoVendido) * 100 : 0;
      const saldo = Math.max(0, sale.montoVendido - sale.montoRecibido);
      const status = getSaleStatus(sale);
      return [
        sale.fecha,
        sale.comprador,
        sale.contacto || '',
        sale.productoServicio,
        sale.montoVendido,
        sale.costoProducto,
        ganancia,
        `${margen.toFixed(1)}%`,
        sale.montoRecibido,
        saldo,
        status,
        sale.metodoPago,
        sale.fechaLimite || '',
        sale.notas || ''
      ];
    });
    exportToCsv('compradores_ventas_control', headers, rows);
  };

  const getStatusBadge = (status: BuyerSaleStatus) => {
    switch (status) {
      case 'Pagado':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pagado</span>
          </span>
        );
      case 'Parcial':
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>Pago Parcial</span>
          </span>
        );
      case 'Pendiente':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Por Cobrar</span>
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
            <span>Módulo 3</span>
            <span aria-hidden="true">·</span>
            <span>Clientes, ventas, cobros y márgenes</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Control de Compradores y Ventas
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            Lleva el control de clientes, ventas, pagos recibidos y saldos pendientes.
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
            <span>Registrar Venta</span>
          </button>
        </div>
      </div>

      {/* Resumen de ventas y ganancias (Métricas exactas del template) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Total vendido</span>
          <span className="text-base font-bold text-neutral-900 tabular-nums">
            {formatCurrency(summary.totalVendido, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Costo de productos</span>
          <span className="text-base font-bold text-neutral-700 tabular-nums">
            {formatCurrency(summary.costoTotalProductos, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Ganancia total</span>
          <span className={`text-base font-bold tabular-nums ${summary.gananciaTotal >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatCurrency(summary.gananciaTotal, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-xs text-neutral-500 block mb-1">Margen global</span>
          <span className="text-base font-bold text-indigo-700 tabular-nums">
            {formatPercent(summary.margenGlobal)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-lg p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-neutral-500 block mb-1">Saldo por cobrar</span>
          <span className="text-base font-bold text-amber-700 tabular-nums">
            {formatCurrency(summary.saldoPorCobrar, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Guía Interactiva para Encargos y Proveedores */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="space-y-2 flex-1 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">
                💡 ¿Cómo registrar encargos de clientes cuando debes mandar a comprar el producto?
              </h3>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              <strong>¿Por qué NO debes ponerlo como Gasto Personal?</strong> Comprar mercancía encargada por un cliente es un <em>Costo Operativo de Negocio</em>, no un gasto de tu vida diaria (como arriendo o comida). Si lo pones en tus gastos personales, distorsionas tu presupuesto mensual y parece que gastaste más dinero de lo real.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-blue-900 block">1. Registra el Pedido</span>
                <p className="text-[11px] text-neutral-600 leading-tight">
                  Pon el precio total pactado con el cliente y el costo que te cobra el proveedor.
                </p>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-emerald-800 block">2. Recibe el Abono</span>
                <p className="text-[11px] text-neutral-600 leading-tight">
                  Toca "Registrar Abono": entra el dinero a tu Nequi o cuenta y reduce la deuda del cliente.
                </p>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-amber-800 block">3. Paga al Proveedor</span>
                <p className="text-[11px] text-neutral-600 leading-tight">
                  Marca "Costo pagado al proveedor": descuenta de tu banco real para conciliar tu extracto sin dañar tus gastos personales.
                </p>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-indigo-900 block">4. Entrega y Cobro Final</span>
                <p className="text-[11px] text-neutral-600 leading-tight">
                  Registra el abono restante cuando entregues el producto: te queda tu ganancia neta libre.
                </p>
              </div>
            </div>
          </div>
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
              placeholder="Buscar por comprador, producto o contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        </div>

        {/* Status Filter buttons */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-md">
          {(['All', 'Pagado', 'Parcial', 'Pendiente'] as const).map((s) => (
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

      {/* Sales List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
            <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-800">No hay ventas registradas</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Haz clic en "Registrar Venta" para controlar tus clientes y saldos pendientes.
            </p>
          </div>
        ) : (
          filteredList.map((sale) => {
            const ganancia = sale.montoVendido - sale.costoProducto;
            const margen = sale.montoVendido > 0 ? (ganancia / sale.montoVendido) * 100 : 0;
            const saldoPendiente = Math.max(0, sale.montoVendido - sale.montoRecibido);
            const status = getSaleStatus(sale);
            const isExpanded = expandedSaleId === sale.id;

            return (
              <div
                key={sale.id}
                className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-neutral-900">
                        {sale.comprador}
                      </h3>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-600 font-medium">{sale.productoServicio}</span>
                      <span className="text-xs text-neutral-400">·</span>
                      {getStatusBadge(status)}
                      {sale.costoProducto > 0 && (
                        <>
                          <span className="text-xs text-neutral-400">·</span>
                          {sale.costoPagado ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Costo pagado ({sale.cuentaCosto || 'Cuenta'})</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => updateBuyerSale(sale.id, { costoPagado: true, cuentaCosto: accounts[0]?.nombre || 'Nequi' })}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 transition-colors cursor-pointer"
                              title="Toca para registrar que ya compraste y pagaste este producto al proveedor"
                            >
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pagar al proveedor ({formatCurrency(sale.costoProducto, currencySymbol)})</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>Vendido: {formatDate(sale.fecha)}</span>
                      {sale.fechaLimite && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className={saldoPendiente > 0 ? 'text-amber-700 font-medium' : ''}>
                            Compromiso: {formatDate(sale.fechaLimite)}
                          </span>
                        </>
                      )}
                      {sale.contacto && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{sale.contacto}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {saldoPendiente > 0 && (
                      <button
                        onClick={() => setSelectedSaleForPayment(sale)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Registrar Abono</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{sale.pagos?.length || 0} Pagos</span>
                    </button>

                    <button
                      onClick={() => handleEdit(sale)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setConfirmAction({
                          title: '¿Eliminar venta?',
                          message: `¿Estás seguro de eliminar la venta a "${sale.comprador}" (${formatCurrency(sale.montoVendido, currencySymbol)})?`,
                          confirmLabel: 'Sí, eliminar',
                          onConfirm: () => {
                            deleteBuyerSale(sale.id);
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-4 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Total Vendido</span>
                    <span className="font-bold text-neutral-900 tabular-nums">
                      {formatCurrency(sale.montoVendido, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Costo Producto</span>
                    <span className="font-medium text-neutral-700 tabular-nums">
                      {formatCurrency(sale.costoProducto, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Ganancia</span>
                    <span className={`font-bold tabular-nums ${ganancia >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {formatCurrency(ganancia, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Margen %</span>
                    <span className="font-bold text-indigo-700 tabular-nums">
                      {formatPercent(margen)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Pagos Recibidos</span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(sale.montoRecibido, currencySymbol)}
                    </span>
                  </div>

                  <div>
                    <span className="text-neutral-500 block">Saldo por Cobrar</span>
                    <span className={`font-bold tabular-nums ${saldoPendiente > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatCurrency(saldoPendiente, currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Payment History Expansion */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-700">
                      <span>Historial de Pagos y Abonos Recibidos</span>
                      <span>Total abonado: {formatCurrency(sale.montoRecibido, currencySymbol)}</span>
                    </div>

                    {(!sale.pagos || sale.pagos.length === 0) ? (
                      <p className="text-xs text-neutral-400 py-2">
                        No hay abonos registrados para esta venta.
                      </p>
                    ) : (
                      <div className="divide-y divide-neutral-100 bg-neutral-50 rounded-lg p-3">
                        {sale.pagos.map((p) => (
                          <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-medium text-neutral-800">{formatDate(p.fecha)}</span>
                              {p.metodo && (
                                <span className="text-neutral-500 ml-2">({p.metodo})</span>
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
                                    title: '¿Eliminar este pago?',
                                    message: `¿Estás seguro de eliminar el pago de ${formatCurrency(p.monto, currencySymbol)}?`,
                                    confirmLabel: 'Sí, eliminar',
                                    onConfirm: () => {
                                      deleteBuyerPayment(sale.id, p.id);
                                      setConfirmAction(null);
                                    }
                                  });
                                }}
                                className="text-neutral-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                title="Eliminar pago"
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

      <BuyerSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        saleToEdit={saleToEdit}
      />

      <BuyerPaymentModal
        isOpen={!!selectedSaleForPayment}
        onClose={() => setSelectedSaleForPayment(null)}
        sale={selectedSaleForPayment}
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
