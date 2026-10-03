import { AlertCircle } from 'lucide-react';

/**
 * Modal de confirmacion de cierre de sesion.
 *
 * Evita cierres de sesion accidentales en todos los paneles operativos
 * (Admin, Cajero, Mesero y Cocina) mostrando siempre la misma pregunta:
 * "¿Desea cerrar la sesion activa?".
 *
 * Se cierra con Escape o con el boton Cancelar, y solo ejecuta `onConfirm`
 * cuando el usuario confirma explicitamente.
 */
export default function LogoutConfirmModal({
  isOpen,
  title = '¿Desea cerrar la sesión activa?',
  description = 'Se finalizará la sesión activa del panel operativo.',
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') onCancel?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Confirmar cierre de sesión"
        className="w-full max-w-sm rounded-3xl border border-(--cacique-border)/40 bg-(--cacique-card) p-6 text-center text-(--cacique-text) shadow-2xl cacique-card"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-600">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="mt-4 text-lg font-black text-(--cacique-on-card)">{title}</h3>
        <p className="mt-1 text-(--cacique-on-card-muted)">{description}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl border border-(--cacique-border)/40 px-4 py-3 font-bold text-(--cacique-text) transition-colors hover:border-(--cacique-accent)"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-3 font-extrabold text-white shadow-lg transition-colors hover:bg-red-700"
          >
            Sí, Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}