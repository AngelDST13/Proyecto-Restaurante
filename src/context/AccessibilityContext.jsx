import { createContext, useState } from 'react';

// The context and provider must remain in this module for the current API.
// eslint-disable-next-line react-refresh/only-export-components
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