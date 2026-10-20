import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { Movement, BuyerSale, Debtor, AccountPlace } from '../types/finance';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, ShoppingBag, HandCoins, AlertCircle } from 'lucide-react';

interface ChartsProps {
  movements: Movement[];
  buyerSales: BuyerSale[];
  debtors: Debtor[];
  accounts: AccountPlace[];
  saldosPorLugar: Record<string, number>;
  currencySymbol: string;
  onOpenQuickAdd: () => void;
  onNavigateTab: (tab: any) => void;
}

const CATEGORY_COLORS = [
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#0EA5E9', // Sky Cyan
  '#F59E0B', // Amber
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
  '#EC4899', // Pink
  '#64748B', // Slate
];

// Custom Tooltip for Timeline
const CustomTimelineTooltip = ({ active, payload, label, currencySymbol }: any) => {
  if (active && payload && payload.length) {
    const ingresos = payload.find((p: any) => p.dataKey === 'ingresos')?.value || 0;
    const gastos = payload.find((p: any) => p.dataKey === 'gastos')?.value || 0;
    const balance = ingresos - gastos;

    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[180px]">
        <p className="font-semibold text-slate-300 pb-1.5 mb-1.5 border-b border-slate-800">
          {label}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-emerald-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Ingresos:
            </span>
            <span className="font-bold tabular-nums">
              {formatCurrency(ingresos, currencySymbol)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-rose-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
              Gastos:
            </span>
            <span className="font-bold tabular-nums">
              {formatCurrency(gastos, currencySymbol)}
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-3 font-semibold text-slate-100">
            <span>Flujo Neto:</span>
            <span className={`tabular-nums ${balance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {formatCurrency(balance, currencySymbol)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// 1. Timeline Cashflow Chart (Ingresos vs Gastos over months)
export const CashflowTimelineChart: React.FC<{
  movements: Movement[];
  buyerSales: BuyerSale[];
  currencySymbol: string;
  onOpenQuickAdd: () => void;
}> = ({ movements, buyerSales, currencySymbol, onOpenQuickAdd }) => {
  const chartData = useMemo(() => {
    const monthsMap: Record<string, { ingresos: number; gastos: number; label: string; sortKey: string }> = {};

    // Collect all unique months or default to last 4 months if empty
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      monthsMap[sortKey] = { ingresos: 0, gastos: 0, label: label.charAt(0).toUpperCase() + label.slice(1), sortKey };
    }

    // Process movements
    movements.forEach((m) => {
      if (!m.fecha) return;
      const monthKey = m.fecha.substring(0, 7);
      if (!monthsMap[monthKey]) {
        const [y, mo] = monthKey.split('-');
        const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
        const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        monthsMap[monthKey] = { ingresos: 0, gastos: 0, label: label.charAt(0).toUpperCase() + label.slice(1), sortKey: monthKey };
      }

      if (m.tipo === 'Ingreso') {
        monthsMap[monthKey].ingresos += Number(m.monto || 0);
      } else if (m.tipo === 'Gasto') {
        monthsMap[monthKey].gastos += Number(m.monto || 0);
      }
    });

    // Process sales (income received vs product cost)
    buyerSales.forEach((s) => {
      if (!s.fecha) return;
      const monthKey = s.fecha.substring(0, 7);
      if (!monthsMap[monthKey]) {
        const [y, mo] = monthKey.split('-');
        const d = new Date(parseInt(y), parseInt(mo) - 1, 1);
        const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        monthsMap[monthKey] = { ingresos: 0, gastos: 0, label: label.charAt(0).toUpperCase() + label.slice(1), sortKey: monthKey };
      }
      monthsMap[monthKey].ingresos += Number(s.montoRecibido || 0);
      monthsMap[monthKey].gastos += Number(s.costoProducto || 0);
    });

    const sorted = Object.values(monthsMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    // Keep at most last 6 active/recent months
    return sorted.slice(-6);
  }, [movements, buyerSales]);

  const hasData = chartData.some((d) => d.ingresos > 0 || d.gastos > 0);

  if (!hasData) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
          <TrendingUp className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Sin movimientos registrados aún</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-3">
          Registra tus primeros ingresos o gastos para ver la gráfica de flujo de caja mes a mes.
        </p>
        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Registrar Movimiento</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: '#CBD5E1' }}
            tick={{ fill: '#64748B', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748B', fontSize: 10 }}
            tickFormatter={(val) => {
              if (val >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}k`;
              return `${currencySymbol}${val}`;
            }}
          />
          <Tooltip content={<CustomTimelineTooltip currencySymbol={currencySymbol} />} />
          <Area
            type="monotone"
            dataKey="ingresos"
            name="Ingresos"
            stroke="#10B981"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorIngresos)"
          />
          <Area
            type="monotone"
            dataKey="gastos"
            name="Gastos"
            stroke="#F43F5E"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorGastos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ExpensesCategoryDonutChart: React.FC<{
  movements: Movement[];
  currencySymbol: string;
  onOpenQuickAdd?: () => void;
  onNavigateTab?: (tab: any) => void;
}> = ({ movements, currencySymbol, onOpenQuickAdd, onNavigateTab }) => {
  const { data, totalGastos } = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    let total = 0;

    movements
      .filter((m) => m.tipo === 'Gasto')
      .forEach((m) => {
        const cat = m.categoria || 'Sin Categoría';
        const amt = Number(m.monto || 0);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        total += amt;
      });

    const entries = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Group items beyond top 5 into "Otros"
    if (entries.length > 5) {
      const top5 = entries.slice(0, 5);
      const othersVal = entries.slice(5).reduce((sum, item) => sum + item.value, 0);
      return {
        data: [...top5, { name: 'Otras Categorías', value: othersVal }],
        totalGastos: total
      };
    }

    return { data: entries, totalGastos: total };
  }, [movements]);

  if (data.length === 0 || totalGastos === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-2.5">
          <ArrowDownRight className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Sin gastos clasificados</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1 mb-3">
          Tus gastos por categoría (comida, transporte, arriendo, servicios) se clasificarán automáticamente aquí.
        </p>
        <button
          onClick={onOpenQuickAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
        >
          <span>Registrar Gasto</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[280px]">
      {/* Donut Chart */}
      <div className="relative w-full sm:w-1/2 h-[200px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any) => [formatCurrency(Number(val), currencySymbol), 'Gasto']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '0.75rem',
                border: '1px solid #1E293B',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Donut Center Totals */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Gastos</span>
          <span className="text-xs font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalGastos, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Breakdown Legend List */}
      <div className="w-full sm:w-1/2 space-y-2 overflow-y-auto max-h-[220px] pr-1">
        {data.map((item, index) => {
          const percentage = totalGastos > 0 ? (item.value / totalGastos) * 100 : 0;
          const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

          return (
            <div key={item.name} className="flex flex-col text-xs">
              <div className="flex items-center justify-between text-slate-700 mb-0.5">
                <span className="flex items-center gap-1.5 truncate max-w-[130px]" title={item.name}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="truncate font-medium">{item.name}</span>
                </span>
                <span className="tabular-nums font-semibold text-slate-900 shrink-0">
                  {formatCurrency(item.value, currencySymbol)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Accounts Liquidity Allocation Chart
export const AccountsLiquidityChart: React.FC<{
  accounts: AccountPlace[];
  saldosPorLugar: Record<string, number>;
  totalDisponible: number;
  currencySymbol: string;
  onNavigateTab: (tab: any) => void;
}> = ({ accounts, saldosPorLugar, totalDisponible, currencySymbol, onNavigateTab }) => {
  return (
    <div className="space-y-3">
      {accounts.map((acc) => {
        const saldo = saldosPorLugar[acc.nombre] ?? Number(acc.saldoInicial || 0);
        const percentage = totalDisponible > 0 ? Math.max(0, (saldo / totalDisponible) * 100) : 0;
        const color = acc.color || '#0F172A';

        return (
          <div
            key={acc.id}
            onClick={() => onNavigateTab('cuentas')}
            className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-slate-800 group-hover:text-slate-900">
                  {acc.nombre}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 tabular-nums">
                  {formatPercent(percentage)}
                </span>
                <span className={`font-bold tabular-nums ${saldo >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                  {formatCurrency(saldo, currencySymbol)}
                </span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(2, Math.min(100, percentage))}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// 4. Commercial & Debtors Overview Bar Chart
export const ReceivablesAndSalesChart: React.FC<{
  totalVendido: number;
  totalRecibidoVentas: number;
  saldoPorCobrarVentas: number;
  totalPrestadoDeudores: number;
  totalAbonadoDeudores: number;
  porCobrarDeudores: number;
  currencySymbol: string;
}> = ({
  totalVendido,
  totalRecibidoVentas,
  saldoPorCobrarVentas,
  totalPrestadoDeudores,
  totalAbonadoDeudores,
  porCobrarDeudores,
  currencySymbol
}) => {
  const barData = [
    {
      name: 'Ventas Clientes',
      Cobrado: totalRecibidoVentas,
      Pendiente: saldoPorCobrarVentas
    },
    {
      name: 'Préstamos Deudores',
      Cobrado: totalAbonadoDeudores,
      Pendiente: porCobrarDeudores
    }
  ];

  const totalPendienteGlobal = saldoPorCobrarVentas + porCobrarDeudores;

  return (
    <div className="space-y-4">
      <div className="h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748B', fontSize: 10 }}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${currencySymbol}${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${currencySymbol}${(val / 1000).toFixed(0)}k`;
                return `${currencySymbol}${val}`;
              }}
            />
            <Tooltip
              formatter={(val: any, name: any) => [formatCurrency(Number(val), currencySymbol), name]}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '0.75rem',
                border: '1px solid #1E293B',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Cobrado" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pendiente" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <HandCoins className="w-4 h-4 text-amber-700 shrink-0" />
          <span className="font-semibold text-amber-950">Dinero total por cobrar:</span>
        </div>
        <span className="font-bold text-amber-900 tabular-nums text-sm">
          {formatCurrency(totalPendienteGlobal, currencySymbol)}
        </span>
      </div>
    </div>
  );
};
