import { 
  Movement, 
  Investor, 
  BuyerSale, 
  MyInvestment, 
  AccountPlace, 
  ConfigLists,
  Debtor,
  UserProfile,
  SavingGoal,
  Debt
} from '../types/finance';

export const initialConfigLists: ConfigLists = {
  categoriasIngreso: [
    'Salario / Nómina',
    'Ventas / Encargos de Clientes',
    'Anticipos y Abonos de Clientes',
    'Honorarios / Servicios',
    'Rendimientos / Dividendos',
    'Venta de Activos',
    'Otros Ingresos'
  ],
  categoriasGasto: [
    'Alimentación y Mercado',
    'Vivienda y Arriendo',
    'Servicios Públicos e Internet',
    'Transporte y Gasolina',
    'Costo de Mercancía / Proveedores (Negocio)',
    'Compras por Encargo (Clientes)',
    'Salud y Seguros',
    'Educación y Cursos',
    'Ocio y Restaurantes',
    'Ropa y Personal',
    'Suscripciones y Software',
    'Otros Gastos'
  ],
  cuentas: ['Efectivo', 'Nequi', 'Nu', 'Bancolombia', 'Daviplata'],
  tiposInversion: [
    'CDT / Renta Fija',
    'Renta Variable / Acciones',
    'Proyecto / Negocio Propio',
    'Criptoactivos',
    'Bienes Raíces',
    'Préstamo a Terceros',
    'Otro'
  ],
  metodosPago: ['Nequi', 'Nu', 'Efectivo', 'Transferencia Bancaria', 'Daviplata', 'Tarjeta de Crédito']
};

// Cuentas reales por defecto completamente limpias en 0 (El ahorro vive dentro de estas cuentas, no como banco separado)
export const initialAccounts: AccountPlace[] = [
  { id: 'acc-1', nombre: 'Efectivo', saldoInicial: 0, color: '#10B981' },
  { id: 'acc-2', nombre: 'Nequi', saldoInicial: 0, color: '#EC4899' },
  { id: 'acc-3', nombre: 'Nu', saldoInicial: 0, color: '#8B5CF6' },
  { id: 'acc-4', nombre: 'Bancolombia', saldoInicial: 0, color: '#F59E0B' },
];

// Perfil inicial único, limpio para el usuario
export const initialProfiles: UserProfile[] = [
  {
    id: 'prof-default',
    nombre: 'Mi Espacio Principal',
    color: '#0F172A',
    createdAt: Date.now()
  }
];

// Listas de datos iniciales vacías para primer ingreso limpio
export const initialMovements: Movement[] = [];
export const initialInvestors: Investor[] = [];
export const initialBuyerSales: BuyerSale[] = [];
export const initialDebtors: Debtor[] = [];
export const initialMyInvestments: MyInvestment[] = [];
export const initialSavings: SavingGoal[] = [];
export const initialDebts: Debt[] = [];

// ==========================================
// DATOS DE MUESTRA / DEMO (Opcional bajo demanda)
// ==========================================
export const sampleSavings: SavingGoal[] = [
  {
    id: 'sav-1',
    nombre: 'Fondo de Emergencia (3 Meses)',
    motivo: 'Colchón de seguridad ante imprevistos o emergencias médicas',
    montoObjetivo: 6000000,
    montoActual: 2400000,
    fechaInicio: '2026-08-01',
    fechaObjetivo: '2026-12-31',
    cuentaPreferida: 'Nu',
    color: '#10B981',
    estado: 'En progreso',
    aportes: [
      {
        id: 'sav-apt-1',
        fecha: '2026-08-15',
        monto: 1200000,
        tipo: 'Aporte',
        cuentaOrigen: 'Nu',
        nota: 'Aporte quincenal nómina',
        createdAt: 1723723200000
      },
      {
        id: 'sav-apt-2',
        fecha: '2026-09-15',
        monto: 1200000,
        tipo: 'Aporte',
        cuentaOrigen: 'Nu',
        nota: 'Segundo aporte de nómina',
        createdAt: 1726401600000
      }
    ],
    createdAt: 1722513600000
  },
  {
    id: 'sav-2',
    nombre: 'Vacaciones Fin de Año',
    motivo: 'Viaje a la playa con la familia en diciembre',
    montoObjetivo: 3500000,
    montoActual: 1500000,
    fechaInicio: '2026-09-01',
    fechaObjetivo: '2026-12-15',
    cuentaPreferida: 'Nequi',
    color: '#6366F1',
    estado: 'En progreso',
    aportes: [
      {
        id: 'sav-apt-3',
        fecha: '2026-09-20',
        monto: 1500000,
        tipo: 'Aporte',
        cuentaOrigen: 'Nequi',
        nota: 'Ahorro de comisión ventas',
        createdAt: 1726833600000
      }
    ],
    createdAt: 1725192000000
  }
];
export const sampleAccounts: AccountPlace[] = [
  { id: 'acc-1', nombre: 'Efectivo', saldoInicial: 450000, color: '#10B981' },
  { id: 'acc-2', nombre: 'Nequi', saldoInicial: 1250000, color: '#EC4899' },
  { id: 'acc-3', nombre: 'Nu', saldoInicial: 2800000, color: '#8B5CF6' },
  { id: 'acc-4', nombre: 'Bancolombia', saldoInicial: 3500000, color: '#F59E0B' },
];

export const sampleProfiles: UserProfile[] = [
  {
    id: 'prof-default',
    nombre: 'Mi Control Principal',
    color: '#0F172A',
    createdAt: 1727740800000
  },
  {
    id: 'prof-negocio',
    nombre: 'Mi Emprendimiento / Negocio',
    color: '#2563EB',
    createdAt: 1727827200000
  }
];

export const sampleMovements: Movement[] = [
  {
    id: 'mov-1',
    fecha: '2026-10-01',
    tipo: 'Ingreso',
    categoria: 'Salario / Nómina',
    concepto: 'Pago quincenal salario principal',
    monto: 3200000,
    cuenta: 'Nu',
    notas: 'Depósito directo de nómina',
    createdAt: 1727740800000,
  },
  {
    id: 'mov-2',
    fecha: '2026-10-02',
    tipo: 'Ahorro',
    categoria: 'Ahorro Fondo',
    concepto: 'Ahorro programado para fondo de emergencia',
    monto: 600000,
    cuenta: 'Nu',
    notas: 'Apartado en cajita/bolsillo de ahorro dentro de Nu',
    createdAt: 1727827200000,
  },
  {
    id: 'mov-3',
    fecha: '2026-10-03',
    tipo: 'Gasto',
    categoria: 'Vivienda y Arriendo',
    concepto: 'Pago mensual de canon de arriendo',
    monto: 1100000,
    cuenta: 'Nu',
    notas: 'Transferencia con comprobante',
    createdAt: 1727913600000,
  },
  {
    id: 'mov-4',
    fecha: '2026-10-05',
    tipo: 'Gasto',
    categoria: 'Alimentación y Mercado',
    concepto: 'Mercado quincenal supermercado',
    monto: 420000,
    cuenta: 'Nequi',
    notas: 'Compras para el hogar',
    createdAt: 1728086400000,
  },
  {
    id: 'mov-5',
    fecha: '2026-10-07',
    tipo: 'Transferencia',
    categoria: 'Transferencia entre cuentas',
    concepto: 'Paso de Nu a Nequi para gastos diarios',
    monto: 300000,
    cuenta: 'Nu',
    cuentaDestino: 'Nequi',
    notas: 'Recarga saldo Nequi',
    createdAt: 1728259200000,
  },
  {
    id: 'mov-6',
    fecha: '2026-10-08',
    tipo: 'Gasto',
    categoria: 'Servicios Públicos e Internet',
    concepto: 'Servicios luz, agua y fibra óptica',
    monto: 215000,
    cuenta: 'Nequi',
    notas: 'Factura pagada en línea',
    createdAt: 1728345600000,
  },
  {
    id: 'mov-7',
    fecha: '2026-10-10',
    tipo: 'Ingreso',
    categoria: 'Honorarios / Servicios',
    concepto: 'Consultoría y desarrollo freelance',
    monto: 950000,
    cuenta: 'Nequi',
    notas: 'Cliente externo diseño web',
    createdAt: 1728518400000,
  },
  {
    id: 'mov-8',
    fecha: '2026-10-11',
    tipo: 'Gasto',
    categoria: 'Transporte y Gasolina',
    concepto: 'Gasolina y peajes fin de semana',
    monto: 130000,
    cuenta: 'Efectivo',
    notas: 'Estación de servicio',
    createdAt: 1728604800000,
  }
];

export const sampleInvestors: Investor[] = [
  {
    id: 'inv-1',
    inversionista: 'Carlos Mendoza',
    contacto: '+57 315 889 4421 · carlos@mendoza.co',
    fechaInicio: '2026-08-15',
    fechaVencimiento: '2026-12-15',
    montoRecibido: 10000000,
    acuerdo: 'Capital de trabajo para inventario',
    cuentaReceptora: 'Nu',
    retornoPactado: 12500000,
    montoDevuelto: 4500000,
    estado: 'Activo',
    notas: 'Ronda de expansión de inventario de fin de año',
    createdAt: 1723680000000,
    repagos: [
      {
        id: 'rep-1',
        fecha: '2026-09-15',
        monto: 2500000,
        cuentaOrigen: 'Nu',
        nota: 'Primera cuota acordada'
      },
      {
        id: 'rep-2',
        fecha: '2026-10-10',
        monto: 2000000,
        cuentaOrigen: 'Nu',
        nota: 'Segunda cuota acordada'
      }
    ]
  },
  {
    id: 'inv-2',
    inversionista: 'Valeria Restrepo',
    contacto: '+57 301 234 5678',
    fechaInicio: '2026-07-01',
    fechaVencimiento: '2026-09-30',
    montoRecibido: 5000000,
    acuerdo: 'Pagaré a 90 días con rendimiento fijo',
    cuentaReceptora: 'Nu',
    retornoPactado: 5600000,
    montoDevuelto: 5600000,
    estado: 'Liquidado',
    notas: 'Inversión de corto plazo liquidada con éxito',
    createdAt: 1719792000000,
    repagos: [
      {
        id: 'rep-3',
        fecha: '2026-09-28',
        monto: 5600000,
        cuentaOrigen: 'Nu',
        nota: 'Pago total del capital más rendimiento'
      }
    ]
  },
  {
    id: 'inv-3',
    inversionista: 'Fondo Semilla Emprender',
    contacto: 'contacto@fondosemilla.co',
    fechaInicio: '2026-09-01',
    fechaVencimiento: '2026-11-30',
    montoRecibido: 8000000,
    acuerdo: 'Mutuo comercial a 3 meses',
    cuentaReceptora: 'Ahorro',
    retornoPactado: 9200000,
    montoDevuelto: 0,
    estado: 'Activo',
    notas: 'Inversión para capital de trabajo de temporada',
    createdAt: 1725148800000,
    repagos: []
  }
];

export const sampleBuyerSales: BuyerSale[] = [
  {
    id: 'buy-1',
    fecha: '2026-10-02',
    comprador: 'Distribuidora Los Andes',
    contacto: '+57 312 900 1122',
    productoServicio: 'Lote de 20 Smartwatches Serie X',
    montoVendido: 4800000,
    costoProducto: 3100000,
    montoRecibido: 3500000,
    metodoPago: 'Transferencia Bancaria',
    fechaLimite: '2026-10-25',
    notas: 'Saldo restante pactado para pago a 30 días',
    createdAt: 1727827200000,
    pagos: [
      {
        id: 'p-1',
        fecha: '2026-10-02',
        monto: 2000000,
        metodo: 'Transferencia',
        cuentaDestino: 'Nu',
        nota: 'Anticipo inicial del 40%'
      },
      {
        id: 'p-2',
        fecha: '2026-10-09',
        monto: 1500000,
        metodo: 'Transferencia',
        cuentaDestino: 'Nu',
        nota: 'Abono contra entrega de lote'
      }
    ]
  },
  {
    id: 'buy-2',
    fecha: '2026-10-05',
    comprador: 'Mariana Gómez',
    contacto: '+57 320 671 2233',
    productoServicio: 'Paquete de Asesoría de Marca y Diseño',
    montoVendido: 1800000,
    costoProducto: 400000,
    montoRecibido: 1800000,
    metodoPago: 'Nequi',
    fechaLimite: '2026-10-05',
    notas: 'Cancelado en su totalidad al inicio del proyecto',
    createdAt: 1728086400000,
    pagos: [
      {
        id: 'p-3',
        fecha: '2026-10-05',
        monto: 1800000,
        metodo: 'Nequi',
        cuentaDestino: 'Nequi',
        nota: 'Pago 100% de contado'
      }
    ]
  },
  {
    id: 'buy-3',
    fecha: '2026-10-08',
    comprador: 'Tech Solutions SAS',
    contacto: 'compras@techsolutions.com',
    productoServicio: '5 Licencias corporativas y configuración cloud',
    montoVendido: 3600000,
    costoProducto: 1900000,
    montoRecibido: 1200000,
    metodoPago: 'Transferencia Bancaria',
    fechaLimite: '2026-10-30',
    notas: 'Pendiente pago final tras entrega de acta',
    createdAt: 1728345600000,
    pagos: [
      {
        id: 'p-4',
        fecha: '2026-10-08',
        monto: 1200000,
        metodo: 'Transferencia Bancaria',
        cuentaDestino: 'Nu',
        nota: 'Anticipo 33%'
      }
    ]
  }
];

export const sampleMyInvestments: MyInvestment[] = [
  {
    id: 'inv-prop-1',
    activoProyecto: 'CDT Bancolombia Rentable',
    tipoActivo: 'CDT / Renta Fija',
    fechaInversion: '2026-05-10',
    fechaVencimiento: '2026-11-10',
    montoInvertido: 4000000,
    valorActual: 4280000,
    rendimientoCobrado: 0,
    tasaEstimada: '14.2% E.A.',
    estado: 'Activa',
    cuentaOrigen: 'Ahorro',
    notas: 'Vence en noviembre con capitalización automática',
    createdAt: 1715299200000
  },
  {
    id: 'inv-prop-2',
    activoProyecto: 'Franquicia Cafetería Urbana',
    tipoActivo: 'Proyecto / Negocio Propio',
    fechaInversion: '2026-06-15',
    montoInvertido: 8000000,
    valorActual: 8000000,
    rendimientoCobrado: 1150000,
    tasaEstimada: 'Reparto mensual de utilidades 5%',
    estado: 'Activa',
    cuentaOrigen: 'Ahorro',
    notas: 'Aporte de capital para adquisición de máquina espresso y punto de venta',
    createdAt: 1718409600000
  }
];

export const sampleDebtors: Debtor[] = [
  {
    id: 'deb-1',
    deudor: 'Alejandro Morales',
    contacto: '+57 311 450 7890 · alejo@correo.com',
    concepto: 'Préstamo personal para reparación vehículo',
    fechaPrestamo: '2026-09-12',
    fechaCompromiso: '2026-11-12',
    montoPrestado: 1500000,
    interesPactado: 'Sin interés (amigo)',
    totalACobrar: 1500000,
    montoAbonado: 600000,
    cuentaOrigen: 'Nequi',
    estado: 'Parcial',
    notas: 'Prometió pagar la segunda mitad a fin de mes',
    createdAt: 1726142400000,
    abonos: [
      {
        id: 'deb-p-1',
        fecha: '2026-10-01',
        monto: 600000,
        cuentaDestino: 'Nequi',
        metodo: 'Nequi',
        nota: 'Primer abono de quincena'
      }
    ]
  },
  {
    id: 'deb-2',
    deudor: 'Felipe Sandoval',
    contacto: '+57 318 902 3344',
    concepto: 'Adelanto asumido por compra de insumos compartidos',
    fechaPrestamo: '2026-10-04',
    fechaCompromiso: '2026-10-20',
    montoPrestado: 850000,
    interesPactado: 'Sin interés',
    totalACobrar: 850000,
    montoAbonado: 0,
    cuentaOrigen: 'Nu',
    estado: 'Pendiente',
    notas: 'Pendiente reembolso de compra conjunta',
    createdAt: 1728043200000,
    abonos: []
  }
];

export const sampleDebts: Debt[] = [
  {
    id: 'debt-1',
    acreedor: 'Tarjeta Bancolombia Visa Gold',
    concepto: 'Compra computador para trabajo y desarrollo',
    categoria: 'Tarjeta de Crédito',
    montoTotal: 4200000,
    montoPagado: 1400000,
    fechaInicio: '2026-07-15',
    fechaLimite: '2026-11-20',
    tasaInteres: '2.1% E.M.',
    numeroCuotas: 6,
    cuotasPagadas: 2,
    color: '#F59E0B',
    estado: 'Parcial',
    notas: 'Día de corte 15 de cada mes. Fecha límite de pago el 20.',
    createdAt: 1721044800000,
    pagos: [
      {
        id: 'dp-1',
        fecha: '2026-08-19',
        monto: 700000,
        cuentaOrigen: 'Bancolombia',
        numeroCuota: 1,
        nota: 'Cuota 1 de 6',
        createdAt: 1724083200000
      },
      {
        id: 'dp-2',
        fecha: '2026-09-19',
        monto: 700000,
        cuentaOrigen: 'Nequi',
        numeroCuota: 2,
        nota: 'Cuota 2 de 6',
        createdAt: 1726761600000
      }
    ]
  },
  {
    id: 'debt-2',
    acreedor: 'Préstamo Familiar (Tío Carlos)',
    concepto: 'Apoyo para capital de trabajo de temporada',
    categoria: 'Préstamo Personal',
    montoTotal: 2500000,
    montoPagado: 1000000,
    fechaInicio: '2026-08-10',
    fechaLimite: '2026-12-15',
    tasaInteres: 'Sin interés',
    numeroCuotas: 5,
    cuotasPagadas: 2,
    color: '#8B5CF6',
    estado: 'Parcial',
    notas: 'Acuerdo de pago flexible antes de diciembre.',
    createdAt: 1723291200000,
    pagos: [
      {
        id: 'dp-3',
        fecha: '2026-09-10',
        monto: 500000,
        cuentaOrigen: 'Nu',
        numeroCuota: 1,
        nota: 'Primer abono pactado',
        createdAt: 1725984000000
      },
      {
        id: 'dp-4',
        fecha: '2026-10-10',
        monto: 500000,
        cuentaOrigen: 'Nequi',
        numeroCuota: 2,
        nota: 'Segundo abono pactado',
        createdAt: 1728576000000
      }
    ]
  }
];
