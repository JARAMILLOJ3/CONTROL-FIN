import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  Check, 
  Settings2,
  DollarSign,
  Users,
  Copy,
  Smartphone,
  Cloud,
  HardDrive,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { exportFullBackupToJson, getLastBackupDate } from '../utils/exportImport';
import { formatDate } from '../utils/formatters';
import { ProfileModal } from './ProfileModal';
import { ConfirmModal } from './ConfirmModal';
import { PWAInstallButton } from './PWAInstallButton';

type SettingsTab = 'backups' | 'perfiles' | 'moneda' | 'ingreso' | 'gasto' | 'pagos' | 'instalacion';

export const ListsSettingsView: React.FC = () => {
  const {
    configLists,
    updateConfigLists,
    currencySymbol,
    setCurrencySymbol,
    movements,
    investors,
    buyerSales,
    debtors,
    myInvestments,
    savings,
    debts,
    accounts,
    profiles,
    currentProfile,
    resetToSampleData,
    clearAllData,
    importJsonData,
    cloudSyncStatus,
    syncToCloudNow
  } = useFinance();

  const { user, signInWithGoogle, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<SettingsTab>('backups');
  const [newCatIngreso, setNewCatIngreso] = useState('');
  const [newCatGasto, setNewCatGasto] = useState('');
  const [newMetodoPago, setNewMetodoPago] = useState('');
  
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(getLastBackupDate());
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'primary';
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    setLastBackup(getLastBackupDate());
  }, []);

  const handleBackupExport = () => {
    exportFullBackupToJson({
      movements,
      investors,
      buyerSales,
      debtors,
      myInvestments,
      savings,
      debts,
      accounts,
      configLists,
      profiles
    });
    const now = new Date().toISOString();
    setLastBackup(now);
    setBackupSuccessMessage('¡Copia de seguridad descargada exitosamente en formato JSON!');
    setTimeout(() => setBackupSuccessMessage(null), 4500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        setConfirmAction({
          title: '¿Restaurar esta copia de seguridad?',
          message: `Se importarán los datos del archivo "${file.name}". Esta acción actualizará los registros de tu aplicación con la información del respaldo.`,
          confirmLabel: 'Sí, restaurar datos',
          confirmVariant: 'primary',
          onConfirm: () => {
            const success = importJsonData(parsed);
            if (success) {
              setImportSuccess(true);
              setImportError(false);
              setTimeout(() => setImportSuccess(false), 4500);
            } else {
              setImportError(true);
              setTimeout(() => setImportError(false), 4500);
            }
            setConfirmAction(null);
          }
        });
      } catch {
        setImportError(true);
        setTimeout(() => setImportError(false), 4500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleManualCloudSync = async () => {
    try {
      setIsSyncing(true);
      await syncToCloudNow();
      setBackupSuccessMessage('¡Datos sincronizados con la nube en Firestore!');
      setTimeout(() => setBackupSuccessMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add / Delete category helpers with confirmation
  const handleAddCatIngreso = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatIngreso.trim();
    if (!val) return;
    if (!configLists.categoriasIngreso.includes(val)) {
      updateConfigLists({
        categoriasIngreso: [...configLists.categoriasIngreso, val]
      });
    }
    setNewCatIngreso('');
  };

  const confirmDeleteCatIngreso = (cat: string) => {
    setConfirmAction({
      title: `¿Eliminar categoría "${cat}"?`,
      message: 'Los movimientos que ya usaron esta categoría conservarán su nombre, pero ya no aparecerá como opción sugerida en nuevos registros.',
      confirmLabel: 'Sí, eliminar',
      confirmVariant: 'danger',
      onConfirm: () => {
        updateConfigLists({
          categoriasIngreso: configLists.categoriasIngreso.filter(c => c !== cat)
        });
        setConfirmAction(null);
      }
    });
  };

  const handleAddCatGasto = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newCatGasto.trim();
    if (!val) return;
    if (!configLists.categoriasGasto.includes(val)) {
      updateConfigLists({
        categoriasGasto: [...configLists.categoriasGasto, val]
      });
    }
    setNewCatGasto('');
  };

  const confirmDeleteCatGasto = (cat: string) => {
    setConfirmAction({
      title: `¿Eliminar categoría "${cat}"?`,
      message: 'Los gastos que ya usaron esta categoría conservarán su registro, pero ya no aparecerá en el menú para nuevos gastos.',
      confirmLabel: 'Sí, eliminar',
      confirmVariant: 'danger',
      onConfirm: () => {
        updateConfigLists({
          categoriasGasto: configLists.categoriasGasto.filter(c => c !== cat)
        });
        setConfirmAction(null);
      }
    });
  };

  const handleAddMetodoPago = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newMetodoPago.trim();
    if (!val) return;
    if (!configLists.metodosPago.includes(val)) {
      updateConfigLists({
        metodosPago: [...configLists.metodosPago, val]
      });
    }
    setNewMetodoPago('');
  };

  const confirmDeleteMetodoPago = (met: string) => {
    setConfirmAction({
      title: `¿Eliminar método de pago "${met}"?`,
      message: 'Ya no podrás seleccionarlo como opción al registrar ventas o cobros a compradores.',
      confirmLabel: 'Sí, eliminar',
      confirmVariant: 'danger',
      onConfirm: () => {
        updateConfigLists({
          metodosPago: configLists.metodosPago.filter(m => m !== met)
        });
        setConfirmAction(null);
      }
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const tabsConfig = [
    { id: 'backups' as SettingsTab, label: 'Almacenamiento & Backup', icon: HardDrive },
    { id: 'perfiles' as SettingsTab, label: 'Perfiles Multi-persona', icon: Users },
    { id: 'moneda' as SettingsTab, label: 'Moneda', icon: DollarSign },
    { id: 'ingreso' as SettingsTab, label: 'Categorías Ingreso', icon: Plus },
    { id: 'gasto' as SettingsTab, label: 'Categorías Gasto', icon: Plus },
    { id: 'pagos' as SettingsTab, label: 'Métodos de Pago', icon: CheckCircle2 },
    { id: 'instalacion' as SettingsTab, label: 'Instalación Móvil', icon: Smartphone }
  ];

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden min-w-0">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>Configuración del Sistema</span>
          <span aria-hidden="true">·</span>
          <span>Ajustes, Almacenamiento & Copias</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Configuración General
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Gestiona copias de seguridad, sincronización en la nube, perfiles, listas personalizadas y moneda.
        </p>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-5 border-t border-slate-100 mt-5 no-scrollbar">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: ALMACENAMIENTO Y BACKUPS (Requerimiento 5) */}
      {/* ========================================================================= */}
      {activeTab === 'backups' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* AVISO VISIBLE OBLIGATORIO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 flex flex-col sm:flex-row items-start gap-3.5 shadow-xs">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <h2 className="font-bold text-sm text-amber-950">
                Dónde y cómo se guardan tus datos:
              </h2>
              <p className="leading-relaxed font-medium">
                “Tus datos están guardados en este navegador. Si cambias de dispositivo o borras los datos del navegador, podrías perderlos. Descarga un backup periódicamente o conecta la nube para sincronizar.”
              </p>
            </div>
          </div>

          {/* Feedback banners */}
          {backupSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{backupSuccessMessage}</span>
            </div>
          )}

          {importSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 font-bold shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>¡Copia de seguridad restaurada exitosamente! Todos tus registros han sido cargados.</span>
            </div>
          )}

          {importError && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-2.5 text-xs text-rose-900 font-bold shadow-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Error al procesar el archivo. Asegúrate de seleccionar un archivo JSON de respaldo válido creado por la app.</span>
            </div>
          )}

          {/* Estado de Sincronización & Conectar Nube */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${user ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Sincronización en la Nube con Google
                  </h3>
                  <span className="text-xs text-slate-500">
                    {user ? `Conectado como ${user.email}` : 'Modo local en este navegador'}
                  </span>
                </div>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualCloudSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signInWithGoogle()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conectar Nube</span>
                </button>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-900">
                💡 ¿Qué hace la opción "Conectar Nube"?
              </p>
              <p>
                Al conectar tu cuenta de Google, la aplicación guarda automáticamente tus finanzas, movimientos y configuraciones en una base de datos protegida en la nube (Firestore).
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>Te permite abrir tu app en tu celular, tablet o computador sin perder tus registros.</li>
                <li>Si borras el historial o las cookies de tu navegador, tus datos seguirán a salvo en la nube.</li>
                <li>No vendemos ni compartimos tu información: el acceso está restringido a tu propia cuenta de correo.</li>
              </ul>
            </div>
          </div>

          {/* Backup Manual JSON */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Copia de Seguridad Manual (Archivo JSON)
                </h3>
                <p className="text-xs text-slate-500">
                  Descarga tus datos en tu computador o celular para guardarlos donde prefieras.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Último backup:</span>
                <span className="text-xs font-bold text-slate-800">
                  {lastBackup ? formatDate(lastBackup) : 'No has creado copias aún'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Botón Crear Backup */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Crear backup ahora</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Genera un archivo con todos tus movimientos ({movements.length}), clientes ({buyerSales.length}), deudas ({debts.length}) y metas de ahorro ({savings.length}).
                  </p>
                </div>
                <button
                  onClick={handleBackupExport}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Crear backup ahora</span>
                </button>
              </div>

              {/* Botón Restaurar Backup */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-700" />
                    <span>Restaurar backup</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Sube un archivo de copia de seguridad previo en formato JSON para reponer toda tu información.
                  </p>
                </div>
                <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-xs text-center">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Restaurar backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Zona de peligro: Vaciar datos y Datos de muestra */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <button
                onClick={() => {
                  setConfirmAction({
                    title: '¿Cargar datos de ejemplo?',
                    message: 'Se cargarán registros de prueba para explorar los gráficos y módulos. Si ya tienes datos reales, te recomendamos hacer un backup primero.',
                    confirmLabel: 'Cargar ejemplos',
                    confirmVariant: 'primary',
                    onConfirm: () => {
                      resetToSampleData();
                      setConfirmAction(null);
                    }
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cargar datos de muestra (Demo)</span>
              </button>

              <button
                onClick={() => {
                  setConfirmAction({
                    title: '¿Vaciar todo y dejar en blanco?',
                    message: '⚠️ Esta acción borrará todos los movimientos, clientes, deudas y metas para empezar desde cero con saldos en $0. Te recomendamos descargar un backup antes de continuar.',
                    confirmLabel: 'Sí, vaciar todo',
                    confirmVariant: 'danger',
                    onConfirm: () => {
                      clearAllData();
                      setConfirmAction(null);
                    }
                  });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar y dejar limpio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: PERFILES MULTI-PERSONA */}
      {/* ========================================================================= */}
      {activeTab === 'perfiles' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Uso para Varias Personas (Multi-Perfil)
              </h2>
              <p className="text-xs text-slate-500">
                Cada persona o negocio puede llevar su propio libro contable independiente.
              </p>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gestionar Perfiles ({profiles.length})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <strong className="text-slate-900 block font-bold">
                Opción A: Varias personas en el mismo dispositivo
              </strong>
              <p className="text-slate-600 leading-relaxed">
                Crea un perfil para cada persona (ej: "Personal", "Negocio", "Pareja"). Cambias de libro contable con un clic y los datos quedan totalmente separados.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <span className="text-slate-500">Perfil actualmente activo:</span>
                <span className="font-bold text-slate-900 px-2 py-0.5 bg-white border border-slate-200 rounded-md">
                  {currentProfile.nombre}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 flex flex-col justify-between">
              <div>
                <strong className="text-slate-900 block font-bold">
                  Opción B: Que otra persona lo use en su propio celular / PC
                </strong>
                <p className="text-slate-600 leading-relaxed">
                  Solo debes compartirle el enlace de la aplicación. Al entrar desde su navegador, tendrá su propio espacio privado e independiente sin ver tus registros.
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer mt-2"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? '¡Enlace copiado al portapapeles!' : 'Copiar enlace de la app'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: MONEDA */}
      {/* ========================================================================= */}
      {activeTab === 'moneda' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Símbolo de Moneda
            </h2>
            <p className="text-xs text-slate-500">
              Selecciona el formato visual con el que se mostrarán los montos en toda la aplicación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 max-w-md pt-2">
            {[
              { sym: '$', label: 'Pesos ($)' },
              { sym: '$ COP', label: 'Pesos Colombianos ($ COP)' },
              { sym: 'USD $', label: 'Dólares (USD $)' },
              { sym: '€', label: 'Euros (€)' },
              { sym: 'MXN $', label: 'Pesos Mexicanos (MXN $)' }
            ].map((item) => (
              <button
                key={item.sym}
                onClick={() => setCurrencySymbol(item.sym)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  currencySymbol === item.sym
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: CATEGORÍAS DE INGRESO */}
      {/* ========================================================================= */}
      {activeTab === 'ingreso' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Categorías de Ingreso
            </h2>
            <p className="text-xs text-slate-500">
              Opciones disponibles para clasificar tus entradas de dinero personales y comerciales.
            </p>
          </div>

          <form onSubmit={handleAddCatIngreso} className="flex gap-2 max-w-md">
            <label htmlFor="cat-ingreso-input" className="sr-only">Nueva categoría de ingreso</label>
            <input
              id="cat-ingreso-input"
              type="text"
              placeholder="Ej: Bonificación, Ventas por catálogo..."
              value={newCatIngreso}
              onChange={(e) => setNewCatIngreso(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
            >
              + Agregar
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {configLists.categoriasIngreso.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium"
              >
                <span className="truncate">{cat}</span>
                <button
                  onClick={() => confirmDeleteCatIngreso(cat)}
                  aria-label={`Eliminar categoría ${cat}`}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: CATEGORÍAS DE GASTO */}
      {/* ========================================================================= */}
      {activeTab === 'gasto' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Categorías de Gasto
            </h2>
            <p className="text-xs text-slate-500">
              Clasificación para tus egresos cotidianos y costos comerciales.
            </p>
          </div>

          <form onSubmit={handleAddCatGasto} className="flex gap-2 max-w-md">
            <label htmlFor="cat-gasto-input" className="sr-only">Nueva categoría de gasto</label>
            <input
              id="cat-gasto-input"
              type="text"
              placeholder="Ej: Suscripciones, Gimnasio, Mascotas..."
              value={newCatGasto}
              onChange={(e) => setNewCatGasto(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
            >
              + Agregar
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {configLists.categoriasGasto.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium"
              >
                <span className="truncate">{cat}</span>
                <button
                  onClick={() => confirmDeleteCatGasto(cat)}
                  aria-label={`Eliminar categoría ${cat}`}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: MÉTODOS DE PAGO */}
      {/* ========================================================================= */}
      {activeTab === 'pagos' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Métodos de Pago Acordados
            </h2>
            <p className="text-xs text-slate-500">
              Opciones de pago para ventas a clientes y abonos comerciales.
            </p>
          </div>

          <form onSubmit={handleAddMetodoPago} className="flex gap-2 max-w-md">
            <label htmlFor="metodo-pago-input" className="sr-only">Nuevo método de pago</label>
            <input
              id="metodo-pago-input"
              type="text"
              placeholder="Ej: Llave Nequi, Link Wompi, Datáfono..."
              value={newMetodoPago}
              onChange={(e) => setNewMetodoPago(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs shrink-0"
            >
              + Agregar
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {configLists.metodosPago.map((met) => (
              <div
                key={met}
                className="flex items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 font-medium"
              >
                <span className="truncate">{met}</span>
                <button
                  onClick={() => confirmDeleteMetodoPago(met)}
                  aria-label={`Eliminar método ${met}`}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                  title="Eliminar método"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: INSTALACIÓN MÓVIL */}
      {/* ========================================================================= */}
      {activeTab === 'instalacion' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Instalación como App Móvil (PWA)
            </h2>
            <p className="text-xs text-slate-500">
              Usa Control Financiero a pantalla completa como una aplicación nativa en tu iPhone o Android.
            </p>
          </div>

          <PWAInstallButton variant="card" />
        </div>
      )}

      {/* Modales auxiliares */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmLabel={confirmAction?.confirmLabel || 'Confirmar'}
        cancelLabel="Cancelar"
        confirmVariant={confirmAction?.confirmVariant || 'danger'}
        onConfirm={() => confirmAction?.onConfirm()}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
};
