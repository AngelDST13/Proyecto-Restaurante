import { useSyncExternalStore } from 'react';
import { readCollection, subscribeCollection } from '../services/liveSync';

/**
 * Coleccion compartida en tiempo real (ver `services/liveSync.js`). Se
 * re-renderiza cuando cualquier panel, en esta u otra pestaña, la modifica.
 */
export function useSharedCollection(key) {
  return useSyncExternalStore(
    (callback) => subscribeCollection(key, callback),
    () => readCollection(key),
    () => readCollection(key)
  );
}
