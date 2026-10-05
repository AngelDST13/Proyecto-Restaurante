import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle } from 'lucide-react';

/**
 * Modal de confirmacion de cierre de sesion.
 *
 * Evita cierres de sesion accidentales en todos los paneles operativos
 * (Admin, Cajero, Mesero y Cocina) mostrando siempre la misma pregunta:
 * "¿Está seguro que desea cerrar la sesion activa?".
 *
 * Implementa el patron WAI-ARIA de dialogo modal: `role="dialog"`,
 * `aria-modal="true"` y cierre con la tecla Escape mediante un listener de
 * documento (el overlay por si solo solo capturaria la tecla con foco dentro).
 *
 * Se cierra con Escape o con el boton Cancelar, y solo ejecuta `onConfirm`
 * cuando el usuario confirma explicitamente.
 *
 * Se renderiza en un portal sobre `document.body`: el Navbar lo monta dentro
 * de su `<header>` con `backdrop-blur`, y un `backdrop-filter` convierte al
 * header en el bloque contenedor de los hijos `fixed`. Sin el portal, el
 * `fixed inset-0` cubria solo la franja del header y el dialogo quedaba
 * pegado arriba en lugar de centrado en la pantalla.
 */
export default function LogoutConfirmModal({
  isOpen,
  title = '¿Está seguro que desea cerrar la sesión activa?',
  description = 'Se finalizará la sesión activa y deberá iniciar nuevamente con sus credenciales.',
  onCancel,
  onConfirm,
}) {
  // El listener se declara siempre (antes de cualquier return temprano) para
  // respetar el orden de hooks de React, y solo se suscribe si el modal esta abierto.
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-testid="logout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        className="w-full max-w-sm rounded-3xl border border-(--cacique-border)/40 bg-(--cacique-card) p-6 text-center text-(--cacique-text) shadow-2xl cacique-card"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-600">
          <AlertCircle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 id="logout-modal-title" className="mt-4 text-lg font-black text-(--cacique-on-card)">{title}</h3>
        <p className="mt-1 text-(--cacique-on-card-muted)">{description}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-xl border border-(--cacique-border)/40 px-4 py-3 font-bold text-(--cacique-text) transition-colors hover:border-(--cacique-accent) active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-red-600 px-4 py-3 font-extrabold text-white shadow-lg transition-colors hover:bg-red-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            Sí, Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}