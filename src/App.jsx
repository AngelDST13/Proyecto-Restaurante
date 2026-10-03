import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import AccessibilityPanel from './components/AccessibilityPanel';
import { TalkBackProvider } from './context/TalkBackContext';
import InteractiveGlow from './components/InteractiveGlow';

export default function App() {
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
