import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Repeat, 
  PiggyBank, 
  CreditCard, 
  DollarSign, 
  ShoppingBag, 
  HandCoins, 
  Users, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { MovementModal } from './MovementModal';
import { InvestorModal } from './InvestorModal';
import { BuyerSaleModal } from './BuyerSaleModal';
import { DebtorModal } from './DebtorModal';
import { InvestmentModal } from './InvestmentModal';
import { SavingContributionModal } from './SavingContributionModal';
import { SavingGoalModal } from './SavingGoalModal';
import { DebtModal } from './DebtModal';
import { DebtPaymentModal } from './DebtPaymentModal';
import { useFinance } from '../context/FinanceContext';
import { MovementType } from '../types/finance';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose }) => {
  const { savings } = useFinance();
  const [activeForm, setActiveForm] = useState<
    | 'movement' 
    | 'investor' 
    | 'buyer' 
    | 'debtor' 
    | 'investment' 
    | 'saving_contrib' 
    | 'saving_goal'
    | 'debt'
    | 'debt_payment'
    | null
  >(null);
  const [movementInitialType, setMovementInitialType] = useState<MovementType>('Gasto');
  const [showMore, setShowMore] = useState(false);

  // Close on Escape key press and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenMovement = (type: MovementType) => {
    setMovementInitialType(type);
    setActiveForm('movement');
  };

  if (activeForm === 'movement') {
    return (
      <MovementModal
        isOpen={true}
        defaultType={movementInitialType}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'debt') {
    return (
      <DebtModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'debt_payment') {
    return (
      <DebtPaymentModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'saving_contrib') {
    return (
      <SavingContributionModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'saving_goal') {
    return (
      <SavingGoalModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'investor') {
    return (
      <InvestorModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'buyer') {
    return (
      <BuyerSaleModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'debtor') {
    return (
      <DebtorModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  if (activeForm === 'investment') {
    return (
      <InvestmentModal
        isOpen={true}
        onClose={() => {
          setActiveForm(null);
          onClose();
        }}
      />
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div>
            <h2 id="quick-add-title" className="text-base font-bold text-white">
              Nuevo Registro
            </h2>
            <p className="text-xs text-slate-300">
              ¿Qué movimiento deseas ingresar hoy?
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal de nuevo registro"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto">
          {/* 1. Registrar Ingreso */}
          <button
            onClick={() => handleOpenMovement('Ingreso')}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-emerald-200/90 bg-emerald-50/30 hover:border-emerald-500 hover:bg-emerald-50/80 text-left transition-colors group cursor-pointer"
          >
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-slate-900 block leading-snug">
                Registrar ingreso
              </span>
              <span className="text-xs text-slate-500 block truncate">
                Salario, honorarios, ventas o dinero recibido
              </span>
            </div>
          </button>

          {/* 2. Registrar Gasto */}
          <button
            onClick={() => handleOpenMovement('Gasto')}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-rose-200/90 bg-rose-50/30 hover:border-rose-500 hover:bg-rose-50/80 text-left transition-colors group cursor-pointer"
          >
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-slate-900 block leading-snug">
                Registrar gasto
              </span>
              <span className="text-xs text-slate-500 block truncate">
                Compras, mercado, arriendo o salidas del día a día
              </span>
            </div>
          </button>

          {/* 3. Registrar Transferencia */}
          <button
            onClick={() => handleOpenMovement('Transferencia')}
            className="w-full flex items-center gap-3.5 p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-100/80 text-left transition-colors group cursor-pointer"
          >
            <div className="p-2.5 bg-slate-800 text-white rounded-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Repeat className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-sm font-bold text-slate-900 block leading-snug">
                Registrar transferencia
              </span>
              <span className="text-xs text-slate-500 block truncate">
                Mover dinero entre tus cuentas bancarias o billeteras
              </span>
            </div>
          </button>

          {/* Botón Secundario: Ver más tipos de registro */}
          <div className="pt-2">
            <button
              onClick={() => setShowMore(!showMore)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
              aria-expanded={showMore}
            >
              <span>{showMore ? 'Ocultar tipos adicionales' : 'Ver más tipos de registro'}</span>
              {showMore ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          {/* Sección plegable con tipos secundarios */}
          {showMore && (
            <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* 4. Registrar ahorro */}
              <button
                onClick={() => {
                  if (savings.length === 0) {
                    setActiveForm('saving_goal');
                  } else {
                    setActiveForm('saving_contrib');
                  }
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-emerald-600 hover:bg-emerald-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar ahorro
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Apartar dinero en alcancías, cajitas o bolsillos
                  </span>
                </div>
              </button>

              {/* 5. Registrar deuda */}
              <button
                onClick={() => setActiveForm('debt')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-rose-500 hover:bg-rose-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar deuda
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Tarjeta de crédito, préstamo bancario o dinero que debes
                  </span>
                </div>
              </button>

              {/* 6. Registrar pago de deuda */}
              <button
                onClick={() => setActiveForm('debt_payment')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-rose-600 hover:bg-rose-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-slate-100 text-slate-800 rounded-lg shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar pago de deuda
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Abonar o liquidar una cuota de una deuda existente
                  </span>
                </div>
              </button>

              {/* 7. Registrar venta */}
              <button
                onClick={() => setActiveForm('buyer')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-teal-600 hover:bg-teal-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar venta
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Pedido de cliente con costo de proveedor y abono
                  </span>
                </div>
              </button>

              {/* 8. Registrar préstamo a un tercero */}
              <button
                onClick={() => setActiveForm('debtor')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-amber-600 hover:bg-amber-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar préstamo a un tercero
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Dinero prestado a alguien pendiente por cobrar
                  </span>
                </div>
              </button>

              {/* 9. Registrar inversionista */}
              <button
                onClick={() => setActiveForm('investor')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-indigo-600 hover:bg-indigo-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-indigo-100 text-indigo-800 rounded-lg shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar inversionista
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    Capital de terceros recibido con retorno pactado
                  </span>
                </div>
              </button>

              {/* 10. Registrar inversión propia */}
              <button
                onClick={() => setActiveForm('investment')}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/90 hover:border-violet-600 hover:bg-violet-50/40 text-left transition-colors group cursor-pointer"
              >
                <div className="p-2 bg-violet-100 text-violet-800 rounded-lg shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    Registrar inversión propia
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    CDT, acciones, criptoactivos o negocios propios
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
