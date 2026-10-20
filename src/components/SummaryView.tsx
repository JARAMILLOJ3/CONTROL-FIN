import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  ShoppingBag, 
  HandCoins, 
  ArrowRight, 
  Plus, 
  PiggyBank, 
  CheckCircle2, 
  Receipt,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Circle,
  HelpCircle,
  Users
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { PeriodFilter } from './PeriodFilter';
import { 
  CashflowTimelineChart, 
  ExpensesCategoryDonutChart 
} from './DashboardCharts';

interface SummaryViewProps {
  onOpenQuickAdd?: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ onOpenQuickAdd }) => {
  const { 
    summary, 
    currencySymbol, 
    setActiveTab, 
    movements, 
    investors, 
    buyerSales, 
    debtors, 
    myInvestments, 
    savings, 
    debts, 
    accounts 
  } = useFinance();

  const [showSecondaryDetails, setShowSecondaryDetails] = useState(false);

  // Checks if user is completely brand new
  const isBrandNew = movements.length === 0 && 
                     investors.length === 0 && 
                     buyerSales.length === 0 && 
                     debtors.length === 0 && 
                     myInvestments.length === 0 &&
                     savings.length === 0 &&
                     debts.length === 0;

  const hasConfiguredAccounts = accounts.some(a => (a.saldoInicial || 0) > 0) || movements.length > 0;
  const hasMovements = movements.length > 0;
  const hasCheckedBalance = hasConfiguredAccounts && hasMovements;

  const totalPorCobrarGlobal = (summary.porCobrarCompradores || 0) + (summary.porCobrarDeudores || 0);

  // Total debt calculations
  const totalDeudaGlobal = useMemo(() => {
    return debts.reduce((sum, d) => sum + Number(d.montoTotal || 0), 0);
  }, [debts]);

  const totalPagadoGlobal = useMemo(() => {
    return debts.reduce((sum, d) => sum + Number(d.montoPagado || 0), 0);
  }, [debts]);

  const porcentajeAmortizado = totalDeudaGlobal > 0 
    ? Math.min(100, (totalPagadoGlobal / totalDeudaGlobal) * 100) 
    : 0;

  // Next debt due date
  const deudaUrgente = useMemo(() => {
    const activas = debts
      .filter(d => d.estado !== 'Saldada' && d.fechaLimite)
      .map(d => ({
        ...d,
        diasRestantes: Math.ceil((new Date(d.fechaLimite!).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
    return activas[0] || null;
  }, [debts]);

  // Recommended Action Engine
  const recommendedAction = useMemo(() => {
    if (isBrandNew) {
      return {
        titulo: 'Configura tus saldos iniciales',
        mensaje: 'Empieza ingresando cuánto dinero tienes en tus cuentas (Nequi, Nu, Bancolombia, Efectivo) para que tu saldo disponible cuadre exactamente.',
        botonTexto: 'Configurar cuentas',
        accion: () => setActiveTab('cuentas'),
        tipo: 'info' as const
      };
    }

    if (deudaUrgente && deudaUrgente.diasRestantes <= 5) {
      return {
        titulo: `Deuda próxima con ${deudaUrgente.acreedor}`,
        mensaje: deudaUrgente.diasRestantes < 0 
          ? `Tienes un compromiso vencido hace ${Math.abs(deudaUrgente.diasRestantes)} días. Te recomendamos registrar el pago para evitar sobrecostos.`
          : `Vence en ${deudaUrgente.diasRestantes === 0 ? 'hoy' : `${deudaUrgente.diasRestantes} días`}. Revisa tu saldo disponible para cubrir la cuota.`,
        botonTexto: 'Ver y pagar deuda',
        accion: () => setActiveTab('deudas'),
        tipo: 'alerta' as const
      };
    }

    if (totalPorCobrarGlobal > 0) {
      return {
        titulo: `Tienes ${formatCurrency(totalPorCobrarGlobal, currencySymbol)} por cobrar`,
        mensaje: 'Revisa tus ventas o personas deudoras. Cuando recibas un pago o anticipo, regístralo como abono para ingresarlo a tus cuentas.',
        botonTexto: 'Ver cobros pendientes',
        accion: () => setActiveTab(summary.porCobrarCompradores > 0 ? 'compradores' : 'deudores'),
        tipo: 'atencion' as const
      };
    }

    if (summary.balance > 0 && summary.totalDisponible > 0) {
      return {
        titulo: 'Flujo positivo: considera apartar un ahorro',
        mensaje: `Tu balance es favorable (+${formatCurrency(summary.balance, currencySymbol)}). Protege una parte en tus metas de ahorro o cajitas para imprevistos.`,
        botonTexto: 'Ir a Metas de Ahorro',
        accion: () => setActiveTab('ahorros'),
        tipo: 'positivo' as const
      };
    }

    if (summary.balance < 0) {
      return {
        titulo: 'Tus gastos superan tus ingresos este período',
        mensaje: 'Revisa la gráfica de gastos por categoría para identificar en qué rubros puedes recortar gastos antes de fin de mes.',
        botonTexto: 'Revisar movimientos',
        accion: () => setActiveTab('personales'),
        tipo: 'alerta' as const
      };
    }

    return {
      titulo: 'Mantén tus finanzas al día',
      mensaje: 'Recuerda registrar tus compras y entradas diarias tan pronto ocurran para tener siempre tu dinero disponible exacto.',
      botonTexto: '+ Registrar movimiento',
      accion: () => onOpenQuickAdd?.(),
      tipo: 'info' as const
    };
  }, [isBrandNew, deudaUrgente, totalPorCobrarGlobal, summary, currencySymbol, setActiveTab, onOpenQuickAdd]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* 1. Header con Filtro Temporal & Metadatos */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Control Financiero</span>
              <span aria-hidden="true">·</span>
              <span>Dashboard Principal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Resumen General
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Supervisión de tu dinero disponible, flujo de caja, cuentas por cobrar y deudas pendientes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter />
            <button
              onClick={() => onOpenQuickAdd?.()}
              aria-label="Registrar nueva operación"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ONBOARDING: Comienza a organizar tu dinero en 3 pasos (visible si no tiene datos suficientes) */}
      {(!hasConfiguredAccounts || !hasMovements) && (
        <section aria-labelledby="onboarding-title" className="bg-white border-2 border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <h2 id="onboarding-title" className="text-base sm:text-lg font-bold text-slate-900">
              Comienza a organizar tu dinero en 3 pasos
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 max-w-xl">
            Sigue estos pasos sencillos para que tu dinero disponible y tus reportes reflejen tu situación real:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Paso 1: Configurar cuentas */}
            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              hasConfiguredAccounts 
                ? 'bg-emerald-50/40 border-emerald-200' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Paso 1
                  </span>
                  {hasConfiguredAccounts ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Listo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5" />
                      <span>Pendiente</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  1. Configura tus cuentas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Ingresa cuánto saldo inicial tienes en Nequi, Nu, Bancolombia o Efectivo.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('cuentas')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                  hasConfiguredAccounts 
                    ? 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                }`}
              >
                {hasConfiguredAccounts ? 'Revisar cuentas' : 'Configurar cuentas'}
              </button>
            </div>

            {/* Paso 2: Registrar primer ingreso o gasto */}
            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              hasMovements 
                ? 'bg-emerald-50/40 border-emerald-200' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Paso 2
                  </span>
                  {hasMovements ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Listo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5" />
                      <span>Pendiente</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  2. Registra tu primer movimiento
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Anota tu primer ingreso o gasto para que comience a funcionar el flujo de caja.
                </p>
              </div>
              <button
                onClick={() => onOpenQuickAdd?.()}
                className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                  hasMovements 
                    ? 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                }`}
              >
                {hasMovements ? 'Registrar otro' : '+ Registrar movimiento'}
              </button>
            </div>

            {/* Paso 3: Revisa cuánto tienes disponible */}
            <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
              hasCheckedBalance 
                ? 'bg-emerald-50/40 border-emerald-200' 
                : 'bg-slate-50/70 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Paso 3
                  </span>
                  {hasCheckedBalance ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Activo</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      <Circle className="w-2.5 h-2.5" />
                      <span>Paso final</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  3. Revisa cuánto tienes disponible
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Verifica tu dinero libre para gastar descontando tus apartados de ahorro.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('cuentas')}
                className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer text-center"
              >
                Ver dinero disponible
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Cuatro Tarjetas Principales de KPI (Preguntas clave: ¿Cuánto tengo? ¿Cuánto gasté/ingresé? ¿Cuánto me deben? ¿Cuánto debo pagar?) */}
      <section aria-labelledby="kpis-title" className="space-y-2">
        <h2 id="kpis-title" className="sr-only">Métricas clave</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Dinero Disponible (¿Cuánto tengo libre?) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dinero disponible
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                {formatCurrency(summary.totalDisponible, currencySymbol)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">
                En bancos: {formatCurrency(summary.totalEnCuentas, currencySymbol)}
              </span>
              <button
                onClick={() => setActiveTab('cuentas')}
                className="text-emerald-700 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Ver cuentas →
              </button>
            </div>
          </div>

          {/* KPI 2: Flujo Neto (¿Cuánto gasté o ingresé?) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Flujo neto
                </span>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    summary.balance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {summary.balance >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
              </div>
              <div
                className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${
                  summary.balance >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {formatCurrency(summary.balance, currencySymbol)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                +{formatCurrency(summary.ingresosRegistrados, currencySymbol)}
              </span>
              <span>
                -{formatCurrency(summary.gastosRegistrados, currencySymbol)}
              </span>
              <button
                onClick={() => setActiveTab('personales')}
                className="text-slate-700 hover:underline font-semibold cursor-pointer"
              >
                Detalle →
              </button>
            </div>
          </div>

          {/* KPI 3: Dinero Por Cobrar (¿Cuánto me deben?) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Dinero por cobrar
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <HandCoins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums tracking-tight">
                {formatCurrency(totalPorCobrarGlobal, currencySymbol)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">
                Ventas: {formatCurrency(summary.porCobrarCompradores, currencySymbol)}
              </span>
              <button
                onClick={() => setActiveTab(summary.porCobrarCompradores > 0 ? 'compradores' : 'deudores')}
                className="text-amber-800 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Cobros →
              </button>
            </div>
          </div>

          {/* KPI 4: Deudas Pendientes (¿Cuánto debo pagar?) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Deudas pendientes
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-700 tabular-nums tracking-tight">
                {formatCurrency(summary.saldoPendienteDeudas || 0, currencySymbol)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                {summary.deudasActivas || 0} {summary.deudasActivas === 1 ? 'activa' : 'activas'}
              </span>
              <button
                onClick={() => setActiveTab('deudas')}
                className="text-rose-700 hover:underline font-semibold cursor-pointer"
              >
                Pagar →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACCIÓN RECOMENDADA (¿Qué debería hacer ahora?) */}
      <section aria-labelledby="action-title" className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
              recommendedAction.tipo === 'alerta' ? 'bg-rose-100 text-rose-700' :
              recommendedAction.tipo === 'atencion' ? 'bg-amber-100 text-amber-800' :
              recommendedAction.tipo === 'positivo' ? 'bg-emerald-100 text-emerald-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                  Acción recomendada
                </span>
              </div>
              <h3 id="action-title" className="text-sm font-bold text-slate-900 mt-0.5">
                {recommendedAction.titulo}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                {recommendedAction.mensaje}
              </p>
            </div>
          </div>

          <button
            onClick={recommendedAction.accion}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>{recommendedAction.botonTexto}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 5. SECCIÓN DE GRÁFICAS: Flujo de Caja & Gastos por Categoría */}
      <section aria-labelledby="charts-title" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <h2 id="charts-title" className="sr-only">Gráficas del Dashboard</h2>
        
        {/* Gráfica 1: Flujo de caja */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Flujo de Caja (Ingresos vs Gastos)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evolución de entradas y salidas de dinero por período.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Ingresos</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Gastos</span>
              </span>
            </div>
          </div>

          <CashflowTimelineChart
            movements={movements}
            buyerSales={buyerSales}
            currencySymbol={currencySymbol}
            onOpenQuickAdd={() => onOpenQuickAdd?.()}
          />
        </div>

        {/* Gráfica 2: Gastos por categoría */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Gastos por Categoría
              </h3>
              <button
                onClick={() => setActiveTab('personales')}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Ver todos →
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              En qué rubros estás concentrando tus salidas de dinero.
            </p>

            <ExpensesCategoryDonutChart
              movements={movements}
              currencySymbol={currencySymbol}
              onOpenQuickAdd={onOpenQuickAdd}
              onNavigateTab={(tab: any) => setActiveTab(tab)}
            />
          </div>
        </div>
      </section>

      {/* 6. INFORMACIÓN SECUNDARIA PLEGABLE: Ventas, Ahorros, Inversionistas e Inversiones */}
      <section aria-labelledby="secondary-details-title" className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="secondary-details-title" className="text-sm font-bold text-slate-900">
              Ventas, Ahorros, Inversionistas e Inversiones
            </h2>
            <p className="text-xs text-slate-500">
              Módulos de negocio y patrimonio secundario.
            </p>
          </div>
          <button
            onClick={() => setShowSecondaryDetails(!showSecondaryDetails)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-expanded={showSecondaryDetails}
          >
            <span>{showSecondaryDetails ? 'Ocultar detalles' : 'Ver detalles'}</span>
            {showSecondaryDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showSecondaryDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4 mt-4 border-t border-slate-100 animate-in fade-in duration-150">
            {/* Ventas */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center gap-1.5 text-teal-800">
                    <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ventas</span>
                  </span>
                  <span className="text-[11px] font-bold text-teal-700">
                    {formatPercent(summary.margenGlobal)} margen
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {formatCurrency(summary.gananciaTotal, currencySymbol)}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ganancia neta ({buyerSales.length} pedidos)
                </p>
              </div>
              <button
                onClick={() => setActiveTab('compradores')}
                className="text-[11px] font-semibold text-teal-700 hover:underline pt-2 text-left cursor-pointer"
              >
                Gestionar ventas →
              </button>
            </div>

            {/* Ahorros */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center gap-1.5 text-emerald-800">
                    <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Metas de ahorro</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {savings.length} metas
                  </span>
                </div>
                <div className="text-lg font-bold text-emerald-800 tabular-nums">
                  {formatCurrency(summary.totalAhorros, currencySymbol)}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Apartado en cajitas y bolsillos
                </p>
              </div>
              <button
                onClick={() => setActiveTab('ahorros')}
                className="text-[11px] font-semibold text-emerald-700 hover:underline pt-2 text-left cursor-pointer"
              >
                Ver alcancías →
              </button>
            </div>

            {/* Inversionistas */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center gap-1.5 text-indigo-800">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Inversionistas</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {investors.length} socios
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {formatCurrency(summary.inversionesRecibidas, currencySymbol)}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Capital externo recibido
                </p>
              </div>
              <button
                onClick={() => setActiveTab('inversionistas')}
                className="text-[11px] font-semibold text-indigo-700 hover:underline pt-2 text-left cursor-pointer"
              >
                Ver acuerdos →
              </button>
            </div>

            {/* Inversiones Propias */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold flex items-center gap-1.5 text-violet-800">
                    <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                    <span>Mis inversiones</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {myInvestments.length} activos
                  </span>
                </div>
                <div className="text-lg font-bold text-slate-900 tabular-nums">
                  {formatCurrency(summary.valorActualMisInversiones, currencySymbol)}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Valoración actual estimada
                </p>
              </div>
              <button
                onClick={() => setActiveTab('mis_inversiones')}
                className="text-[11px] font-semibold text-violet-700 hover:underline pt-2 text-left cursor-pointer"
              >
                Ver portafolio →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
