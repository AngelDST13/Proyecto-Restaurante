import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#F8F9FA] text-[#1F2937] relative">
            <AppRouter />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}