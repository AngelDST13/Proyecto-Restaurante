/**
 * Motivos de cierre de sesion compartidos por AuthContext y useAutoLogout.
 *
 * El motivo se guarda en sessionStorage, que se conserva en la misma pestaña
 * tras la recarga hacia /login, para poder informar al usuario por que se
 * cerro su sesion.
 */
export const LOGOUT_REASON_KEY = 'cacique_logout_reason';
export const INACTIVITY_REASON = 'inactividad';
