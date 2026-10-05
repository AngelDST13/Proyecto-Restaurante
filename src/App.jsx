import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AccessibilityPanel from './components/AccessibilityPanel';
import WhatsAppFloatButton from './components/WhatsAppFloatButton';
import { TalkBackProvider } from './context/TalkBackContext';
import InteractiveGlow from './components/InteractiveGlow';

/** Titulo de la pestana del navegador (debe coincidir con index.html). */
const APP_TITLE = 'El Cacique';

export default function App() {
  // Ninguna vista cambia el titulo: se fija una vez al montar la aplicacion.
  useEffect(() => {
    document.title = APP_TITLE;
  }, []);

  return (
    <AuthProvider>
      <AccessibilityProvider>
        <TalkBackProvider>
          <BrowserRouter>
            <InteractiveGlow />
            <div id="cacique-app-root" className="w-full max-w-full min-w-0">
              <AppRouter />
            </div>
            <AccessibilityPanel />
            <WhatsAppFloatButton />
            <div
              id="cacique-aria-live-region"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            />
          </BrowserRouter>
        </TalkBackProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}
