import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import AdminDashboard from '../pages/AdminDashboard';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const renderAdmin = () => {
  localStorage.removeItem('cacique_admin_menu');
  return render(<AccessibilityProvider><AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider>);
};
const open = label => fireEvent.click(screen.getByRole('button', { name: new RegExp(label, 'i') }));

describe('AdminDashboard: menú e invoices con interacciones del DOM real', () => {
  it('agrega platillos sin exclusiones, con una exclusión y con varias; alterna sedes', () => {
    renderAdmin();
    open('Gestión de Menú');
    fireEvent.change(screen.getByPlaceholderText('Nombre del platillo'), { target: { value: 'Platillo QA libre' } });
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '3500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar platillo' }));
    expect(screen.getByText('Platillo QA libre')).toBeInTheDocument();

    const escazu = screen.getByLabelText(/No disponible en Sede Escazú/i);
    fireEvent.click(escazu);
    expect(escazu).toBeChecked();
    fireEvent.click(escazu);
    expect(escazu).not.toBeChecked();
    fireEvent.click(escazu);
    fireEvent.click(screen.getByLabelText(/No disponible en Sede Santa Ana/i));
    fireEvent.change(screen.getByPlaceholderText('Nombre del platillo'), { target: { value: 'Platillo QA excluido' } });
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '4200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar platillo' }));
    expect(screen.getByText('No disponible en: Sede Escazú, Sede Santa Ana')).toBeInTheDocument();
  });

  it('cubre categoría duplicada y válida, búsqueda y periodos de facturas', () => {
    renderAdmin();
    open('Gestión de Menú');
    const category = screen.getByPlaceholderText('Nueva categoría o sección');
    fireEvent.change(category, { target: { value: 'Bebidas' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getByText('Esta categoría ya existe')).toBeInTheDocument();
    fireEvent.change(category, { target: { value: 'Especiales QA' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    expect(screen.getAllByRole('option', { name: 'Especiales QA' })).toHaveLength(2);

    open('Facturas & Finanzas');
    expect(screen.getAllByText(/FE-001/).length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Este mes' }));
    expect(screen.getAllByText(/FE-001/).length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente, identificación/i), { target: { value: 'Bryan' } });
    expect(screen.getByText('Bryan Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Corporación El Sol S.A.')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Buscar cliente, identificación/i), { target: { value: 'no existe' } });
    expect(screen.getByText(/No hay facturas que coincidan/i)).toBeInTheDocument();
  });

  it('elimina platillos desde el botón accesible y conserva los restantes', () => {
    renderAdmin();
    open('Gestión de Menú');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Chifrijo Especial Cacique' }));
    expect(screen.queryByText('Chifrijo Especial Cacique')).not.toBeInTheDocument();
    expect(screen.getByText('Vigorón Criollo (1kg)')).toBeInTheDocument();
  });

  it('edita un platillo existente y refleja precio, categoría, descripción y restricciones', () => {
    renderAdmin();
    open('Gestión de Menú');
    fireEvent.click(screen.getByRole('button', { name: 'Editar Chifrijo Especial Cacique' }));
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '7900' } });
    fireEvent.change(screen.getByPlaceholderText('Descripción breve'), { target: { value: 'Receta actualizada de prueba' } });
    fireEvent.change(screen.getByLabelText('Categoría del platillo'), { target: { value: 'Bebidas' } });
    fireEvent.click(screen.getByLabelText(/No disponible en Sede Heredia/i));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios del platillo' }));
    expect(screen.getByText('Receta actualizada de prueba')).toBeInTheDocument();
    expect(screen.getByText('No disponible en: Sede Heredia')).toBeInTheDocument();
    expect(screen.getByText(/₡7.?900/)).toBeInTheDocument();
  });

  it('elimina el control de fuente del Sidebar: solo queda en el Dock de Accesibilidad', () => {
    renderAdmin();
    expect(screen.queryByRole('button', { name: 'Aumentar tamaño de letra' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reducir tamaño de letra' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Tamaño del texto')).not.toBeInTheDocument();
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('actualiza y persiste el stock de la sede cuando registra una compra en caja', () => {
    localStorage.removeItem('cacique_admin_inventory');
    renderAdmin();
    open('Arqueo de Caja & POS');
    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '10000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));
    fireEvent.change(screen.getByLabelText('Insumo comprado'), { target: { value: 'Carne de Cerdo para Chicharrón' } });
    fireEvent.change(screen.getByLabelText('Cantidad comprada'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Costo de compra'), { target: { value: '8000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Registrar compra' }));
    expect(JSON.parse(localStorage.getItem('cacique_admin_inventory'))).toEqual(expect.arrayContaining([
      expect.objectContaining({ nombre: 'Carne de Cerdo para Chicharrón', stock: 125, sede: 'escazu' })
    ]));
    open('Gestión de Inventario');
    expect(screen.getByText('125 kg')).toBeInTheDocument();
  });

  it('muestra el cambio de color al alternar disponibilidad por sede', () => {
    renderAdmin();
    open('Gestión de Menú');
    const checkbox = screen.getByLabelText('No disponible en Sede Escazú');
    const card = checkbox.closest('label');
    expect(card).toHaveClass('bg-emerald-950/40');
    fireEvent.click(checkbox);
    expect(card).toHaveClass('bg-rose-950/40');
    expect(card).toHaveTextContent('No Disponible');
  });

  it('selecciona varios clientes para un envío de correo', async () => {
    renderAdmin();
    open('Centro de Correos');
    fireEvent.change(screen.getByLabelText('Nombre del cliente'), { target: { value: 'Cliente Uno' } });
    fireEvent.change(screen.getByLabelText('Correo del cliente'), { target: { value: 'uno@example.cr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }));
    fireEvent.change(screen.getByLabelText('Nombre del cliente'), { target: { value: 'Cliente Dos' } });
    fireEvent.change(screen.getByLabelText('Correo del cliente'), { target: { value: 'dos@example.cr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }));
    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: 'clientes_seleccionados' } });
    fireEvent.click(screen.getByLabelText('Cliente Uno — uno@example.cr'));
    fireEvent.click(screen.getByLabelText('Cliente Dos — dos@example.cr'));
    fireEvent.change(screen.getByPlaceholderText('Asunto del comunicado'), { target: { value: 'Aviso QA' } });
    fireEvent.change(screen.getByPlaceholderText('Escriba el mensaje...'), { target: { value: 'Mensaje QA' } });
    fireEvent.click(screen.getByRole('button', { name: /Despachar con n8n/i }));
    const { triggerN8nAutomation } = await import('../services/n8nService');
    expect(triggerN8nAutomation).toHaveBeenCalledWith('INVENTARIO_ALERTA', expect.objectContaining({ destinatarios: ['uno@example.cr', 'dos@example.cr'] }));
  });

  it('ejecuta fallback del logo y acciones de inventario, promociones, reseñas y caja', () => {
    localStorage.removeItem('cacique_cashier_escazu');
    renderAdmin();
    const logo = screen.getByAltText('El Cacique Logo');
    expect(logo).toHaveAttribute('src', expect.stringContaining('Cacique.svg'));
    expect(logo).toHaveClass('w-14', 'h-14');
    expect(logo).toHaveAttribute('data-variant', 'dark');
    expect(logo.closest('div').parentElement).toHaveTextContent('EL CACIQUE');
    expect(logo.closest('div').parentElement).toHaveTextContent('Chicharronera Gourmet');
    fireEvent.error(logo);
    expect(logo).toHaveAttribute('src', expect.stringContaining('LogoN.svg'));

    open('Gestión de Inventario');
    fireEvent.change(screen.getAllByRole('combobox').at(-1), { target: { value: 'optimo' } });
    expect(screen.getByText('Carne de Cerdo para Chicharrón')).toBeInTheDocument();
    expect(screen.queryByText('Yuca Fresca de Paila')).not.toBeInTheDocument();
    open('Cupones & Promos');
    fireEvent.click(screen.getByRole('button', { name: 'Crear Promoción' }));
    expect(screen.getByText(/Formulario de nueva promoción/i)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Sincronizar Campaña' })[0]);
    expect(screen.getByText(/Promoción CACIQUE10 sincronizada/i)).toBeInTheDocument();
    open('Reseñas & Clientes');
    fireEvent.click(screen.getByRole('button', { name: 'Revisar moderación' }));
    // Escazú (sede por defecto) tiene una reseña sin verificar.
    expect(screen.getByText('1 reseña(s) sin verificar pendientes de moderación')).toBeInTheDocument();
    open('Arqueo de Caja & POS');
    fireEvent.change(screen.getByLabelText('Monto inicial'), { target: { value: '20000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caja' }));
    fireEvent.change(screen.getByLabelText('Dinero contado al cierre'), { target: { value: '20000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar caja y registrar arqueo' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Cierre registrado.*efectivo esperado.*contado.*diferencia/i);
  });
});
