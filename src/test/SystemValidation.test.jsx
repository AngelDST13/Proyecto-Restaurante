import { afterEach, describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import { AuthProvider } from '../context/AuthContext';
import { triggerN8nAutomation } from '../services/n8nService';

afterEach(() => vi.unstubAllGlobals());

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
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ respuesta: 'Respuesta de prueba' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await triggerN8nAutomation('AGENTE_IA_CONSULTA', { mensaje: 'Hola' });
    expect(res).toEqual(expect.objectContaining({ success: true, respuesta: 'Respuesta de prueba' }));
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/webhook/'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      modulo: 'AGENTE_IA_CONSULTA',
      mensaje: 'Hola',
    });
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
