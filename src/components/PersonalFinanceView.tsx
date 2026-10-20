import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  Copy,
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat, 
  PiggyBank,
  Receipt,
  ArrowUpDown,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Movement, MovementType } from '../types/finance';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCsv } from '../utils/exportImport';
import { MovementModal } from './MovementModal';
import { PeriodFilter } from './PeriodFilter';
import { ConfirmModal } from './ConfirmModal';

export const PersonalFinanceView: React.FC = () => {
  const { 
    movements, 
    addMovement,
    deleteMovement, 
    currencySymbol, 
    summary, 
    configLists,
    setActiveTab 
  } = useFinance();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | MovementType>('All');
  const [accountFilter, setAccountFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'fecha_desc' | 'fecha_asc' | 'monto_desc' | 'monto_asc'>('fecha_desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState<Movement | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getAccountBadge = (cuentaName: string) => {
    const c = (cuentaName || '').toLowerCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-200';
    if (c.includes('nequi')) bg = 'bg-pink-100 text-pink-900 border-pink-300';
    else if (c.includes('nu')) bg = 'bg-purple-100 text-purple-900 border-purple-300';
    else if (c.includes('bancolombia')) bg = 'bg-amber-100 text-amber-900 border-amber-300';
    else if (c.includes('daviplata')) bg = 'bg-rose-100 text-rose-900 border-rose-300';
    else if (c.includes('efectivo')) bg = 'bg-emerald-100 text-emerald-900 border-emerald-300';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${bg}`}>
        {cuentaName}
      </span>
    );
  };

  // Categories list for filter dropdown
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    configLists.categoriasIngreso.forEach(c => set.add(c));
    configLists.categoriasGasto.forEach(c => set.add(c));
    movements.forEach(m => {
      if (m.categoria) set.add(m.categoria);
    });
    return Array.from(set).sort();
  }, [configLists, movements]);

  // Filtered and Sorted movements
  const filteredList = useMemo(() => {
    const list = movements.filter(m => {
      const matchesSearch = 
        m.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.notas && m.notas.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'All' || m.tipo === typeFilter;
      const matchesAccount = accountFilter === 'All' || m.cuenta === accountFilter || m.cuentaDestino === accountFilter;
      const matchesCategory = categoryFilter === 'All' || m.categoria === categoryFilter;

      return matchesSearch && matchesType && matchesAccount && matchesCategory;
    });

    return list.sort((a, b) => {
      if (sortBy === 'fecha_desc') {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      }
      if (sortBy === 'fecha_asc') {
        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      }
      if (sortBy === 'monto_desc') {
        return Number(b.monto || 0) - Number(a.monto || 0);
      }
      if (sortBy === 'monto_asc') {
        return Number(a.monto || 0) - Number(b.monto || 0);
      }
      return 0;
    });
  }, [movements, searchTerm, typeFilter, accountFilter, categoryFilter, sortBy]);

  // Dynamic metrics for the filtered view
  const filteredMetrics = useMemo(() => {
    let ingresos = 0;
    let gastos = 0;
    let ahorro = 0;
    filteredList.forEach(m => {
      const amt = Number(m.monto || 0);
      if (m.tipo === 'Ingreso') ingresos += amt;
      else if (m.tipo === 'Gasto') gastos += amt;
      else if (m.tipo === 'Ahorro') ahorro += amt;
    });
    return {
      ingresos,
      gastos,
      ahorro,
      balance: ingresos - gastos
    };
  }, [filteredList]);

  const handleOpenNew = () => {
    setMovementToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (movement: Movement) => {
    setMovementToEdit(movement);
    setIsModalOpen(true);
  };

  const handleDuplicate = (m: Movement) => {
    addMovement({
      fecha: m.fecha,
      tipo: m.tipo,
      categoria: m.categoria,
      concepto: `${m.concepto} (Copia)`,
      monto: Number(m.monto),
      cuenta: m.cuenta,
      cuentaDestino: m.cuentaDestino,
      notas: m.notas ? `Copia de movimiento original: ${m.notas}` : 'Copia de movimiento'
    });
    showToast(`Movimiento duplicado: "${m.concepto}"`);
  };

  const handleExportCsv = () => {
    const headers = ['Fecha', 'Tipo', 'Categoría', 'Concepto', 'Monto', 'Cuenta Origen', 'Cuenta Destino', 'Notas'];
    const rows = filteredList.map(m => [
      m.fecha,
      m.tipo,
      m.categoria,
      m.concepto,
      m.monto,
      m.cuenta,
      m.cuentaDestino || '',
      m.notas || ''
    ]);
    exportToCsv('finanzas_personales_movimientos', headers, rows);
  };

  const getMovementIcon = (tipo: MovementType) => {
    switch (tipo) {
      case 'Ingreso':
        return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Gasto':
        return <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />;
      case 'Ahorro':
        return <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Transferencia':
        return <Repeat className="w-3.5 h-3.5 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Finanzas Personales</span>
            <span aria-hidden="true">·</span>
            <span>Historial Diario y Conciliación</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Movimientos y Flujo de Caja
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Registra detalladamente tus ingresos, gastos, transferencias y apartados de ahorro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('ahorros')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-950 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <PiggyBank className="w-3.5 h-3.5 text-emerald-700" />
            <span>Metas de Ahorro</span>
          </button>

          <button
            onClick={() => setActiveTab('deudas')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-950 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-rose-600" />
            <span>Mis Deudas ({summary.deudasActivas || 0})</span>
          </button>

          <button
            onClick={handleExportCsv}
            aria-label="Exportar movimientos a CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenNew}
            aria-label="Registrar nuevo movimiento"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Resumen dinámico del período / lista filtrada */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200/90 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Ingresos Período
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums">
            {formatCurrency(filteredMetrics.ingresos, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Gastos Período
          </span>
          <span className="text-base sm:text-lg font-bold text-rose-700 tabular-nums">
            {formatCurrency(filteredMetrics.gastos, currencySymbol)}
          </span>
        </div>

        <div 
          onClick={() => setActiveTab('ahorros')}
          className="bg-white border border-neutral-200/90 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-emerald-500 transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Ahorro</span>
            <span className="text-[10px] text-emerald-700 font-semibold group-hover:underline">Alcancías →</span>
          </div>
          <span className="text-base sm:text-lg font-bold text-emerald-700 tabular-nums">
            {formatCurrency(filteredMetrics.ahorro, currencySymbol)}
          </span>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Flujo Neto
          </span>
          <span className={`text-base sm:text-lg font-bold tabular-nums ${
            filteredMetrics.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {formatCurrency(filteredMetrics.balance, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Date Filter & Toolbar */}
      <PeriodFilter />

      {/* Filter and Search Bar (Responsive controls) */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 space-y-3 text-xs shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              aria-label="Buscar movimientos"
              placeholder="Buscar concepto, categoría o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
            />
          </div>

          {/* Filtro por Categoría */}
          <div>
            <select
              aria-label="Filtrar por categoría"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
            >
              <option value="All">Todas las categorías</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Cuenta */}
          <div>
            <select
              aria-label="Filtrar por cuenta"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
            >
              <option value="All">Todas las cuentas</option>
              {Object.keys(summary.saldosPorLugar).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <select
              aria-label="Ordenar movimientos"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-xl bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
            >
              <option value="fecha_desc">Fecha (más reciente)</option>
              <option value="fecha_asc">Fecha (más antiguo)</option>
              <option value="monto_desc">Monto (mayor a menor)</option>
              <option value="monto_asc">Monto (menor a mayor)</option>
            </select>
          </div>
        </div>

        {/* Tipo de movimiento Selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {(['All', 'Ingreso', 'Gasto', 'Transferencia', 'Ahorro'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 font-semibold rounded-xl text-xs transition-colors whitespace-nowrap cursor-pointer ${
                typeFilter === t
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
              }`}
            >
              {t === 'All' ? 'Todos los tipos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* 1. MÓVIL: Tarjetas legibles (< 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400">
            <p className="text-sm font-semibold text-neutral-700 mb-1">No se encontraron movimientos</p>
            <p className="text-xs text-neutral-500">
              Prueba cambiando los filtros o usa "+ Registrar Movimiento".
            </p>
          </div>
        ) : (
          filteredList.map((m) => (
            <div 
              key={m.id}
              className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-neutral-100 shrink-0">
                    {getMovementIcon(m.tipo)}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-neutral-500 block">
                      {formatDate(m.fecha)} · {m.tipo}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 leading-snug">
                      {m.concepto}
                    </h3>
                  </div>
                </div>

                <div className={`text-base font-extrabold tabular-nums shrink-0 ${
                  m.tipo === 'Ingreso' ? 'text-emerald-700' :
                  m.tipo === 'Gasto' ? 'text-rose-700' :
                  m.tipo === 'Ahorro' ? 'text-emerald-700' : 'text-neutral-900'
                }`}>
                  {m.tipo === 'Ingreso' ? '+' : m.tipo === 'Gasto' ? '-' : ''}
                  {formatCurrency(m.monto, currencySymbol)}
                </div>
              </div>

              {m.notas && (
                <p className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded-lg leading-relaxed">
                  {m.notas}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                    {m.categoria}
                  </span>
                  {m.tipo === 'Transferencia' ? (
                    <div className="flex items-center gap-1">
                      {getAccountBadge(m.cuenta)}
                      <span className="text-neutral-400">→</span>
                      {getAccountBadge(m.cuentaDestino || 'Destino')}
                    </div>
                  ) : m.tipo === 'Ahorro' ? (
                    <div className="flex items-center gap-1.5">
                      {getAccountBadge(m.cuenta)}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Apartado en cuenta
                      </span>
                    </div>
                  ) : (
                    getAccountBadge(m.cuenta)
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(m)}
                    aria-label={`Duplicar movimiento ${m.concepto}`}
                    className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                    title="Duplicar movimiento"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(m)}
                    aria-label={`Editar movimiento ${m.concepto}`}
                    className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                    title="Editar movimiento"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMovementToDelete(m)}
                    aria-label={`Eliminar movimiento ${m.concepto}`}
                    className="p-2 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar movimiento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. ESCRITORIO & TABLET: Tabla estructurada (>= 768px) */}
      <div className="hidden md:block bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Concepto / Descripción</th>
                <th className="py-3 px-4">Cuenta / Lugar</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <p className="text-sm font-semibold text-neutral-700 mb-1">No se encontraron movimientos</p>
                    <p className="text-xs text-neutral-500">
                      Usa el botón "Registrar Movimiento" para agregar tu primer registro.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-700 font-medium">
                      {formatDate(m.fecha)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                        {getMovementIcon(m.tipo)}
                        <span>{m.tipo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                      {m.categoria}
                    </td>
                    <td className="py-3 px-4 text-neutral-900 font-medium max-w-xs truncate">
                      <div>{m.concepto}</div>
                      {m.notas && (
                        <div className="text-[11px] text-neutral-400 font-normal truncate mt-0.5">
                          {m.notas}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {m.tipo === 'Transferencia' ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getAccountBadge(m.cuenta)}
                          <span className="text-slate-400 font-bold">→</span>
                          {getAccountBadge(m.cuentaDestino || 'Destino')}
                        </div>
                      ) : m.tipo === 'Ahorro' ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getAccountBadge(m.cuenta)}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Apartado en cuenta
                          </span>
                        </div>
                      ) : (
                        <div>{getAccountBadge(m.cuenta)}</div>
                      )}
                    </td>
                    <td className={`py-3 px-4 whitespace-nowrap text-right font-bold tabular-nums text-sm ${
                      m.tipo === 'Ingreso' ? 'text-emerald-700' :
                      m.tipo === 'Gasto' ? 'text-rose-700' :
                      m.tipo === 'Ahorro' ? 'text-emerald-700' : 'text-neutral-900'
                    }`}>
                      {m.tipo === 'Ingreso' ? '+' : m.tipo === 'Gasto' ? '-' : ''}
                      {formatCurrency(m.monto, currencySymbol)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicate(m)}
                          aria-label={`Duplicar movimiento ${m.concepto}`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Duplicar movimiento"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(m)}
                          aria-label={`Editar movimiento ${m.concepto}`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMovementToDelete(m)}
                          aria-label={`Eliminar movimiento ${m.concepto}`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="py-3 px-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Mostrando {filteredList.length} de {movements.length} movimientos</span>
          <span>Sincronizado y respaldado</span>
        </div>
      </div>

      <MovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movementToEdit={movementToEdit}
      />

      <ConfirmModal
        isOpen={Boolean(movementToDelete)}
        title="¿Eliminar movimiento?"
        message={`¿Estás seguro de eliminar el movimiento "${movementToDelete?.concepto}" (${movementToDelete ? formatCurrency(movementToDelete.monto, currencySymbol) : ''})?`}
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => {
          if (movementToDelete) {
            deleteMovement(movementToDelete.id);
            setMovementToDelete(null);
            showToast('Movimiento eliminado');
          }
        }}
        onCancel={() => setMovementToDelete(null)}
      />
    </div>
  );
};
