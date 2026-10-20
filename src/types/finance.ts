export type MovementType = 'Ingreso' | 'Gasto' | 'Transferencia' | 'Ahorro';

export interface Movement {
  id: string;
  fecha: string; // YYYY-MM-DD
  tipo: MovementType;
  categoria: string;
  concepto: string;
  monto: number;
  cuenta: string; // Origen (Efectivo, Nequi, Nu, Ahorro, etc.)
  cuentaDestino?: string; // Para Transferencias
  notas?: string;
  createdAt: number;
}

export type InvestorStatus = 'Activo' | 'Liquidado' | 'En mora';

export interface Repayment {
  id: string;
  fecha: string;
  monto: number;
  cuentaOrigen?: string;
  nota?: string;
}

export interface Investor {
  id: string;
  inversionista: string; // Quién invirtió
  contacto?: string;
  fechaInicio: string;
  fechaVencimiento?: string;
  montoRecibido: number; // Cuánto te invirtió
  acuerdo: string; // Bajo qué acuerdo
  tasaRetorno?: string; // ej. 15%
  retornoPactado: number; // Monto total comprometido a devolver
  montoDevuelto: number; // Cuánto has devuelto
  repagos: Repayment[]; // Historial de devoluciones
  cuentaReceptora?: string;
  estado: InvestorStatus;
  notas?: string;
  createdAt: number;
}

export type BuyerSaleStatus = 'Pagado' | 'Parcial' | 'Pendiente';

export interface BuyerPayment {
  id: string;
  fecha: string;
  monto: number;
  cuentaDestino?: string;
  metodo?: string;
  nota?: string;
}

export interface BuyerSale {
  id: string;
  fecha: string;
  comprador: string; // Cliente
  contacto?: string;
  productoServicio: string;
  montoVendido: number; // Total vendido (precio al cliente)
  costoProducto: number; // Costo del producto vendido (lo que cobra el proveedor)
  cuentaCosto?: string; // De qué cuenta se pagó al proveedor (ej: Nequi, Nu, Bancolombia)
  costoPagado?: boolean; // ¿Ya le pagaste el producto al proveedor?
  fechaPagoCosto?: string; // Fecha en que compraste/pagaste al proveedor
  montoRecibido: number; // Pagos/abonos recibidos del cliente
  pagos: BuyerPayment[];
  metodoPago: string;
  fechaLimite?: string;
  notas?: string;
  createdAt: number;
}

export type InvestmentType = 
  | 'CDT / Renta Fija' 
  | 'Renta Variable / Acciones' 
  | 'Proyecto / Negocio Propio' 
  | 'Criptoactivos' 
  | 'Bienes Raíces' 
  | 'Préstamo a Terceros' 
  | 'Otro';

export type InvestmentStatus = 'Activa' | 'Liquidada' | 'En evaluación';

export interface MyInvestment {
  id: string;
  activoProyecto: string; // Proyecto o activo
  tipoActivo: InvestmentType;
  fechaInversion: string;
  fechaVencimiento?: string;
  montoInvertido: number; // Lo que tú has invertido
  valorActual: number; // Valor actual estimado o liquidado
  rendimientoCobrado: number; // Rendimientos ya recibidos en efectivo
  tasaEstimada?: string; // ej: 12.5% E.A.
  estado: InvestmentStatus;
  cuentaOrigen: string;
  notas?: string;
  createdAt: number;
}

export interface AccountPlace {
  id: string;
  nombre: string; // Efectivo, Nequi, Nu, Ahorro, etc.
  saldoInicial: number;
  saldoAjuste?: number; // Para conciliación manual
  color?: string;
}

export interface ConfigLists {
  categoriasIngreso: string[];
  categoriasGasto: string[];
  cuentas: string[];
  tiposInversion: InvestmentType[];
  metodosPago: string[];
}

export type DebtorStatus = 'Pendiente' | 'Parcial' | 'Cobrado' | 'En mora';

export interface DebtorPayment {
  id: string;
  fecha: string;
  monto: number;
  cuentaDestino?: string;
  metodo?: string;
  nota?: string;
}

export interface Debtor {
  id: string;
  deudor: string; // Nombre de la persona que te debe
  contacto?: string;
  concepto: string; // Motivo del préstamo o cobro
  fechaPrestamo: string;
  fechaCompromiso?: string;
  montoPrestado: number; // Monto prestado original
  interesPactado?: string; // ej: Sin interés, 3% mensual
  totalACobrar: number; // Capital + intereses si aplica
  montoAbonado: number; // Total que te ha devuelto
  abonos: DebtorPayment[];
  cuentaOrigen?: string; // De qué cuenta salió el dinero prestado
  estado: DebtorStatus;
  notas?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  nombre: string;
  color: string;
  createdAt: number;
}

export interface PeriodFilterState {
  type: 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export type SavingGoalStatus = 'En progreso' | 'Completado' | 'Pausado';

export interface SavingContribution {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  tipo: 'Aporte' | 'Retiro';
  cuentaOrigen: string; // Cuenta de donde sale el dinero (ej: Nequi, Efectivo, Nu)
  nota?: string;
  movementId?: string; // ID del movimiento generado automáticamente en Finanzas Personales
  createdAt: number;
}

export type SavingGoal = {
  id: string;
  nombre: string; // Nombre del ahorro (ej: Fondo de emergencia, Viaje, Moto)
  motivo: string; // Motivo / Razón del ahorro
  montoObjetivo?: number; // Meta monetaria opcional
  montoActual: number; // Saldo acumulado en este ahorro
  fechaInicio: string; // YYYY-MM-DD
  fechaObjetivo?: string; // YYYY-MM-DD
  cuentaPreferida?: string; // Dónde se guarda (ej: Bolsillo Nequi, Cajita Nu, Efectivo)
  color?: string; // Color personalizado del ahorro
  estado: SavingGoalStatus;
  aportes: SavingContribution[];
  notas?: string;
  createdAt: number;
};

export type DebtStatus = 'Pendiente' | 'Parcial' | 'Saldada' | 'En mora';

export interface DebtPayment {
  id: string;
  fecha: string; // YYYY-MM-DD
  monto: number;
  cuentaOrigen: string; // Cuenta de donde sale la plata para pagar (Nequi, Efectivo, Nu, Bancolombia, etc.)
  numeroCuota?: number;
  nota?: string;
  movementId?: string; // ID del movimiento de gasto creado en Finanzas Personales
  createdAt: number;
}

export interface Debt {
  id: string;
  acreedor: string; // A quién le debo (Banco, Tarjeta, Familiar, Amigo, Tienda, etc.)
  concepto: string; // Motivo o descripción de la deuda
  categoria: string; // Tarjeta de Crédito, Préstamo Bancario, Préstamo Personal, Compra a crédito, Hipoteca, etc.
  montoTotal: number; // Monto total de la deuda
  montoPagado: number; // Monto ya pagado/abonado
  fechaInicio: string; // YYYY-MM-DD
  fechaLimite?: string; // YYYY-MM-DD (fecha límite de pago o corte)
  tasaInteres?: string; // ej: 2.2% E.M., Sin intereses
  numeroCuotas?: number; // Total de cuotas pactadas (ej. 12)
  cuotasPagadas?: number; // Cuotas ya pagadas
  cuentaRecepcion?: string; // En qué cuenta recibiste el dinero prestado originalmente (opcional)
  color?: string; // Color distintivo para la tarjeta
  estado: DebtStatus;
  pagos: DebtPayment[];
  notas?: string;
  createdAt: number;
}

