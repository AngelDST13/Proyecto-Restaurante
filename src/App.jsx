import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0A090C] text-[#F8FFE5] relative">
            <AppRouter />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}