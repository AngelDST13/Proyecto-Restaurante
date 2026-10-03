import { createContext, useContext } from 'react';
import { useTalkBackEngine } from '../hooks/useTalkBack';

// eslint-disable-next-line react-refresh/only-export-components
export const TalkBackContext = createContext(null);

/**
 * Provider unico del lector de voz. Garantiza que el Navbar y el Panel de
 * Accesibilidad compartan la misma instancia de `window.speechSynthesis`.
 */
export function TalkBackProvider({ children, lang }) {
  const value = useTalkBackEngine({ lang });

  return <TalkBackContext.Provider value={value}>{children}</TalkBackContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTalkBack = () => {
  const context = useContext(TalkBackContext);
  if (!context) {
    throw new Error('useTalkBack debe usarse dentro de un TalkBackProvider');
  }
  return context;
};

export default TalkBackProvider;