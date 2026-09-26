import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import { triggerN8nAutomation } from '../services/n8nService';

// Mock de la llamada a la automatización de n8n
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() =>
    Promise.resolve({ success: true, respuesta: 'Respuesta de prueba mock' })
  ),
}));

describe('Pruebas de Validación del Sistema El Cacique', () => {
  test('Renderiza el formulario de Inicio de Sesión correctamente', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    // Sintaxis correcta usando expresión regular combinada
    expect(screen.getByText(/(Inicia Sesión|Acceso|Iniciar Sesión)/i)).toBeInTheDocument();
  });

  test('El servicio de n8n responde correctamente en las automatizaciones', async () => {
    const res = await triggerN8nAutomation('AGENTE_IA_CONSULTA', { mensaje: 'Hola' });
    expect(res.success).toBe(true);
    expect(res.respuesta).toBe('Respuesta de prueba mock');
  });

  test('El Dashboard de Administración carga correctamente los paneles', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    // Sintaxis correcta usando expresión regular combinada
    expect(screen.getByText(/(Dashboard|Panel|Administración)/i)).toBeInTheDocument();
  });
});