import { useEffect } from 'react';

/**
 * Evento global para solicitar la apertura del modal de reservas desde
 * cualquier punto de la aplicacion (Navbar, tarjetas de Eventos, etc.).
 *
 * Evita tener que pasar un callback a traves de varias capas de componentes:
 * el Navbar global vive en AppRouter y la pagina que posee el modal es
 * Landing, por lo que un evento en `window` conecta ambos puntos.
 */
export const RESERVATION_REQUEST_EVENT = 'cacique:open-reservation';

/** Solicita la apertura del modal de reservas. */
export const requestReservationModal = (type = 'General') => {
  window.dispatchEvent(
    new CustomEvent(RESERVATION_REQUEST_EVENT, { detail: { type } }),
  );
};

/**
 * Escucha las solicitudes de apertura del modal de reservas.
 * @param {(type: string) => void} onOpen Callback que abre el modal.
 * @returns {void}
 */
export function useReservationRequestHandler(onOpen) {
  useEffect(() => {
    if (typeof onOpen !== 'function') return undefined;

    const handleRequest = (event) => {
      onOpen(event?.detail?.type ?? 'General');
    };

    window.addEventListener(RESERVATION_REQUEST_EVENT, handleRequest);
    return () => window.removeEventListener(RESERVATION_REQUEST_EVENT, handleRequest);
  }, [onOpen]);
}

export default useReservationRequestHandler;