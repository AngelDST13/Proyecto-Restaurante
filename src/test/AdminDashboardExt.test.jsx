import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import { triggerN8nAutomation } from '../services/n8nService';
import { decryptData, encryptData } from '../services/authSecurity';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true, mode: 'local', message: 'mock ok' })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const renderAdmin = () => render(<AccessibilityProvider><AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider>);
const openSection = name => fireEvent.click(screen.getByRole('button', { name: new RegExp(name, 'i') }));

describe('AdminDashboard secondary modules', () => {
  it('actualiza métricas por período y sede y exporta reportes', () => {
    const createObjectURL = vi.fn(() => 'blob:qa-report');
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Semana' }));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'santa_ana' } });
    fireEvent.click(screen.getByTitle('Exportar CSV'));
    fireEvent.click(screen.getByTitle('Exportar JSON'));
    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
    click.mockRestore();
  });

  it('renderiza los módulos de operación, clientes y caja', () => {
    renderAdmin();
    for (const [nav, heading] of [
      ['Proveedores', 'Directorio de Proveedores'],
      ['Centro de Correos', 'Centro de Correos y Comunicados'],
      ['Cupones & Promos', 'Cupones y Promociones'],
      ['Reseñas & Clientes', 'Reseñas y Clientes'],
      ['Arqueo de Caja & POS', 'Arqueo Financiero Diario de Caja'],
      ['Personal & Planilla', 'Personal y planilla'],
      ['Mesas & Reservaciones', 'Control de Mesas']
    ]) {
      openSection(nav);
      expect(screen.getByText(new RegExp(heading, 'i'))).toBeInTheDocument();
    }
  });

  it('abre y cierra los modales de proveedor y factura, y permite registrar factura', () => {
    renderAdmin();
    openSection('Proveedores');
    fireEvent.click(screen.getByRole('button', { name: /Registrar Proveedor/i }));
    expect(screen.getByText('Registrar Nuevo Proveedor')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    openSection('Facturas & Finanzas');
    fireEvent.click(screen.getAllByRole('button', { name: 'Proveedores' })[1]);
    fireEvent.click(screen.getByRole('button', { name: /Subir Factura/i }));
    expect(screen.getByText('Subir y Registrar Factura')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Código \/ número de factura/i), { target: { value: 'QA-2026-1' } });
    fireEvent.change(screen.getByPlaceholderText('Proveedor'), { target: { value: 'Proveedor QA' } });
    fireEvent.change(screen.getByPlaceholderText('Monto total'), { target: { value: '10000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar Factura' }));
    expect(screen.getByText('QA-2026-1')).toBeInTheDocument();
  });

  it('filtra inventario y crea, edita y elimina insumos', () => {
    renderAdmin();
    openSection('Gestión de Inventario');
    fireEvent.change(screen.getByPlaceholderText(/Buscar insumo por nombre/i), { target: { value: 'Yuca' } });
    expect(screen.getByText('Yuca Fresca de Paila')).toBeInTheDocument();
    expect(screen.queryByText('Carne de Cerdo para Chicharrón')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Buscar insumo por nombre/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Agregar Insumo/i }));
    fireEvent.change(screen.getByPlaceholderText(/Carne de Cerdo para Chicharrón/i), { target: { value: 'Tomate QA' } });
    fireEvent.change(screen.getByPlaceholderText('Cantidad...'), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 30'), { target: { value: '5' } });
    fireEvent.change(screen.getByPlaceholderText('ej: 200'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Insumo' }));
    expect(screen.getByText('Tomate QA')).toBeInTheDocument();
    const tomatoRow = screen.getByText('Tomate QA').closest('tr');
    fireEvent.click(within(tomatoRow).getByTitle('Editar Insumo y Límites'));
    expect(screen.getByText('Editar Insumo & Umbrales')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Carne de Cerdo para Chicharrón/i), { target: { value: 'Tomate Editado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Insumo' }));
    expect(screen.getByText('Tomate Editado')).toBeInTheDocument();
    fireEvent.click(within(screen.getByText('Tomate Editado').closest('tr')).getByTitle('Eliminar Insumo'));
    expect(screen.queryByText('Tomate Editado')).not.toBeInTheDocument();
  });

  it('guarda proveedores y procesa comunicados con la respuesta del servicio', async () => {
    renderAdmin();
    openSection('Proveedores');
    fireEvent.click(screen.getByRole('button', { name: /Registrar Proveedor/i }));
    fireEvent.change(screen.getByPlaceholderText('Nombre de la empresa'), { target: { value: 'Proveedor QA' } });
    fireEvent.change(screen.getByPlaceholderText('Contacto principal'), { target: { value: 'Contacto QA' } });
    fireEvent.change(screen.getByPlaceholderText('Correo'), { target: { value: 'qa@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Proveedor' }));
    expect(screen.getByText('Proveedor QA')).toBeInTheDocument();

    openSection('Centro de Correos');
    fireEvent.change(screen.getByPlaceholderText('Asunto del comunicado'), { target: { value: 'Aviso QA' } });
    fireEvent.change(screen.getByPlaceholderText('Escriba el mensaje...'), { target: { value: 'Mensaje de prueba' } });
    fireEvent.click(screen.getByRole('button', { name: /Despachar con n8n/i }));
    await waitFor(() => expect(screen.getByText(/Respuesta del envío/i)).toBeInTheDocument());
    expect(triggerN8nAutomation).toHaveBeenCalled();
  });

  it('carga una plantilla, guarda un contacto y administra empleados de planilla', () => {
    localStorage.removeItem('cacique_admin_email_contacts');
    localStorage.removeItem('cacique_admin_payroll');
    localStorage.setItem('cacique_registered_clients', encryptData({
      'registered@example.com': { nombre: 'Cliente registrado', rol: 'cliente' }
    }));
    renderAdmin();
    openSection('Centro de Correos');
    fireEvent.click(screen.getByRole('button', { name: 'Bienvenida' }));
    expect(screen.getByPlaceholderText('Asunto del comunicado')).toHaveValue('Bienvenido a El Cacique');
    fireEvent.click(screen.getByRole('button', { name: 'Promoción de temporada' }));
    expect(screen.getByPlaceholderText('Asunto del comunicado')).toHaveValue('Promoción de temporada');
    fireEvent.click(screen.getByRole('button', { name: 'Reabastecimiento' }));
    expect(screen.getByPlaceholderText('Asunto del comunicado')).toHaveValue('Aviso de reabastecimiento');
    expect(screen.getByText('Cliente registrado — registered@example.com')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre del cliente'), { target: { value: 'María QA' } });
    fireEvent.change(screen.getByLabelText('Correo del cliente'), { target: { value: 'maria.qa@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }));
    expect(screen.getByText('María QA — maria.qa@example.com')).toBeInTheDocument();
    expect(decryptData(localStorage.getItem('cacique_admin_email_contacts'))).toEqual(expect.arrayContaining([
      expect.objectContaining({ nombre: 'María QA', correo: 'maria.qa@example.com' })
    ]));

    openSection('Personal & Planilla');
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Colaborador QA' } });
    fireEvent.change(screen.getByLabelText('Salario mensual'), { target: { value: '500000' } });
    fireEvent.change(screen.getByLabelText('Frecuencia de pago'), { target: { value: 'Mensual' } });
    fireEvent.change(screen.getByLabelText('Días de pago'), { target: { value: 'Último día del mes' } });
    fireEvent.change(screen.getByLabelText('Cuenta IBAN'), { target: { value: 'cr123456789' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar empleado' }));
    expect(screen.getByText('Colaborador QA')).toBeInTheDocument();
    expect(screen.getByText('Mensual: Último día del mes')).toBeInTheDocument();
    expect(screen.getByText('CR123456789')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Editar Colaborador QA' }));
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Colaborador Editado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(screen.getByText('Colaborador Editado')).toBeInTheDocument();
    expect(screen.queryByText('Colaborador QA')).not.toBeInTheDocument();
    expect(decryptData(localStorage.getItem('cacique_admin_payroll'))).toEqual(expect.arrayContaining([
      expect.objectContaining({ nombre: 'Colaborador Editado', salario: 500000, iban: 'CR123456789' })
    ]));
  }, 15000);

  it('despacha las audiencias dinámicas de proveedores y personal', async () => {
    localStorage.removeItem('cacique_admin_payroll');
    localStorage.removeItem('cacique_admin_email_contacts');
    localStorage.removeItem('cacique_registered_clients');
    renderAdmin();
    openSection('Centro de Correos');
    for (const [audience, expectedEmails] of [
      ['todos_proveedores', ['ventas@sanmartin.cr', 'pedidos@zarcero.cr', 'contacto@coronadocruz.cr']],
      ['personal_meseros', ['Angel Daniela Salazar T.', 'Carlos Ramírez']]
    ]) {
      fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: audience } });
      fireEvent.change(screen.getByPlaceholderText('Asunto del comunicado'), { target: { value: `Prueba ${audience}` } });
      fireEvent.change(screen.getByPlaceholderText('Escriba el mensaje...'), { target: { value: 'Comunicado de prueba' } });
      fireEvent.click(screen.getByRole('button', { name: /Despachar con n8n/i }));
      await waitFor(() => expect(screen.getByText(/Respuesta del envío/i)).toBeInTheDocument());
      expect(triggerN8nAutomation).toHaveBeenLastCalledWith(
        'INVENTARIO_ALERTA',
        expect.objectContaining({ destinatarios: expectedEmails })
      );
    }
  }, 15000);
});
