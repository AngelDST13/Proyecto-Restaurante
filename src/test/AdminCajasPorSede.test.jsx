import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import {
  ADMIN_SEDES,
  createAdminRegister,
  getAdminRegisters,
  getAdminRegistersBySede,
  getRegisterSummary,
  getTestCredentialCards,
  removeAdminRegister
} from '../services/adminRegistersService';
import { TEST_ACCESS_CREDENTIALS, VALID_ACCOUNTS } from '../services/authSecurity';

const baseRegister = { label: 'Caja Norte', email: 'caja.norte@elcacique.com', password: 'CajaNorte2026', sede: 'escazu' };

describe('Servicio de cajas y credenciales por sede', () => {
  beforeEach(() => localStorage.clear());

  it('siembra una caja base por cada sede operativa', () => {
    expect(ADMIN_SEDES.map(sede => getRegisterSummary(sede).total)).toEqual([1, 1, 1, 1]);
    expect(getAdminRegisters().length).toBeGreaterThanOrEqual(4);
  });

  it('crea una caja dinamicamente en la sede seleccionada', () => {
    const result = createAdminRegister(baseRegister);

    expect(result.success).toBe(true);
    expect(result.register).toMatchObject({ label: 'Caja Norte', sede: 'escazu', readOnly: false });
    // La caja nueva convive con la caja base, no la reemplaza.
    expect(getAdminRegistersBySede('escazu')).toHaveLength(2);
    expect(getAdminRegistersBySede('escazu').map(register => register.email)).toContain('caja.norte@elcacique.com');
  });

  it('mantiene las cajas aisladas por sede', () => {
    createAdminRegister(baseRegister);

    expect(getAdminRegistersBySede('cartago').map(register => register.email)).not.toContain('caja.norte@elcacique.com');
    expect(getRegisterSummary('cartago').total).toBe(1);
  });

  it('rechaza sedes desconocidas, datos incompletos, correos inválidos y duplicados', () => {
    expect(createAdminRegister({ ...baseRegister, sede: 'limon' })).toMatchObject({ success: false });
    expect(createAdminRegister({ ...baseRegister, label: '   ' })).toMatchObject({ success: false });
    expect(createAdminRegister({ ...baseRegister, email: 'correo-malo' })).toMatchObject({ success: false });
    expect(createAdminRegister({ ...baseRegister, password: '123' })).toMatchObject({ success: false });

    createAdminRegister(baseRegister);
    expect(createAdminRegister(baseRegister)).toMatchObject({
      success: false,
      message: 'Ya existe una caja con el correo caja.norte@elcacique.com en Escazú.'
    });
  });

  it('compara los correos duplicados sin distinguir mayúsculas', () => {
    createAdminRegister(baseRegister);
    expect(createAdminRegister({ ...baseRegister, email: 'CAJA.NORTE@elcacique.com' })).toMatchObject({ success: false });
  });

  it('elimina solo las cajas creadas desde el panel', () => {
    const created = createAdminRegister(baseRegister).register;
    expect(removeAdminRegister(created.id)).toBe(true);
    expect(getAdminRegistersBySede('escazu').map(register => register.email)).not.toContain('caja.norte@elcacique.com');

    // Las cajas del catálogo base son de solo lectura.
    expect(removeAdminRegister('seed-escazu')).toBe(false);
    expect(getAdminRegistersBySede('escazu')).toHaveLength(1);
  });

  it('tolera almacenamiento corrupto sin romper el panel', () => {
    localStorage.setItem('cacique_admin_registers', 'no-es-json');
    expect(getAdminRegisters().length).toBeGreaterThanOrEqual(4);

    localStorage.setItem('cacique_admin_registers', JSON.stringify({ no: 'es un array' }));
    expect(getAdminRegisters().length).toBeGreaterThanOrEqual(4);
  });

  it('expone una tarjeta de credenciales por cada rol, incluido el Cliente Registrado', () => {
    const roles = getTestCredentialCards(TEST_ACCESS_CREDENTIALS).map(card => card.rol);

    expect(roles).toContain('Administrador');
    expect(roles).toContain('Cajero');
    expect(roles).toContain('Mesero');
    expect(roles).toContain('Cocina KDS');
    expect(roles).toContain('Cliente Registrado');
  });

  it('la credencial del cliente registrado es válida y no accede a paneles operativos', () => {
    const client = VALID_ACCOUNTS['cliente.escazu@elcacique.com'];
    expect(client).toMatchObject({ password: 'Cliente2026!', rol: 'cliente', sede: 'escazu' });
    expect(['administrador', 'cajero', 'mesero', 'cocina']).not.toContain(client.rol);
  });

  it('publica el correo y la contraseña completos del cliente en su tarjeta', () => {
    expect(getTestCredentialCards(TEST_ACCESS_CREDENTIALS).find(credential => credential.rol === 'Cliente Registrado'))
      .toMatchObject({ email: 'cliente.escazu@elcacique.com', password: 'Cliente2026!', sedeNombre: 'Escazú' });
  });

  it('nunca etiqueta el rol del salón como "Cajero / Mesero"', () => {
    expect(TEST_ACCESS_CREDENTIALS.map(credential => credential.rol)).not.toContain('Cajero / Mesero');
    expect(getTestCredentialCards(TEST_ACCESS_CREDENTIALS).map(card => card.rol)).not.toContain('Cajero / Mesero');
  });
});

describe('Sección de Cajas y Credenciales por Sede en el Admin', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.removeItem('cacique_admin_menu');
  });

  const renderAdmin = () => render(
    <AccessibilityProvider>
      <AuthProvider>
        <MemoryRouter><AdminDashboard /></MemoryRouter>
      </AuthProvider>
    </AccessibilityProvider>,
  );

  const openRegistersSection = () => {
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: /Configuración de Cajas y Credenciales por Sede/i }));
  };

  const fillRegisterForm = (values) => {
    fireEvent.change(screen.getByLabelText('Nombre de la caja'), { target: { value: values.label } });
    fireEvent.change(screen.getByLabelText('Correo de acceso de la caja'), { target: { value: values.email } });
    fireEvent.change(screen.getByLabelText('Contraseña de la caja'), { target: { value: values.password } });
    if (values.sede) fireEvent.change(screen.getByLabelText('Sede de la caja'), { target: { value: values.sede } });
  };

  it('crea una caja nueva asignada a la sede elegida', () => {
    openRegistersSection();

    fillRegisterForm({ label: 'Caja Turno Noche', email: 'caja.noche@elcacique.com', password: 'NocheCaja2026', sede: 'heredia' });
    fireEvent.click(screen.getByRole('button', { name: 'Crear caja' }));

    expect(getAdminRegistersBySede('heredia').map(register => register.email)).toContain('caja.noche@elcacique.com');
    expect(screen.getByText(/Caja creada en Heredia para Caja Turno Noche/i)).toBeInTheDocument();

    const row = within(screen.getByRole('table')).getByText('caja.noche@elcacique.com').closest('tr');
    expect(within(row).getByRole('button', { name: /Eliminar caja Caja Turno Noche/i })).toBeInTheDocument();
  });

  it('muestra el error de duplicado sin crear la caja repetida', () => {
    createAdminRegister(baseRegister);
    openRegistersSection();

    fillRegisterForm(baseRegister);
    fireEvent.click(screen.getByRole('button', { name: 'Crear caja' }));

    expect(screen.getByRole('alert')).toHaveTextContent(/Ya existe una caja con el correo caja.norte@elcacique.com en Escazú/i);
    expect(getAdminRegistersBySede('escazu').filter(register => register.email === baseRegister.email)).toHaveLength(1);
  });

  it('elimina una caja creada desde el panel', () => {
    createAdminRegister(baseRegister);
    openRegistersSection();

    fireEvent.click(screen.getByRole('button', { name: /Eliminar caja Caja Norte/i }));

    expect(getAdminRegistersBySede('escazu').map(register => register.email)).not.toContain(baseRegister.email);
    expect(screen.getByText(/Caja de Escazú eliminada/i)).toBeInTheDocument();
  });

  it('lista la caja base del catálogo como no eliminable', () => {
    openRegistersSection();

    // Se consulta solo la tabla: el correo también aparece en la barra lateral.
    const table = screen.getByRole('table');
    const seedRow = within(table).getByText('cajero.escazu@elcacique.com').closest('tr');
    expect(within(seedRow).getByText(/Caja base del catálogo/i)).toBeInTheDocument();
    expect(within(seedRow).queryByRole('button', { name: /Eliminar/i })).not.toBeInTheDocument();
  });

  it('cambia de sede y filtra las cajas listadas', () => {
    createAdminRegister(baseRegister);
    openRegistersSection();

    const table = screen.getByRole('table');
    expect(within(table).getByText('caja.norte@elcacique.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Heredia' }));

    expect(within(table).queryByText('caja.norte@elcacique.com')).not.toBeInTheDocument();
    expect(within(table).getByText('cajero.heredia@elcacique.com')).toBeInTheDocument();
  });
});
