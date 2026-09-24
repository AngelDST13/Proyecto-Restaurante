import { createContext, useContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // -1: Pequeño, 0: Normal, 1: Grande, 2: Muy Grande

  const increaseFontSize = () => setFontSizeLevel((prev) => Math.min(prev + 1, 2));
  const decreaseFontSize = () => setFontSizeLevel((prev) => Math.max(prev - 1, -1));
  const resetFontSize = () => setFontSizeLevel(0);

  useEffect(() => {
    const root = document.documentElement;
    if (fontSizeLevel === -1) {
      root.style.fontSize = '90%';
    } else if (fontSizeLevel === 0) {
      root.style.fontSize = '100%';
    } else if (fontSizeLevel === 1) {
      root.style.fontSize = '110%';
    } else if (fontSizeLevel === 2) {
      root.style.fontSize = '120%';
    }
  }, [fontSizeLevel]);

  return (
    <AccessibilityContext.Provider value={{ fontSizeLevel, increaseFontSize, decreaseFontSize, resetFontSize }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de un AccessibilityProvider');
  }
  return context;
};