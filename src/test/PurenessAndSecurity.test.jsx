import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import FacturacionPanel from '../components/FacturacionPanel';
import { decryptData, encryptData } from '../services/cryptoService';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

describe('Pureza de render y protección de datos', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('no consulta reloj ni aleatoriedad al renderizar; genera IDs al guardar desde una acción', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    const randomSpy = vi.spyOn(Math, 'random');
    render(<StrictMode><AccessibilityProvider><AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider></StrictMode>);
    expect(nowSpy).not.toHaveBeenCalled();
    expect(randomSpy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Gestión de Menú/i }));
    fireEvent.change(screen.getByPlaceholderText('Nombre del platillo'), { target: { value: 'Platillo puro' } });
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '2500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar platillo' }));
    expect(nowSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Platillo puro')).toBeInTheDocument();
  });

  it('no genera IDs o fechas al renderizar la caja; reacciona al guardar una venta', () => {
    const nowSpy = vi.spyOn(Date, 'now');
    const randomSpy = vi.spyOn(Math, 'random');
    render(<FacturacionPanel sede="heredia" />);
    expect(nowSpy).not.toHaveBeenCalled();
    expect(randomSpy).not.toHaveBeenCalled();
  });

  it('cifra como AES con prefijo de versión, conserva compatibilidad y rechaza texto alterado', () => {
    const data = { nombre: 'Colaborador', iban: 'CR05010200009876543210' };
    const encrypted = encryptData(data);
    expect(encrypted).toMatch(/^aes2:/);
    expect(encrypted).not.toContain(data.iban);
    expect(decryptData(encrypted)).toEqual(data);
    expect(encryptData(null)).toBeNull();
    expect(decryptData(null)).toBeNull();
    expect(decryptData('contenido alterado no cifrado')).toBeNull();

    const legacyKey = 'CACIQUE_SECURE_TOKEN_2026_PROD';
    const legacyClear = JSON.stringify({ legacy: true });
    const legacyRaw = Array.from(legacyClear, (char, index) => String.fromCharCode(char.charCodeAt(0) ^ legacyKey.charCodeAt(index % legacyKey.length))).join('');
    expect(decryptData(btoa(legacyRaw))).toEqual({ legacy: true });
  });
});
