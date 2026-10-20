import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  Smartphone, 
  Sparkles, 
  Copy, 
  Check, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Branding and iOS theme */}
        <div className="bg-gradient-to-br from-slate-900 via-neutral-900 to-emerald-950 text-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <img 
                src="/apple-touch-icon.png" 
                alt="Control Financiero" 
                className="w-10 h-10 rounded-xl shadow-md border border-white/20 object-cover"
              />
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Instalar en tu iPhone</h3>
                <p className="text-xs text-emerald-300">Úsala como una App nativa independiente de Safari</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[11px] text-emerald-200 font-medium">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Pantalla completa · Sin barra de navegación · Carga rápida</span>
          </div>
        </div>

        {/* Step-by-Step Interactive Guide */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-xs">
              1
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Abre este enlace en Safari</span>
              </div>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                Apple requiere que el proceso se realice desde <strong>Safari</strong> en tu iPhone para crear el acceso independiente.
              </p>
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-300 rounded-md text-[11px] font-medium text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs mt-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">¡Enlace copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-neutral-500" />
                    <span>Copiar enlace para abrir en Safari</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-xs">
              2
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Toca el botón "Compartir" en Safari</span>
              </div>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                En la barra inferior de Safari en tu iPhone, pulsa el ícono de compartir (el cuadrado azul con la flecha hacia arriba <span className="font-bold font-mono">⎋</span>).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs">
              3
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <PlusSquare className="w-4 h-4 text-emerald-600" />
                <span>Selecciona "Agregar a inicio"</span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[11px]">
                Desliza hacia abajo en las opciones y presiona <strong className="text-emerald-950">"Agregar a inicio"</strong> (o <em>"Añadir a la pantalla de inicio"</em>).
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 text-xs">
              4
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Presiona "Agregar" arriba a la derecha</span>
              </div>
              <p className="text-neutral-600 leading-relaxed text-[11px]">
                El nombre aparecerá automáticamente como <strong>ControlFin</strong> con su ícono oficial. Toca <em>"Agregar"</em> en la esquina superior derecha.
              </p>
            </div>
          </div>

          {/* What happens next */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900 mb-1">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>¿Cómo funciona una vez agregada?</span>
            </div>
            <ul className="text-[11px] text-emerald-800 space-y-1 list-disc list-inside">
              <li>Se abrirá directamente en pantalla completa sin las barras de Safari.</li>
              <li>Tendrás tu propio icono en tu pantalla de inicio junto a tus demás aplicaciones.</li>
              <li>Podrás cambiar entre apps con los gestos normales de iPhone.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-neutral-500">
            Compatible con iOS 14, 15, 16, 17 y 18+
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>Listo, entendido</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
