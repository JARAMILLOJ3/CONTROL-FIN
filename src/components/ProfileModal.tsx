import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Trash2, Edit2, Share2, Copy, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { UserProfile } from '../types/finance';
import { ConfirmModal } from './ConfirmModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { 
    profiles, 
    currentProfileId, 
    switchProfile, 
    addProfile, 
    renameProfile, 
    deleteProfile 
  } = useFinance();

  const [isCreating, setIsCreating] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    const colors = ['#0F172A', '#2563EB', '#059669', '#7C3AED', '#D97706', '#DB2777'];
    const randomColor = colors[profiles.length % colors.length];
    const createdId = addProfile(newNombre.trim(), randomColor);
    setToastMessage(`Perfil "${newNombre.trim()}" creado y activado`);
    setTimeout(() => setToastMessage(null), 3000);
    setNewNombre('');
    setIsCreating(false);
  };

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditNombre(currentName);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editNombre.trim()) {
      renameProfile(id, editNombre.trim());
      setToastMessage('Nombre actualizado correctamente');
      setTimeout(() => setToastMessage(null), 2500);
    }
    setEditingId(null);
  };

  const handleDeleteClick = (profile: UserProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) {
      setToastMessage('No puedes eliminar el único perfil registrado');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setProfileToDelete(profile);
  };

  const handleConfirmDelete = () => {
    if (!profileToDelete) return;
    const targetName = profileToDelete.nombre;
    const targetId = profileToDelete.id;
    deleteProfile(targetId);
    setProfileToDelete(null);
    setToastMessage(`Perfil "${targetName}" y todos sus datos fueron eliminados`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Perfiles y Espacios de Finanzas
              </h3>
              <p className="text-xs text-neutral-500">
                Permite que varias personas lleven sus finanzas por separado en la misma aplicación
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Feedback notification toast */}
            {toastMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Selector de Perfiles Actuales */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Perfiles en este dispositivo ({profiles.length})
                </span>
                {!isCreating && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-900 hover:text-neutral-700 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Añadir otra persona / perfil</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {profiles.map((p) => {
                  const isSelected = p.id === currentProfileId;
                  const isEditing = editingId === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          if (!isEditing) {
                            switchProfile(p.id);
                            onClose();
                          }
                        }}
                        className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                          style={{ backgroundColor: p.color || '#0F172A' }}
                        >
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editNombre}
                              autoFocus
                              onChange={(e) => setEditNombre(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(p.id, e as unknown as React.MouseEvent);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="px-2.5 py-1 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-neutral-900 w-full max-w-[200px]"
                            />
                            <button
                              type="button"
                              onClick={(e) => handleSaveRename(p.id, e)}
                              className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800"
                              title="Guardar nombre"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(null);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-neutral-700 rounded"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                              <span>{p.nombre}</span>
                              {isSelected && (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  Activo ahora
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-500">
                              Espacio financiero independiente
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={(e) => handleStartRename(p.id, p.nombre, e)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded transition-colors"
                            title="Cambiar nombre"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {profiles.length > 1 ? (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(p, e)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title={`Eliminar perfil "${p.nombre}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span
                            className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded cursor-help font-medium"
                            title="Debe haber al menos un perfil activo en el sistema"
                          >
                            Único
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {profiles.length === 1 && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-neutral-500 px-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Para poder eliminar un perfil, debes tener al menos 2 perfiles creados.</span>
                </div>
              )}
            </div>

            {/* Formulario para Crear Nuevo Perfil */}
            {isCreating && (
              <form onSubmit={handleCreate} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    Crear Nuevo Perfil o Persona
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-xs text-neutral-500 hover:text-neutral-900"
                  >
                    Cancelar
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nombre de la persona o entidad
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ej: Juan, María, Negocio 2, Socio, Casa"
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800"
                  >
                    Crear y Activar
                  </button>
                </div>
              </form>
            )}

            {/* Explicación de cómo compartir con otras personas */}
            <div className="p-4 border border-neutral-200 rounded-lg bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <Share2 className="w-4 h-4 text-neutral-700" />
                <span>¿Cómo pueden otras personas usar esta app?</span>
              </div>

              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-neutral-900">1.</span>
                  <p>
                    <strong>En el mismo dispositivo/celular:</strong> Agrega aquí los perfiles de cada persona (ej: tú, tu pareja, tu socio). Cada perfil tiene sus finanzas, cuentas, deudas y ventas 100% aisladas.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-neutral-900">2.</span>
                  <p>
                    <strong>En su propio dispositivo:</strong> Comparte el enlace de la app. Cada persona inicia sesión con su propia cuenta de Google gratis y tiene su nube totalmente independiente.
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyAppUrl}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? '¡Enlace copiado al portapapeles!' : 'Copiar enlace para compartir'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to replace blocked window.confirm */}
      <ConfirmModal
        isOpen={Boolean(profileToDelete)}
        title={`¿Eliminar el perfil "${profileToDelete?.nombre}"?`}
        message="Se eliminarán permanentemente todos los movimientos, deudores, compradores, inversiones y cuentas registrados exclusivamente bajo este perfil. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar perfil"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setProfileToDelete(null)}
      />
    </>
  );
};
