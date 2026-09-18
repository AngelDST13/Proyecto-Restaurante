import { createContext, useContext, useState } from 'react';

// 1. Creación del contexto de accesibilidad
export const AccessibilityContext = createContext();

// 2. Proveedor global del contexto
export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('md'); // Opciones: 'sm', 'md', 'lg'
  const [highContrast, setHighContrast] = useState(false);

  // Función para alternar dinámicamente el tamaño de la fuente
  const toggleFontSize = () => {
    if (fontSize === 'sm') setFontSize('md');
    else if (fontSize === 'md') setFontSize('lg');
    else setFontSize('sm');
  };

  return (
    <AccessibilityContext.Provider 
      value={{ 
        fontSize, 
        setFontSize, 
        toggleFontSize, 
        highContrast, 
        setHighContrast 
      }}
    >
      <div className={`accessibility-root size-${fontSize} ${highContrast ? 'high-contrast' : ''}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

// 3. Hook personalizado para consumir la accesibilidad fácilmente en Navbar u otros componentes
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de un AccessibilityProvider');
  }
  return context;
};