import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppRouter } from './routes/AppRouter';
import { useAutoLogout } from './hooks/useAutoLogout';
import Footer from './components/Footer';

function AppContent() {
  // Cierre de sesión automático tras 5 minutos de inactividad
  useAutoLogout(5);

  return (
    <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] flex flex-col justify-between relative">
      <AppRouter />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}