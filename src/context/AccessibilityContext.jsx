import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('md'); // 'sm', 'md', 'lg'
  const [highContrast, setHighContrast] = useState(false);

  const toggleFontSize = () => {
    if (fontSize === 'sm') setFontSize('md');
    else if (fontSize === 'md') setFontSize('lg');
    else setFontSize('sm');
  };

  return (
    <AccessibilityContext.Provider value={{ fontSize, toggleFontSize, highContrast, setHighContrast }}>
      <div className={`accessibility-root size-${fontSize} ${highContrast ? 'high-contrast' : ''}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => useContext(AccessibilityContext);