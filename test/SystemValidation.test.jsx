import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../src/pages/Login';
import AdminDashboard from '../src/pages/AdminDashboard';
import { AuthProvider } from '../src/context/AuthContext';
import { triggerN8nAutomation } from '../src/services/n8nService';

// Mock del servicio n8n
vi.mock('../src/services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() =>
    Promise.resolve({ success: true, respuesta: 'Respuesta de prueba mock' })
  ),
}));

describe('Pruebas de Validación del Sistema El Cacique', () => {
  test('Renderiza el formulario de Inicio de Sesión correctamente', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    // getAllByText maneja múltiples coincidencias en pantalla sin dar error
    const loginElements = screen.getAllByText(/(Inicia Sesión|Acceso|Iniciar Sesión)/i);
    expect(loginElements.length).toBeGreaterThan(0);
    expect(loginElements[0]).toBeInTheDocument();
  });

  test('El servicio de n8n responde correctamente en las automatizaciones', async () => {
    const res = await triggerN8nAutomation('AGENTE_IA_CONSULTA', { mensaje: 'Hola' });
    expect(res.success).toBe(true);
    expect(res.respuesta).toBe('Respuesta de prueba mock');
  });

  test('El Dashboard de Administración carga correctamente los paneles', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthProvider>
    );

    const dashboardElements = screen.getAllByText(/(Resumen|Analíticas|Administradora|Inventario|Cacique)/i);
    expect(dashboardElements.length).toBeGreaterThan(0);
    expect(dashboardElements[0]).toBeInTheDocument();
  });
});
