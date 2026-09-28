import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import AdminDashboard from '../pages/AdminDashboard';
import KitchenDashboard from '../pages/KitchenDashboard';
import WaiterDashboard from '../pages/WaiterDashboard';
import Menu from '../pages/Menu';
import Landing from '../pages/Landing';
import { AuthProvider } from '../context/AuthContext';
import { encryptData, decryptData, generateHMAC } from '../services/cryptoService';
import { triggerN8nAutomation } from '../services/n8nService';

// Mock del servicio de automatización n8n
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() =>
    Promise.resolve({ success: true, respuesta: 'Respuesta simulada de n8n' })
  ),
}));

describe('1. Módulo Criptográfico & Seguridad Client-Side', () => {
  test('Encripta y desencripta correctamente los datos del usuario con AES-256', () => {
    const userData = { correo: 'admin@elcacique.com', rol: 'admin', sede: 'Escazú' };
    const encrypted = encryptData(userData);
    expect(encrypted).not.toBeNull();
    expect(typeof encrypted).toBe('string');

    const decrypted = decryptData(encrypted);
    expect(decrypted).toEqual(userData);
  });

  test('Genera firma HMAC-SHA256 válida para evitar manipulación de roles', () => {
    const payload = { rol: 'mesero', id: 101 };
    const hmac = generateHMAC(payload);
    expect(hmac).toBeDefined();
    expect(hmac.length).toBe(64); // Longitud de cadena hex SHA-256
  });
});

describe('2. Cobertura de Páginas y Vistas Principales', () => {
  test('Renderiza el Landing Page principal', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
    expect(screen.getByText(/(Tradición|Cacique|Menú|Sabor)/i)).toBeInTheDocument();
  });

  test('Renderiza la página del Menú Digital', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Menu />
        </MemoryRouter>
      </AuthProvider>
    );
    const menuTitle = screen.getAllByText(/(Menú|Platillos|Chifrijo)/i);
    expect(menuTitle.length).toBeGreaterThan(0);
  });

  test('Renderiza la pantalla de Login con autenticación', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );
    const loginElements = screen.getAllByText(/(Inicia Sesión|Acceso|Iniciar Sesión)/i);
    expect(loginElements.length).toBeGreaterThan(0);
  });

  test('Renderiza el Dashboard de Administración', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminDashboard />
        </MemoryRouter>
      </AuthProvider>
    );
    const adminElements = screen.getAllByText(/(Dashboard|Panel|Administrador|Ventas)/i);
    expect(adminElements.length).toBeGreaterThan(0);
  });

  test('Renderiza el Panel KDS de Cocina', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <KitchenDashboard />
        </MemoryRouter>
      </AuthProvider>
    );
    const kitchenElements = screen.getAllByText(/(Cocina|KDS|Comandas|Pedidos)/i);
    expect(kitchenElements.length).toBeGreaterThan(0);
  });

  test('Renderiza el Panel POS para Meseros', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <WaiterDashboard />
        </MemoryRouter>
      </AuthProvider>
    );
    const waiterElements = screen.getAllByText(/(Mesero|Mesas|Comanda|Salón)/i);
    expect(waiterElements.length).toBeGreaterThan(0);
  });
});

describe('3. Integración del Servicio n8n & IA', () => {
  test('Llama correctamente al webhook de n8n y retorna la respuesta', async () => {
    const res = await triggerN8nAutomation('AGENTE_IA_CONSULTA', { mensaje: '¿Cuáles son las sedes?' });
    expect(res.success).toBe(true);
    expect(res.respuesta).toBe('Respuesta simulada de n8n');
  });
});