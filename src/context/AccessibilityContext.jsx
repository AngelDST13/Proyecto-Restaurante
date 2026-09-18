import { createContext, useState } from 'react';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('md');
  const [highContrast, setHighContrast] = useState(false);

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