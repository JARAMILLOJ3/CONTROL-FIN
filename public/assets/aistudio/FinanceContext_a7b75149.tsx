import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Movement, 
  Investor, 
  BuyerSale, 
  MyInvestment, 
  AccountPlace, 
  ConfigLists, 
  PeriodFilterState, 
  Repayment, 
  BuyerPayment, 
  Debtor, 
  DebtorPayment, 
  UserProfile,
  SavingGoal,
  SavingContribution,
  SavingGoalStatus,
  Debt,
  DebtPayment,
  DebtStatus,
  InvestorStatus,
  DebtorStatus
} from '../types/finance';
import { 
  initialMovements, 
  initialInvestors, 
  initialBuyerSales, 
  initialMyInvestments, 
  initialAccounts, 
  initialConfigLists, 
  initialProfiles, 
  initialDebtors,
  initialSavings,
  initialDebts,
  sampleMovements,
  sampleInvestors,
  sampleBuyerSales,
  sampleDebtors,
  sampleMyInvestments,
  sampleAccounts,
  sampleSavings,
  sampleDebts
} from '../data/initialData';
import { useAuth } from './AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface FinanceSummary {
  ingresosRegistrados: number;
  gastosRegistrados: number;
  balance: number;
  porCobrarCompradores: number;
  porCobrarDeudores: number;
  totalPorCobrarGlobal: number;
  totalPrestadoDeudores: number;
  totalAbonadoDeudores: number;
  inversionesRecibidas: number;
  saldoPendienteInversionistas: number;
  misInversiones: number;
  valorActualMisInversiones: number;
  rendimientoTotalInversiones: number;
  ingresosPersonales: number;
  gastosPersonales: number;
  disponibleSegunMovimientos: number;
  ahorroRegistrado: number;
  totalAhorros: number;
  metasAhorroActivas: number;
  totalDeudas: number;
  totalPagadoDeudas: number;
  saldoPendienteDeudas: number;
  deudasActivas: number;
  totalVendido: number;
  costoTotalProductos: number;
  gananciaTotal: number;
  margenGlobal: number;
  saldoPorCobrar: number;
  saldosPorLugar: Record<string, number>;
  ahorrosPorCuenta: Record<string, number>;
  disponiblePorCuenta: Record<string, number>;
  totalEnCuentas: number;
  totalDisponible: number;
}

export type ActiveTabType = 
  | 'resumen' 
  | 'personales' 
  | 'ahorros'
  | 'deudas'
  | 'inversionistas' 
  | 'compradores' 
  | 'deudores' 
  | 'mis_inversiones' 
  | 'cuentas' 
  | 'listas';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'local_only';

interface FinanceContextType {
  // Profiles
  profiles: UserProfile[];
  currentProfileId: string;
  currentProfile: UserProfile;
  addProfile: (nombre: string, color?: string) => string;
  switchProfile: (profileId: string) => void;
  renameProfile: (profileId: string, nombre: string) => void;
  deleteProfile: (profileId: string) => void;

  // Cloud Sync
  cloudSyncStatus: CloudSyncStatus;
  syncToCloudNow: () => Promise<void>;

  // State
  movements: Movement[];
  investors: Investor[];
  buyerSales: BuyerSale[];
  debtors: Debtor[];
  myInvestments: MyInvestment[];
  savings: SavingGoal[];
  debts: Debt[];
  accounts: AccountPlace[];
  configLists: ConfigLists;
  periodFilter: PeriodFilterState;
  activeTab: ActiveTabType;
  currencySymbol: string;

  // Setters & Tab
  setActiveTab: (tab: ActiveTabType) => void;
  setPeriodFilter: (filter: PeriodFilterState) => void;
  setCurrencySymbol: (symbol: string) => void;

  // Summary computed
  summary: FinanceSummary;

  // Movement CRUD
  addMovement: (movement: Omit<Movement, 'id' | 'createdAt'>) => void;
  updateMovement: (id: string, movement: Partial<Movement>) => void;
  deleteMovement: (id: string) => void;

  // Investor CRUD & Repayments
  addInvestor: (investor: Omit<Investor, 'id' | 'createdAt' | 'montoDevuelto' | 'repagos'>) => void;
  updateInvestor: (id: string, investor: Partial<Investor>) => void;
  deleteInvestor: (id: string) => void;
  addRepayment: (investorId: string, repayment: Omit<Repayment, 'id'>) => void;
  deleteRepayment: (investorId: string, repaymentId: string) => void;

  addBuyerSale: (
    sale: Omit<BuyerSale, 'id' | 'createdAt' | 'montoRecibido' | 'pagos'>,
    initialPayment?: {
      monto: number;
      fecha?: string;
      cuentaDestino: string;
      metodo?: string;
      nota?: string;
    }
  ) => void;
  updateBuyerSale: (id: string, sale: Partial<BuyerSale>) => void;
  deleteBuyerSale: (id: string) => void;
  addBuyerPayment: (saleId: string, payment: Omit<BuyerPayment, 'id'>) => void;
  deleteBuyerPayment: (saleId: string, paymentId: string) => void;

  // Debtor CRUD & Abonos
  addDebtor: (debtor: Omit<Debtor, 'id' | 'createdAt' | 'montoAbonado' | 'abonos'>) => void;
  updateDebtor: (id: string, debtor: Partial<Debtor>) => void;
  deleteDebtor: (id: string) => void;
  addDebtorPayment: (debtorId: string, payment: Omit<DebtorPayment, 'id'>) => void;
  deleteDebtorPayment: (debtorId: string, paymentId: string) => void;

  // MyInvestment CRUD
  addMyInvestment: (inv: Omit<MyInvestment, 'id' | 'createdAt'>) => void;
  updateMyInvestment: (id: string, inv: Partial<MyInvestment>) => void;
  deleteMyInvestment: (id: string) => void;

  // Savings Goals & Contributions
  addSavingGoal: (goal: Omit<SavingGoal, 'id' | 'createdAt' | 'montoActual' | 'aportes'>) => string;
  updateSavingGoal: (id: string, goal: Partial<SavingGoal>) => void;
  deleteSavingGoal: (id: string) => void;
  addSavingContribution: (goalId: string, contribution: {
    monto: number;
    fecha: string;
    tipo: 'Aporte' | 'Retiro';
    cuentaOrigen: string;
    nota?: string;
  }) => void;
  deleteSavingContribution: (goalId: string, contributionId: string) => void;

  // Debts (Mis Deudas / Pasivos) CRUD & Payments
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'montoPagado' | 'pagos'>) => string;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addDebtPayment: (debtId: string, payment: {
    fecha: string;
    monto: number;
    cuentaOrigen: string;
    numeroCuota?: number;
    nota?: string;
    registrarComoMovimiento?: boolean;
  }) => void;
  deleteDebtPayment: (debtId: string, paymentId: string) => void;

  // Accounts & Lists Management
  updateAccountInitialBalance: (id: string, balance: number) => void;
  addAccount: (nombre: string, saldoInicial: number, color?: string) => void;
  deleteAccount: (id: string) => void;
  updateConfigLists: (lists: Partial<ConfigLists>) => void;

  // Reset & Backup
  resetToSampleData: () => void;
  clearAllData: () => void;
  importJsonData: (data: unknown) => boolean;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'control_financiero_app_data_v3';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('local_only');
  const isIncomingFromCloud = useRef(false);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Profiles state
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_profiles`);
      return saved ? JSON.parse(saved) : initialProfiles;
    } catch {
      return initialProfiles;
    }
  });

  const [currentProfileId, setCurrentProfileId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currentProfileId`);
      return saved || (initialProfiles[0]?.id || 'prof-default');
    } catch {
      return 'prof-default';
    }
  });

  // Helper to load profile-scoped storage
  const loadScopedData = useCallback(<T,>(keySuffix: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${currentProfileId}_${keySuffix}`);
      if (saved) return JSON.parse(saved);
      return fallback;
    } catch {
      return fallback;
    }
  }, [currentProfileId]);

  const [movements, setMovements] = useState<Movement[]>(() => 
    loadScopedData('movements', initialMovements)
  );

  const [investors, setInvestors] = useState<Investor[]>(() => 
    loadScopedData('investors', initialInvestors)
  );

  const [buyerSales, setBuyerSales] = useState<BuyerSale[]>(() => 
    loadScopedData('buyerSales', initialBuyerSales)
  );

  const [debtors, setDebtors] = useState<Debtor[]>(() => 
    loadScopedData('debtors', initialDebtors)
  );

  const [myInvestments, setMyInvestments] = useState<MyInvestment[]>(() => 
    loadScopedData('myInvestments', initialMyInvestments)
  );

  const [savings, setSavings] = useState<SavingGoal[]>(() => 
    loadScopedData('savings', initialSavings)
  );

  const [debts, setDebts] = useState<Debt[]>(() => {
    const raw = loadScopedData('debts', initialDebts);
    return (raw || []).map(d => ({
      ...d,
      pagos: Array.isArray(d.pagos) ? d.pagos : [],
      montoTotal: Number(d.montoTotal || 0),
      montoPagado: Number(d.montoPagado || 0)
    }));
  });

  const [accounts, setAccounts] = useState<AccountPlace[]>(() => {
    const raw = loadScopedData('accounts', initialAccounts);
    const filtered = (raw || []).filter(a => a?.nombre && !a.nombre.toLowerCase().trim().startsWith('ahorro'));
    return filtered.length > 0 ? filtered : initialAccounts;
  });

  const [configLists, setConfigLists] = useState<ConfigLists>(() => {
    const raw = loadScopedData('configLists', initialConfigLists);
    const rawCuentas = (raw?.cuentas && Array.isArray(raw.cuentas) && raw.cuentas.length > 0)
      ? raw.cuentas.filter(c => !c.toLowerCase().trim().startsWith('ahorro'))
      : initialConfigLists.cuentas;
    return {
      ...initialConfigLists,
      ...(raw || {}),
      cuentas: rawCuentas.length > 0 ? rawCuentas : initialConfigLists.cuentas,
      metodosPago: (raw?.metodosPago && Array.isArray(raw.metodosPago) && raw.metodosPago.length > 0) ? raw.metodosPago : initialConfigLists.metodosPago
    };
  });

  const [currencySymbol, setCurrencySymbol] = useState<string>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY}_currency`) || '$';
    } catch {
      return '$';
    }
  });

  const [periodFilter, setPeriodFilter] = useState<PeriodFilterState>({ type: 'all' });
  const [activeTab, setActiveTab] = useState<ActiveTabType>('resumen');

  // Persistence of profiles list and active profile id locally
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currentProfileId`, currentProfileId);
  }, [currentProfileId]);

  // Persist scoped data whenever they change locally
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(movements));
  }, [movements, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(investors));
  }, [investors, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(buyerSales));
  }, [buyerSales, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(debtors));
  }, [debtors, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify(myInvestments));
  }, [myInvestments, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(savings));
  }, [savings, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(debts));
  }, [debts, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(accounts));
  }, [accounts, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_configLists`, JSON.stringify(configLists));
  }, [configLists, currentProfileId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_currency`, currencySymbol);
  }, [currencySymbol]);

  // State ref to keep latest values without triggering dependency cycles
  const stateRef = useRef({
    movements,
    investors,
    buyerSales,
    debtors,
    myInvestments,
    savings,
    debts,
    accounts,
    configLists,
    profiles,
    currentProfileId,
    currencySymbol
  });

  useEffect(() => {
    stateRef.current = {
      movements,
      investors,
      buyerSales,
      debtors,
      myInvestments,
      savings,
      debts,
      accounts,
      configLists,
      profiles,
      currentProfileId,
      currencySymbol
    };
  }, [movements, investors, buyerSales, debtors, myInvestments, savings, debts, accounts, configLists, profiles, currentProfileId, currencySymbol]);

  // Helper to record local edit timestamp
  const recordLocalUpdate = useCallback(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_lastLocalUpdate`, String(Date.now()));
    } catch {}
  }, []);

  // --- FIRESTORE CLOUD SYNCHRONIZATION ---
  const pushToCloud = useCallback(async (customPayload?: Record<string, unknown>) => {
    if (!user?.uid) {
      setCloudSyncStatus('local_only');
      return;
    }
    const userId = user.uid;
    const path = `users/${userId}/finance/data`;

    try {
      setCloudSyncStatus('syncing');
      const current = stateRef.current;
      const payload = {
        userId,
        ...current,
        ...(customPayload || {}),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userId, 'finance', 'data'), payload);
      setCloudSyncStatus('synced');
    } catch (err) {
      setCloudSyncStatus('offline');
      console.warn('Error saving to cloud:', err);
    }
  }, [user?.uid]);

  const triggerFastCloudSync = useCallback((immediate = false) => {
    recordLocalUpdate();
    if (!user?.uid) return;

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    if (immediate) {
      pushToCloud();
    } else {
      syncTimerRef.current = setTimeout(() => {
        pushToCloud();
      }, 180);
    }
  }, [user?.uid, pushToCloud, recordLocalUpdate]);

  const syncToCloudNow = useCallback(async () => {
    await pushToCloud();
  }, [pushToCloud]);

  // Flush to cloud when closing or hiding app in iOS Safari / PWA
  useEffect(() => {
    const handleFlush = () => {
      if (document.visibilityState === 'hidden' && user?.uid) {
        pushToCloud();
      }
    };
    window.addEventListener('pagehide', handleFlush);
    document.addEventListener('visibilitychange', handleFlush);
    window.addEventListener('beforeunload', handleFlush);

    return () => {
      window.removeEventListener('pagehide', handleFlush);
      document.removeEventListener('visibilitychange', handleFlush);
      window.removeEventListener('beforeunload', handleFlush);
    };
  }, [user?.uid, pushToCloud]);

  // Listen to Firestore changes strictly when authenticated user ID changes
  useEffect(() => {
    if (!user?.uid) {
      setCloudSyncStatus('local_only');
      return;
    }

    const userId = user.uid;
    const path = `users/${userId}/finance/data`;
    setCloudSyncStatus('syncing');

    // Create or update user profile document
    setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: user.email || '',
      displayName: user.displayName || 'Usuario',
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString()
    }, { merge: true }).catch(err => {
      console.warn('Profile update warn:', err);
    });

    const unsubscribe = onSnapshot(doc(db, 'users', userId, 'finance', 'data'), (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        const cloudTimestamp = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0;
        const localTimestamp = Number(localStorage.getItem(`${STORAGE_KEY}_lastLocalUpdate`) || '0');

        // PREVENT DATA LOSS: If local edits were made after the cloud snapshot, NEVER overwrite local data!
        // Instead, preserve local state and push it to cloud.
        if (localTimestamp > cloudTimestamp + 2000) {
          console.log('Local changes are newer than cloud snapshot. Preserving local state.');
          pushToCloud();
          return;
        }

        isIncomingFromCloud.current = true;
        if (Array.isArray(cloudData.movements)) {
          setMovements(cloudData.movements);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(cloudData.movements));
        }
        if (Array.isArray(cloudData.investors)) {
          setInvestors(cloudData.investors);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(cloudData.investors));
        }
        if (Array.isArray(cloudData.buyerSales)) {
          setBuyerSales(cloudData.buyerSales);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(cloudData.buyerSales));
        }
        if (Array.isArray(cloudData.debtors)) {
          setDebtors(cloudData.debtors);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(cloudData.debtors));
        }
        if (Array.isArray(cloudData.myInvestments)) {
          setMyInvestments(cloudData.myInvestments);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify(cloudData.myInvestments));
        }
        if (Array.isArray(cloudData.savings)) {
          setSavings(cloudData.savings);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(cloudData.savings));
        }
        if (Array.isArray(cloudData.debts)) {
          const sanitizedDebts = cloudData.debts.map((d: any) => ({
            ...d,
            pagos: Array.isArray(d.pagos) ? d.pagos : [],
            montoTotal: Number(d.montoTotal || 0),
            montoPagado: Number(d.montoPagado || 0)
          }));
          setDebts(sanitizedDebts);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(sanitizedDebts));
        }
        if (Array.isArray(cloudData.accounts)) {
          const sanitizedAccounts = cloudData.accounts.filter(a => a?.nombre && !a.nombre.toLowerCase().trim().startsWith('ahorro'));
          const finalAccounts = sanitizedAccounts.length > 0 ? sanitizedAccounts : initialAccounts;
          setAccounts(finalAccounts);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(finalAccounts));
        }
        if (cloudData.configLists) {
          const rawCuentas = (cloudData.configLists.cuentas && Array.isArray(cloudData.configLists.cuentas) && cloudData.configLists.cuentas.length > 0)
            ? cloudData.configLists.cuentas.filter((c: string) => !c.toLowerCase().trim().startsWith('ahorro'))
            : initialConfigLists.cuentas;
          const mergedConfig: ConfigLists = {
            ...initialConfigLists,
            ...cloudData.configLists,
            cuentas: rawCuentas.length > 0 ? rawCuentas : initialConfigLists.cuentas,
            metodosPago: (cloudData.configLists.metodosPago && Array.isArray(cloudData.configLists.metodosPago) && cloudData.configLists.metodosPago.length > 0)
              ? cloudData.configLists.metodosPago
              : initialConfigLists.metodosPago
          };
          setConfigLists(mergedConfig);
          localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_configLists`, JSON.stringify(mergedConfig));
        }
        if (Array.isArray(cloudData.profiles)) {
          setProfiles(cloudData.profiles);
          localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(cloudData.profiles));
        }
        if (cloudData.currentProfileId) {
          setCurrentProfileId(cloudData.currentProfileId);
          localStorage.setItem(`${STORAGE_KEY}_currentProfileId`, cloudData.currentProfileId);
        }
        if (cloudData.currencySymbol) {
          setCurrencySymbol(cloudData.currencySymbol);
          localStorage.setItem(`${STORAGE_KEY}_currency`, cloudData.currencySymbol);
        }

        setCloudSyncStatus('synced');
        setTimeout(() => {
          isIncomingFromCloud.current = false;
        }, 300);
      } else {
        // Document doesn't exist yet: save current local data to cloud as initial seed
        pushToCloud();
      }
    }, (error) => {
      setCloudSyncStatus('offline');
      console.warn('onSnapshot error:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, currentProfileId, pushToCloud]);

  // Switch Profile logic
  const switchProfile = (profileId: string) => {
    if (profileId === currentProfileId) return;

    try {
      const getTargetData = <T,>(suffix: string, fallback: T): T => {
        const item = localStorage.getItem(`${STORAGE_KEY}_${profileId}_${suffix}`);
        return item ? JSON.parse(item) : fallback;
      };

      setCurrentProfileId(profileId);
      setMovements(getTargetData('movements', []));
      setInvestors(getTargetData('investors', []));
      setBuyerSales(getTargetData('buyerSales', []));
      setDebtors(getTargetData('debtors', []));
      setMyInvestments(getTargetData('myInvestments', []));
      setSavings(getTargetData('savings', []));
      setDebts(getTargetData('debts', []));
      setAccounts(getTargetData('accounts', initialAccounts));
      setConfigLists(getTargetData('configLists', initialConfigLists));
      triggerFastCloudSync(true);
    } catch {
      setCurrentProfileId(profileId);
    }
  };

  const addProfile = (nombre: string, color?: string): string => {
    const newId = `prof-${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      nombre,
      color: color || '#2563EB',
      createdAt: Date.now()
    };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(updated));

    localStorage.setItem(`${STORAGE_KEY}_${newId}_movements`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_investors`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_buyerSales`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_debtors`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_myInvestments`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_savings`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_debts`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_accounts`, JSON.stringify(initialAccounts));
    localStorage.setItem(`${STORAGE_KEY}_${newId}_configLists`, JSON.stringify(initialConfigLists));

    switchProfile(newId);
    return newId;
  };

  const renameProfile = (profileId: string, nombre: string) => {
    const updated = profiles.map(p => p.id === profileId ? { ...p, nombre } : p);
    setProfiles(updated);
    localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(updated));
    triggerFastCloudSync(true);
  };

  const deleteProfile = async (profileId: string) => {
    if (profiles.length <= 1) return;
    const remaining = profiles.filter(p => p.id !== profileId);
    setProfiles(remaining);
    localStorage.setItem(`${STORAGE_KEY}_profiles`, JSON.stringify(remaining));

    ['movements', 'investors', 'buyerSales', 'debtors', 'myInvestments', 'savings', 'debts', 'accounts', 'configLists'].forEach(suffix => {
      localStorage.removeItem(`${STORAGE_KEY}_${profileId}_${suffix}`);
    });

    if (currentProfileId === profileId) {
      switchProfile(remaining[0].id);
    } else {
      triggerFastCloudSync(true);
    }
  };

  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === currentProfileId) || profiles[0] || {
      id: 'prof-default',
      nombre: 'Mi Control Principal',
      color: '#0F172A',
      createdAt: Date.now()
    };
  }, [profiles, currentProfileId]);

  // Date checker for period filter
  const isDateInPeriod = (dateStr: string) => {
    if (periodFilter.type === 'all' || !dateStr) return true;
    const date = new Date(dateStr);
    const now = new Date();
    
    if (periodFilter.type === 'this_month') {
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }
    if (periodFilter.type === 'last_month') {
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return date.getFullYear() === year && date.getMonth() === lastMonth;
    }
    if (periodFilter.type === 'this_year') {
      return date.getFullYear() === now.getFullYear();
    }
    if (periodFilter.type === 'custom') {
      if (periodFilter.startDate && dateStr < periodFilter.startDate) return false;
      if (periodFilter.endDate && dateStr > periodFilter.endDate) return false;
      return true;
    }
    return true;
  };

  // Summary calculation
  const summary: FinanceSummary = useMemo(() => {
    const filteredMovements = movements.filter(m => isDateInPeriod(m.fecha));
    const filteredInvestors = investors.filter(i => isDateInPeriod(i.fechaInicio));
    const filteredBuyerSales = buyerSales.filter(b => isDateInPeriod(b.fecha));
    const filteredDebtors = debtors.filter(d => isDateInPeriod(d.fechaPrestamo));
    const filteredMyInvestments = myInvestments.filter(i => isDateInPeriod(i.fechaInversion));

    // Personal Finances Totals
    let ingresosPersonales = 0;
    let gastosPersonales = 0;
    let ahorroRegistrado = 0;

    filteredMovements.forEach(m => {
      const amt = Number(m.monto || 0);
      if (m.tipo === 'Ingreso') ingresosPersonales += amt;
      else if (m.tipo === 'Gasto') gastosPersonales += amt;
      else if (m.tipo === 'Ahorro') ahorroRegistrado += amt;
    });

    const ingresosRegistrados = ingresosPersonales;
    const gastosRegistrados = gastosPersonales;
    const balance = ingresosRegistrados - gastosRegistrados;
    const disponibleSegunMovimientos = ingresosPersonales - gastosPersonales;

    // Inversionistas
    let inversionesRecibidas = 0;
    let saldoPendienteInversionistas = 0;
    filteredInvestors.forEach(inv => {
      inversionesRecibidas += Number(inv.montoRecibido || 0);
      const comprometido = Number(inv.retornoPactado || inv.montoRecibido || 0);
      const devuelto = Number(inv.montoDevuelto || 0);
      saldoPendienteInversionistas += Math.max(0, comprometido - devuelto);
    });

    // Compradores
    let totalVendido = 0;
    let costoTotalProductos = 0;
    let totalCobradoCompradores = 0;
    filteredBuyerSales.forEach(sale => {
      totalVendido += Number(sale.montoVendido || 0);
      costoTotalProductos += Number(sale.costoProducto || 0);
      totalCobradoCompradores += Number(sale.montoRecibido || 0);
    });
    const gananciaTotal = totalVendido - costoTotalProductos;
    const margenGlobal = totalVendido > 0 ? (gananciaTotal / totalVendido) * 100 : 0;
    const saldoPorCobrar = Math.max(0, totalVendido - totalCobradoCompradores);

    // Deudores
    let totalPrestadoDeudores = 0;
    let totalAbonadoDeudores = 0;
    filteredDebtors.forEach(debtor => {
      totalPrestadoDeudores += Number(debtor.totalACobrar || debtor.montoPrestado || 0);
      totalAbonadoDeudores += Number(debtor.montoAbonado || 0);
    });
    const porCobrarDeudores = Math.max(0, totalPrestadoDeudores - totalAbonadoDeudores);
    const totalPorCobrarGlobal = saldoPorCobrar + porCobrarDeudores;

    // Mis Inversiones
    let misInversiones = 0;
    let valorActualMisInversiones = 0;
    let rendimientoTotalInversiones = 0;
    filteredMyInvestments.forEach(inv => {
      misInversiones += Number(inv.montoInvertido || 0);
      valorActualMisInversiones += Number(inv.valorActual || inv.montoInvertido || 0);
      rendimientoTotalInversiones += Number(inv.rendimientoCobrado || 0);
    });

    // Cuentas / Dinero Disponible Real
    const saldosPorLugar: Record<string, number> = {};
    accounts.forEach(acc => {
      saldosPorLugar[acc.nombre] = Number(acc.saldoInicial || 0) + Number(acc.saldoAjuste || 0);
    });

    movements.forEach(m => {
      const amt = Number(m.monto || 0);
      if (m.tipo === 'Ingreso') {
        if (m.cuenta && saldosPorLugar[m.cuenta] !== undefined) {
          saldosPorLugar[m.cuenta] += amt;
        }
      } else if (m.tipo === 'Gasto') {
        if (m.cuenta && saldosPorLugar[m.cuenta] !== undefined) {
          saldosPorLugar[m.cuenta] -= amt;
        }
      } else if (m.tipo === 'Ahorro') {
        // El ahorro NO es una cuenta; vive dentro de la cuenta origen (Bolsillo/Cajita).
        // Solo se transfiere si cuentaDestino es otra cuenta bancaria real y válida
        if (m.cuentaDestino && m.cuentaDestino !== m.cuenta && saldosPorLugar[m.cuentaDestino] !== undefined) {
          if (m.cuenta && saldosPorLugar[m.cuenta] !== undefined) {
            saldosPorLugar[m.cuenta] -= amt;
          }
          saldosPorLugar[m.cuentaDestino] += amt;
        }
      } else if (m.tipo === 'Transferencia') {
        if (m.cuenta && saldosPorLugar[m.cuenta] !== undefined) {
          saldosPorLugar[m.cuenta] -= amt;
        }
        if (m.cuentaDestino && saldosPorLugar[m.cuentaDestino] !== undefined) {
          saldosPorLugar[m.cuentaDestino] += amt;
        }
      }
    });

    buyerSales.forEach(sale => {
      // Abonos recibidos del cliente
      (sale.pagos || []).forEach(p => {
        if (p.cuentaDestino && saldosPorLugar[p.cuentaDestino] !== undefined) {
          saldosPorLugar[p.cuentaDestino] += Number(p.monto || 0);
        }
      });
      // Costo del producto pagado al proveedor por encargo comercial
      if (sale.costoPagado && sale.cuentaCosto && saldosPorLugar[sale.cuentaCosto] !== undefined) {
        saldosPorLugar[sale.cuentaCosto] -= Number(sale.costoProducto || 0);
      }
    });

    debtors.forEach(debtor => {
      if (debtor.cuentaOrigen && saldosPorLugar[debtor.cuentaOrigen] !== undefined) {
        saldosPorLugar[debtor.cuentaOrigen] -= Number(debtor.montoPrestado || 0);
      }
      (debtor.abonos || []).forEach(p => {
        if (p.cuentaDestino && saldosPorLugar[p.cuentaDestino] !== undefined) {
          saldosPorLugar[p.cuentaDestino] += Number(p.monto || 0);
        }
      });
    });

    // Metas de Ahorro y desglose por cuenta (Bolsillos / Cajitas dentro de cada cuenta)
    const ahorrosPorCuenta: Record<string, number> = {};
    accounts.forEach(acc => {
      ahorrosPorCuenta[acc.nombre] = 0;
    });

    let totalAhorros = 0;
    savings.forEach(s => {
      const monto = Number(s.montoActual || 0);
      totalAhorros += monto;
      if (s.cuentaPreferida && ahorrosPorCuenta[s.cuentaPreferida] !== undefined) {
        ahorrosPorCuenta[s.cuentaPreferida] += monto;
      }
    });
    const metasAhorroActivas = savings.filter(s => s.estado === 'En progreso').length;

    // Saldo disponible para gastar libremente = Total en el banco - Apartado en Ahorro
    const disponiblePorCuenta: Record<string, number> = {};
    accounts.forEach(acc => {
      const totalEnCuenta = saldosPorLugar[acc.nombre] ?? 0;
      const enAhorros = ahorrosPorCuenta[acc.nombre] ?? 0;
      disponiblePorCuenta[acc.nombre] = totalEnCuenta - enAhorros;
    });

    const totalEnCuentas = Object.values(saldosPorLugar).reduce((acc, curr) => acc + curr, 0);
    const totalDisponible = Object.values(disponiblePorCuenta).reduce((acc, curr) => acc + curr, 0);

    // Mis Deudas (Pasivos)
    let totalDeudas = 0;
    let totalPagadoDeudas = 0;
    let deudasActivas = 0;
    debts.forEach(d => {
      const tot = Number(d.montoTotal || 0);
      const pag = Number(d.montoPagado || 0);
      totalDeudas += tot;
      totalPagadoDeudas += pag;
      if (d.estado !== 'Saldada' && (tot - pag) > 0) {
        deudasActivas += 1;
      }
    });
    const saldoPendienteDeudas = Math.max(0, totalDeudas - totalPagadoDeudas);

    return {
      ingresosRegistrados,
      gastosRegistrados,
      balance,
      porCobrarCompradores: saldoPorCobrar,
      porCobrarDeudores,
      totalPorCobrarGlobal,
      totalPrestadoDeudores,
      totalAbonadoDeudores,
      inversionesRecibidas,
      saldoPendienteInversionistas,
      misInversiones,
      valorActualMisInversiones,
      rendimientoTotalInversiones,
      ingresosPersonales,
      gastosPersonales,
      disponibleSegunMovimientos,
      ahorroRegistrado,
      totalAhorros,
      metasAhorroActivas,
      totalDeudas,
      totalPagadoDeudas,
      saldoPendienteDeudas,
      deudasActivas,
      totalVendido,
      costoTotalProductos,
      gananciaTotal,
      margenGlobal,
      saldoPorCobrar,
      saldosPorLugar,
      ahorrosPorCuenta,
      disponiblePorCuenta,
      totalEnCuentas,
      totalDisponible
    };
  }, [movements, investors, buyerSales, debtors, myInvestments, savings, debts, accounts, periodFilter]);

  // Operations for Movements
  const addMovement = (item: Omit<Movement, 'id' | 'createdAt'>) => {
    const newMovement: Movement = {
      ...item,
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now()
    };
    setMovements(prev => {
      const next = [newMovement, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const updateMovement = (id: string, updated: Partial<Movement>) => {
    setMovements(prev => {
      const next = prev.map(m => m.id === id ? { ...m, ...updated } : m);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteMovement = (id: string) => {
    setMovements(prev => {
      const next = prev.filter(m => m.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  // Operations for Investors
  const addInvestor = (item: Omit<Investor, 'id' | 'createdAt' | 'montoDevuelto' | 'repagos'>) => {
    const newInvestor: Investor = {
      ...item,
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      montoDevuelto: 0,
      repagos: [],
      createdAt: Date.now()
    };
    setInvestors(prev => {
      const next = [newInvestor, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const updateInvestor = (id: string, updated: Partial<Investor>) => {
    setInvestors(prev => {
      const next = prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteInvestor = (id: string) => {
    setInvestors(prev => {
      const next = prev.filter(inv => inv.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const addRepayment = (investorId: string, repayment: Omit<Repayment, 'id'>) => {
    const newRepayment: Repayment = {
      ...repayment,
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    setInvestors(prev => {
      const next = prev.map(inv => {
        if (inv.id !== investorId) return inv;
        const repagos = [...inv.repagos, newRepayment];
        const montoDevuelto = repagos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        const retornoPactado = Number(inv.retornoPactado || inv.montoRecibido || 0);
        const estado: InvestorStatus = montoDevuelto >= retornoPactado ? 'Liquidado' : inv.estado;
        return {
          ...inv,
          repagos,
          montoDevuelto,
          estado
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteRepayment = (investorId: string, repaymentId: string) => {
    setInvestors(prev => {
      const next = prev.map(inv => {
        if (inv.id !== investorId) return inv;
        const repagos = inv.repagos.filter(r => r.id !== repaymentId);
        const montoDevuelto = repagos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        const retornoPactado = Number(inv.retornoPactado || inv.montoRecibido || 0);
        const estado: InvestorStatus = montoDevuelto >= retornoPactado ? 'Liquidado' : 'Activo';
        return {
          ...inv,
          repagos,
          montoDevuelto,
          estado
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  // Operations for Buyers
  const addBuyerSale = (
    item: Omit<BuyerSale, 'id' | 'createdAt' | 'montoRecibido' | 'pagos'>,
    initialPayment?: {
      monto: number;
      fecha?: string;
      cuentaDestino: string;
      metodo?: string;
      nota?: string;
    }
  ) => {
    const pagos: BuyerPayment[] = [];
    let montoRecibido = 0;

    if (initialPayment && Number(initialPayment.monto) > 0) {
      const pMonto = Number(initialPayment.monto);
      pagos.push({
        id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fecha: initialPayment.fecha || item.fecha,
        monto: pMonto,
        cuentaDestino: initialPayment.cuentaDestino,
        metodo: initialPayment.metodo || 'Abono Inicial',
        nota: initialPayment.nota || 'Abono / Anticipo inicial del cliente'
      });
      montoRecibido = pMonto;
    }

    const newSale: BuyerSale = {
      ...item,
      id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      montoRecibido,
      pagos,
      createdAt: Date.now()
    };
    setBuyerSales(prev => {
      const next = [newSale, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const updateBuyerSale = (id: string, updated: Partial<BuyerSale>) => {
    setBuyerSales(prev => {
      const next = prev.map(sale => sale.id === id ? { ...sale, ...updated } : sale);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteBuyerSale = (id: string) => {
    setBuyerSales(prev => {
      const next = prev.filter(sale => sale.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const addBuyerPayment = (saleId: string, payment: Omit<BuyerPayment, 'id'>) => {
    const newPayment: BuyerPayment = {
      ...payment,
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    setBuyerSales(prev => {
      const next = prev.map(sale => {
        if (sale.id !== saleId) return sale;
        const pagos = [...sale.pagos, newPayment];
        const montoRecibido = pagos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        return {
          ...sale,
          pagos,
          montoRecibido
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteBuyerPayment = (saleId: string, paymentId: string) => {
    setBuyerSales(prev => {
      const next = prev.map(sale => {
        if (sale.id !== saleId) return sale;
        const pagos = sale.pagos.filter(p => p.id !== paymentId);
        const montoRecibido = pagos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        return {
          ...sale,
          pagos,
          montoRecibido
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  // Operations for Debtors
  const addDebtor = (item: Omit<Debtor, 'id' | 'createdAt' | 'montoAbonado' | 'abonos'>) => {
    const newDebtor: Debtor = {
      ...item,
      id: `deb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      montoAbonado: 0,
      abonos: [],
      createdAt: Date.now()
    };
    setDebtors(prev => {
      const next = [newDebtor, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const updateDebtor = (id: string, updated: Partial<Debtor>) => {
    setDebtors(prev => {
      const next = prev.map(deb => deb.id === id ? { ...deb, ...updated } : deb);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteDebtor = (id: string) => {
    setDebtors(prev => {
      const next = prev.filter(deb => deb.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const addDebtorPayment = (debtorId: string, payment: Omit<DebtorPayment, 'id'>) => {
    const newPayment: DebtorPayment = {
      ...payment,
      id: `deb-pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    setDebtors(prev => {
      const next = prev.map(debtor => {
        if (debtor.id !== debtorId) return debtor;
        const abonos = [...debtor.abonos, newPayment];
        const montoAbonado = abonos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        const total = Number(debtor.totalACobrar || debtor.montoPrestado || 0);
        const estado: DebtorStatus = montoAbonado >= total ? 'Cobrado' : 'Parcial';
        return {
          ...debtor,
          abonos,
          montoAbonado,
          estado
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteDebtorPayment = (debtorId: string, paymentId: string) => {
    setDebtors(prev => {
      const next = prev.map(debtor => {
        if (debtor.id !== debtorId) return debtor;
        const abonos = debtor.abonos.filter(p => p.id !== paymentId);
        const montoAbonado = abonos.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        const total = Number(debtor.totalACobrar || debtor.montoPrestado || 0);
        const estado: DebtorStatus = montoAbonado >= total ? 'Cobrado' : montoAbonado > 0 ? 'Parcial' : 'Pendiente';
        return {
          ...debtor,
          abonos,
          montoAbonado,
          estado
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  // Operations for MyInvestments
  const addMyInvestment = (item: Omit<MyInvestment, 'id' | 'createdAt'>) => {
    const newInv: MyInvestment = {
      ...item,
      id: `myinv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now()
    };
    setMyInvestments(prev => {
      const next = [newInv, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const updateMyInvestment = (id: string, updated: Partial<MyInvestment>) => {
    setMyInvestments(prev => {
      const next = prev.map(inv => inv.id === id ? { ...inv, ...updated } : inv);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteMyInvestment = (id: string) => {
    setMyInvestments(prev => {
      const next = prev.filter(inv => inv.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  // Operations for Savings Goals & Contributions
  const addSavingGoal = (goal: Omit<SavingGoal, 'id' | 'createdAt' | 'montoActual' | 'aportes'>): string => {
    const newId = `sav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newGoal: SavingGoal = {
      ...goal,
      id: newId,
      montoActual: 0,
      aportes: [],
      createdAt: Date.now()
    };
    setSavings(prev => {
      const next = [newGoal, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
    return newId;
  };

  const updateSavingGoal = (id: string, updated: Partial<SavingGoal>) => {
    setSavings(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updated } : s);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteSavingGoal = (id: string) => {
    setSavings(prev => {
      const next = prev.filter(s => s.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const addSavingContribution = (goalId: string, contribution: {
    monto: number;
    fecha: string;
    tipo: 'Aporte' | 'Retiro';
    cuentaOrigen: string;
    nota?: string;
  }) => {
    const goal = savings.find(s => s.id === goalId);
    if (!goal) return;

    const contribId = `sav-apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const movementId = `mov-sav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newContrib: SavingContribution = {
      id: contribId,
      fecha: contribution.fecha,
      monto: Number(contribution.monto),
      tipo: contribution.tipo,
      cuentaOrigen: contribution.cuentaOrigen,
      nota: contribution.nota,
      movementId,
      createdAt: Date.now()
    };

    setSavings(prev => {
      const next = prev.map(s => {
        if (s.id !== goalId) return s;
        const newMontoActual = contribution.tipo === 'Aporte'
          ? Number(s.montoActual || 0) + Number(contribution.monto)
          : Math.max(0, Number(s.montoActual || 0) - Number(contribution.monto));
        
        const isCompleted = Boolean(s.montoObjetivo && newMontoActual >= s.montoObjetivo);
        const estado: SavingGoalStatus = isCompleted ? 'Completado' : (s.estado === 'Completado' ? 'En progreso' : s.estado);
        return {
          ...s,
          montoActual: newMontoActual,
          estado,
          aportes: [newContrib, ...s.aportes]
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(next));
      return next;
    });

    if (contribution.tipo === 'Aporte') {
      const newMovement: Movement = {
        id: movementId,
        fecha: contribution.fecha,
        tipo: 'Ahorro',
        categoria: 'Ahorro / Alcancía',
        concepto: `Aporte a ahorro: ${goal.nombre}${contribution.nota ? ` (${contribution.nota})` : ''}`,
        monto: Number(contribution.monto),
        cuenta: contribution.cuentaOrigen,
        notas: `Aporte transferido desde ${contribution.cuentaOrigen} al ahorro "${goal.nombre}". Motivo: ${goal.motivo}`,
        createdAt: Date.now()
      };
      setMovements(prev => {
        const next = [newMovement, ...prev];
        localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
        return next;
      });
    } else {
      const newMovement: Movement = {
        id: movementId,
        fecha: contribution.fecha,
        tipo: 'Ingreso',
        categoria: 'Retiro de Ahorro',
        concepto: `Retiro de ahorro: ${goal.nombre}${contribution.nota ? ` (${contribution.nota})` : ''}`,
        monto: Number(contribution.monto),
        cuenta: contribution.cuentaOrigen,
        notas: `Fondos retirados de la meta "${goal.nombre}" depositados en ${contribution.cuentaOrigen}`,
        createdAt: Date.now()
      };
      setMovements(prev => {
        const next = [newMovement, ...prev];
        localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
        return next;
      });
    }

    triggerFastCloudSync();
  };

  const deleteSavingContribution = (goalId: string, contributionId: string) => {
    const goal = savings.find(s => s.id === goalId);
    if (!goal) return;
    const contrib = goal.aportes.find(a => a.id === contributionId);
    if (!contrib) return;

    setSavings(prev => {
      const next = prev.map(s => {
        if (s.id !== goalId) return s;
        const newMontoActual = contrib.tipo === 'Aporte'
          ? Math.max(0, Number(s.montoActual || 0) - Number(contrib.monto))
          : Number(s.montoActual || 0) + Number(contrib.monto);
        return {
          ...s,
          montoActual: newMontoActual,
          aportes: s.aportes.filter(a => a.id !== contributionId)
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(next));
      return next;
    });

    if (contrib.movementId) {
      setMovements(prev => {
        const next = prev.filter(m => m.id !== contrib.movementId);
        localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
        return next;
      });
    }

    triggerFastCloudSync();
  };

  // Operations for Debts (Mis Deudas / Pasivos)
  const addDebt = (item: Omit<Debt, 'id' | 'createdAt' | 'montoPagado' | 'pagos'>): string => {
    const newId = `debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDebt: Debt = {
      ...item,
      id: newId,
      montoPagado: 0,
      pagos: [],
      createdAt: Date.now()
    };
    setDebts(prev => {
      const next = [newDebt, ...prev];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
    return newId;
  };

  const updateDebt = (id: string, updated: Partial<Debt>) => {
    setDebts(prev => {
      const next = prev.map(d => {
        if (d.id !== id) return d;
        const merged = { ...d, ...updated };
        if (merged.montoPagado >= merged.montoTotal && merged.montoTotal > 0) {
          merged.estado = 'Saldada';
        }
        return merged;
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const deleteDebt = (id: string) => {
    setDebts(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const addDebtPayment = (debtId: string, payment: {
    fecha: string;
    monto: number;
    cuentaOrigen: string;
    numeroCuota?: number;
    nota?: string;
    registrarComoMovimiento?: boolean;
  }) => {
    const targetDebt = debts.find(d => d.id === debtId);
    if (!targetDebt) return;

    const paymentId = `dp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let generatedMovementId: string | undefined = undefined;

    // Automatic expense movement if requested
    if (payment.registrarComoMovimiento !== false) {
      generatedMovementId = `mov-debt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newMovement: Movement = {
        id: generatedMovementId,
        fecha: payment.fecha,
        tipo: 'Gasto',
        categoria: 'Pago de Deudas',
        concepto: `Abono a deuda: ${targetDebt.acreedor}${payment.numeroCuota ? ` (Cuota ${payment.numeroCuota})` : ''}`,
        monto: Number(payment.monto),
        cuenta: payment.cuentaOrigen,
        notas: payment.nota ? `Abono a deuda: ${payment.nota}` : `Abono a deuda con ${targetDebt.acreedor}`,
        createdAt: Date.now()
      };
      setMovements(prev => {
        const next = [newMovement, ...prev];
        localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
        return next;
      });
    }

    const newPayment: DebtPayment = {
      id: paymentId,
      fecha: payment.fecha,
      monto: Number(payment.monto),
      cuentaOrigen: payment.cuentaOrigen,
      numeroCuota: payment.numeroCuota,
      nota: payment.nota,
      movementId: generatedMovementId,
      createdAt: Date.now()
    };

    setDebts(prev => {
      const next = (prev || []).map(d => {
        if (d.id !== debtId) return d;
        const currentPagos = Array.isArray(d.pagos) ? d.pagos : [];
        const updatedPagos = [...currentPagos, newPayment];
        const updatedMontoPagado = updatedPagos.reduce((sum, p) => sum + Number(p.monto || 0), 0);
        const cuotasPagadas = (d.cuotasPagadas || 0) + (payment.numeroCuota ? 1 : 0);
        const totalMonto = Number(d.montoTotal || 0);
        const estado: DebtStatus = updatedMontoPagado >= totalMonto && totalMonto > 0 ? 'Saldada' : 'Parcial';
        return {
          ...d,
          pagos: updatedPagos,
          montoPagado: updatedMontoPagado,
          cuotasPagadas,
          estado
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(next));
      return next;
    });

    triggerFastCloudSync();
  };

  const deleteDebtPayment = (debtId: string, paymentId: string) => {
    let movementIdToDelete: string | undefined;

    setDebts(prev => {
      const next = (prev || []).map(d => {
        if (d.id !== debtId) return d;
        const currentPagos = Array.isArray(d.pagos) ? d.pagos : [];
        const targetPayment = currentPagos.find(p => p.id === paymentId);
        if (targetPayment?.movementId) {
          movementIdToDelete = targetPayment.movementId;
        }
        const updatedPagos = currentPagos.filter(p => p.id !== paymentId);
        const updatedMontoPagado = updatedPagos.reduce((sum, p) => sum + Number(p.monto || 0), 0);
        const totalMonto = Number(d.montoTotal || 0);
        const estado: DebtStatus = updatedMontoPagado === 0 
          ? 'Pendiente' 
          : (updatedMontoPagado >= totalMonto && totalMonto > 0 ? 'Saldada' : 'Parcial');
        return {
          ...d,
          pagos: updatedPagos,
          montoPagado: updatedMontoPagado,
          estado
        };
      });
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(next));
      return next;
    });

    if (movementIdToDelete) {
      setMovements(prev => {
        const next = prev.filter(m => m.id !== movementIdToDelete);
        localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(next));
        return next;
      });
    }

    triggerFastCloudSync();
  };

  // Accounts
  const updateAccountInitialBalance = (id: string, balance: number) => {
    setAccounts(prev => {
      const next = prev.map(acc => acc.id === id ? { ...acc, saldoInicial: balance } : acc);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const addAccount = (nombre: string, saldoInicial: number, color?: string) => {
    const cleanNombre = nombre.trim();
    if (!cleanNombre || cleanNombre.toLowerCase().startsWith('ahorro')) {
      return;
    }
    const newAcc: AccountPlace = {
      id: `acc-${Date.now()}`,
      nombre: cleanNombre,
      saldoInicial,
      color: color || '#64748B'
    };
    setAccounts(prev => {
      const next = [...prev, newAcc];
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(next));
      return next;
    });
    if (!configLists.cuentas.includes(cleanNombre)) {
      setConfigLists(prev => {
        const next = { ...prev, cuentas: [...prev.cuentas, cleanNombre] };
        localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_configLists`, JSON.stringify(next));
        return next;
      });
    }
    triggerFastCloudSync();
  };

  const deleteAccount = (id: string) => {
    const target = accounts.find(a => a.id === id);
    if (!target) return;
    setAccounts(prev => {
      const next = prev.filter(a => a.id !== id);
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(next));
      return next;
    });
    setConfigLists(prev => {
      const next = { ...prev, cuentas: prev.cuentas.filter(c => c !== target.nombre) };
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_configLists`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  const updateConfigLists = (lists: Partial<ConfigLists>) => {
    setConfigLists(prev => {
      const next = { ...prev, ...lists };
      localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_configLists`, JSON.stringify(next));
      return next;
    });
    triggerFastCloudSync();
  };

  // Backup & Reset
  const resetToSampleData = () => {
    setMovements(sampleMovements);
    setInvestors(sampleInvestors);
    setBuyerSales(sampleBuyerSales);
    setDebtors(sampleDebtors);
    setMyInvestments(sampleMyInvestments);
    setSavings(sampleSavings);
    setDebts(sampleDebts);
    setAccounts(sampleAccounts);
    setConfigLists(initialConfigLists);

    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify(sampleMovements));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify(sampleInvestors));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify(sampleBuyerSales));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify(sampleDebtors));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify(sampleMyInvestments));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify(sampleSavings));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify(sampleDebts));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(sampleAccounts));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_configLists`, JSON.stringify(initialConfigLists));

    triggerFastCloudSync(true);
  };

  const clearAllData = async () => {
    setMovements([]);
    setInvestors([]);
    setBuyerSales([]);
    setDebtors([]);
    setMyInvestments([]);
    setSavings([]);
    setDebts([]);
    const resetAccounts = accounts.map(a => ({ ...a, saldoInicial: 0 }));
    setAccounts(resetAccounts);

    // Persist scoped data immediately
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_movements`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_investors`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_buyerSales`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debtors`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_myInvestments`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_savings`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_debts`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY}_${currentProfileId}_accounts`, JSON.stringify(resetAccounts));

    triggerFastCloudSync(true);
  };

  const importJsonData = (data: unknown): boolean => {
    try {
      if (typeof data !== 'object' || data === null) return false;
      const parsed = data as Record<string, unknown>;
      if (Array.isArray(parsed.movements)) setMovements(parsed.movements as Movement[]);
      if (Array.isArray(parsed.investors)) setInvestors(parsed.investors as Investor[]);
      if (Array.isArray(parsed.buyerSales)) setBuyerSales(parsed.buyerSales as BuyerSale[]);
      if (Array.isArray(parsed.debtors)) setDebtors(parsed.debtors as Debtor[]);
      if (Array.isArray(parsed.myInvestments)) setMyInvestments(parsed.myInvestments as MyInvestment[]);
      if (Array.isArray(parsed.savings)) setSavings(parsed.savings as SavingGoal[]);
      if (Array.isArray(parsed.debts)) setDebts(parsed.debts as Debt[]);
      if (Array.isArray(parsed.accounts)) setAccounts(parsed.accounts as AccountPlace[]);
      if (parsed.configLists && typeof parsed.configLists === 'object') setConfigLists(parsed.configLists as ConfigLists);
      triggerFastCloudSync(true);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        profiles,
        currentProfileId,
        currentProfile,
        addProfile,
        switchProfile,
        renameProfile,
        deleteProfile,
        cloudSyncStatus,
        syncToCloudNow,
        movements,
        investors,
        buyerSales,
        debtors,
        myInvestments,
        savings,
        debts,
        accounts,
        configLists,
        periodFilter,
        activeTab,
        currencySymbol,
        setActiveTab,
        setPeriodFilter,
        setCurrencySymbol,
        summary,
        addMovement,
        updateMovement,
        deleteMovement,
        addInvestor,
        updateInvestor,
        deleteInvestor,
        addRepayment,
        deleteRepayment,
        addBuyerSale,
        updateBuyerSale,
        deleteBuyerSale,
        addBuyerPayment,
        deleteBuyerPayment,
        addDebtor,
        updateDebtor,
        deleteDebtor,
        addDebtorPayment,
        deleteDebtorPayment,
        addMyInvestment,
        updateMyInvestment,
        deleteMyInvestment,
        addSavingGoal,
        updateSavingGoal,
        deleteSavingGoal,
        addSavingContribution,
        deleteSavingContribution,
        addDebt,
        updateDebt,
        deleteDebt,
        addDebtPayment,
        deleteDebtPayment,
        updateAccountInitialBalance,
        addAccount,
        deleteAccount,
        updateConfigLists,
        resetToSampleData,
        clearAllData,
        importJsonData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
