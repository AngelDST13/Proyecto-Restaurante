import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccesabilityContext';
import InteractiveGlow from './components/InteractiveGlow';

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <InteractiveGlow />
          <AppRouter />
        </BrowserRouter>
      </AccessibilityProvider>
    </AuthProvider>
  );
}