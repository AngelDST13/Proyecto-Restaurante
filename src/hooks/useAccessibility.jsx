import { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe usarse dentro de un AccessibilityProvider');
  }
  return context;
};