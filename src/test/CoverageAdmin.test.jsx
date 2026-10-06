import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import { encryptData } from '../services/authSecurity';
import { RESERVATIONS_KEY } from '../services/liveSync';

/**
 * Flujos del AdminDashboard por seccion: resumen, proveedores, facturas,
 * correos, inventario, menu, planilla, cajas, clientes y reservas.
 */

const { triggerMock } = vi.hoisted(() => ({ triggerMock: vi.fn() }));
vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: (...args) => triggerMock(...args),
  subscribeToLiveEvents: () => () => {}
}));

function CurrentPath() {
  return <span data-testid="path">{useLocation().pathname}</span>;
}

const renderAdmin = () => render(
  <AccessibilityProvider>
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}><AdminDashboard /><CurrentPath /></MemoryRouter>
    </AuthProvider>
  </AccessibilityProvider>
);
const open = (label) => fireEvent.click(screen.getByRole('button', { name: new RegExp(label, 'i') }));
const selectSede = (value) => fireEvent.change(screen.getByLabelText('Sede del panel'), { target: { value } });

const mockDownloads = () => {
  const createObjectURL = vi.fn(() => 'blob:mock');
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return createObjectURL;
};

beforeEach(() => {
  localStorage.clear();
  triggerMock.mockReset();
  triggerMock.mockResolvedValue({ success: true, mode: 'n8n_online' });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------------ */

describe('Resumen y navegación', () => {
  it.each([
    [9, 'Buenos días'],
    [15, 'Buenas tardes'],
    [21, 'Buenas noches']
  ])('saluda según la hora (%i h)', (hour, greeting) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 5, hour, 0, 0));
    renderAdmin();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(greeting);
  });

  it('tolera un histórico guardado corrupto o con otro formato', () => {
    localStorage.setItem('cacique_admin_history_2026', '{roto');
    const { unmount } = renderAdmin();
    unmount();
    localStorage.setItem('cacique_admin_history_2026', '{"a":1}');
    renderAdmin();
    expect(screen.getByLabelText('Sede del panel')).toBeInTheDocument();
  });

  it('vuelve al sitio público, cambia el periodo y exporta el reporte en Excel', () => {
    const createObjectURL = mockDownloads();
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Día' }));
    expect(screen.getByText('Métricas actualizadas: Día')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Exportar Excel XLSX'));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar notificación' })[0]);

    fireEvent.click(screen.getByRole('button', { name: /Ir a Sitio Web/ }));
    expect(screen.getByTestId('path')).toHaveTextContent(/^\/$/);
  });

  it('las etiquetas de la vista consolidada no dicen "Escazú"', () => {
    renderAdmin();
    selectSede('todas');
    expect(screen.getByRole('img', { name: /en Todas las sedes/ })).toBeInTheDocument();
    open('Personal & Planilla');
    expect(screen.getByText('Personal y planilla — Todas las sedes')).toBeInTheDocument();
  });

  it('sin insumos críticos no muestra alerta y la alerta lleva a inventario cuando existen', () => {
    localStorage.setItem('cacique_admin_inventory', JSON.stringify([
      { id: 1, nombre: 'Carne', stock: 100, minLimit: 10, maxLimit: 200, unidad: 'kg', sede: 'escazu' }
    ]));
    const { unmount } = renderAdmin();
    expect(screen.queryByText(/por debajo de su Límite Mínimo/)).not.toBeInTheDocument();
    unmount();

    localStorage.setItem('cacique_admin_inventory', JSON.stringify([
      { id: 1, nombre: 'Carne', stock: 1, minLimit: 10, maxLimit: 200, unidad: 'kg', sede: 'escazu' }
    ]));
    renderAdmin();
    fireEvent.click(screen.getByRole('button', { name: 'Ver Insumos' }));
    expect(screen.getByPlaceholderText('Buscar insumo por nombre...')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

describe('Proveedores y facturas', () => {
  it('valida y completa el alta de proveedores', () => {
    renderAdmin();
    open('Proveedores');
    fireEvent.click(screen.getByRole('button', { name: /Registrar Proveedor/i }));
    // Los campos son required: se envia el formulario para ejercitar la validacion del handler.
    fireEvent.submit(screen.getByPlaceholderText('Nombre de la empresa').closest('form'));
    expect(screen.getByText('Complete nombre, contacto y correo del proveedor')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nombre de la empresa'), { target: { value: 'Carnes QA' } });
    fireEvent.change(screen.getByPlaceholderText('Contacto principal'), { target: { value: 'Luis' } });
    fireEvent.change(screen.getByPlaceholderText('Teléfono'), { target: { value: '22223333' } });
    fireEvent.change(screen.getByPlaceholderText('Insumos suministrados'), { target: { value: 'Cerdo' } });
    const modal = screen.getByPlaceholderText('Nombre de la empresa').closest('form');
    fireEvent.change(within(modal).getByRole('combobox'), { target: { value: 'cartago' } });
    fireEvent.change(within(modal).getByPlaceholderText(/correo/i), { target: { value: 'ventas@carnesqa.cr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar Proveedor' }));
    expect(screen.queryByText('Complete nombre, contacto y correo del proveedor')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Registrar Proveedor/i }));
    fireEvent.click(within(screen.getByPlaceholderText('Nombre de la empresa').closest('form')).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByPlaceholderText('Nombre de la empresa')).not.toBeInTheDocument();
  });

  it('solicitar insumos a un proveedor prepara el comunicado', () => {
    renderAdmin();
    open('Proveedores');
    fireEvent.click(screen.getAllByRole('button', { name: /Contactar proveedor/i })[0]);
    expect(screen.getByLabelText('Correo del destinatario')).not.toHaveValue('');
  });

  it('valida, adjunta y cancela facturas de proveedores', () => {
    renderAdmin();
    open('Facturas & Finanzas');
    fireEvent.click(screen.getAllByRole('button', { name: 'Proveedores' })[1]);
    fireEvent.click(screen.getByRole('button', { name: /Subir Factura/i }));
    fireEvent.submit(screen.getByPlaceholderText('Monto total').closest('form'));
    expect(screen.getByText('Complete proveedor, monto y código de factura')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Monto total'), { target: { value: '5000' } });
    const form = screen.getByPlaceholderText('Monto total').closest('form');
    const file = new File(['pdf'], 'factura.pdf', { type: 'application/pdf' });
    fireEvent.change(form.querySelector('input[type="file"]'), { target: { files: [file] } });
    expect(within(form).getByText(/factura\.pdf/)).toBeInTheDocument();
    // Cancelar el selector de archivos limpia el adjunto.
    fireEvent.change(form.querySelector('input[type="file"]'), { target: { files: [] } });
    expect(within(form).getByText('Adjuntar PDF/XML (simulado)')).toBeInTheDocument();
    fireEvent.change(form.querySelector('input[type="date"]'), { target: { value: '2026-10-01' } });
    expect(form.querySelector('input[type="date"]')).toHaveValue('2026-10-01');
    fireEvent.click(within(form).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByPlaceholderText('Monto total')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Emitidas a clientes' }));
    expect(screen.queryByRole('button', { name: /Subir Factura/i })).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

describe('Centro de correos', () => {
  const fillMessage = () => {
    fireEvent.change(screen.getByPlaceholderText('Asunto del comunicado'), { target: { value: 'Aviso' } });
    fireEvent.change(screen.getByPlaceholderText('Escriba el mensaje...'), { target: { value: 'Contenido' } });
  };
  const send = () => fireEvent.submit(screen.getByPlaceholderText('Asunto del comunicado').closest('form'));

  it('exige destinatarios al elegir audiencias por selección o correo específico', () => {
    renderAdmin();
    open('Centro de Correos');
    fillMessage();
    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: 'clientes_seleccionados' } });
    send();
    expect(screen.getByText('Complete destinatario, asunto y mensaje para enviar el comunicado')).toBeInTheDocument();
    expect(triggerMock).not.toHaveBeenCalled();
  });

  it('envía a todos los clientes registrados en la audiencia', async () => {
    localStorage.setItem('cacique_admin_email_contacts', encryptData([{ id: 'c1', nombre: 'Ana', correo: 'ana@correo.cr' }]));
    renderAdmin();
    open('Centro de Correos');
    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: 'todos_clientes' } });
    fillMessage();
    send();
    await screen.findByText('Comunicado procesado (n8n conectado)');
    expect(triggerMock).toHaveBeenCalledWith('INVENTARIO_ALERTA', expect.objectContaining({ destinatarios: expect.arrayContaining(['ana@correo.cr']) }));
  });

  it.each([
    ['todos_clientes', undefined],
    ['todos_proveedores', undefined],
    ['personal_meseros', undefined]
  ])('envía a la audiencia %s y muestra la respuesta', async (audience) => {
    renderAdmin();
    open('Centro de Correos');
    fireEvent.change(screen.getByLabelText('Tipo de notificación'), { target: { value: 'RESERVA_MESA' } });
    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: audience } });
    fillMessage();
    send();
    expect(await screen.findByText('Comunicado procesado (n8n conectado)')).toBeInTheDocument();
    expect(triggerMock).toHaveBeenCalledWith('RESERVA_MESA', expect.objectContaining({ destinatarios: expect.any(Array), correoCliente: '' }));
    expect(screen.getByText('Respuesta del envío')).toBeInTheDocument();
  });

  it('envía a un correo específico y a proveedores seleccionados en modo local', async () => {
    triggerMock.mockResolvedValue({ success: true, mode: 'local' });
    renderAdmin();
    open('Centro de Correos');
    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: 'especifico' } });
    fireEvent.change(screen.getByLabelText('Correo del destinatario'), { target: { value: 'ana@correo.cr' } });
    fillMessage();
    send();
    expect(await screen.findByText('Comunicado procesado (modo local)')).toBeInTheDocument();
    expect(triggerMock).toHaveBeenLastCalledWith('INVENTARIO_ALERTA', expect.objectContaining({ destinatarios: ['ana@correo.cr'], correoCliente: 'ana@correo.cr' }));
    expect(screen.getByText(/el modo local de respaldo/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: 'proveedores_seleccionados' } });
    const recipients = screen.getByText('Selecciona uno o varios destinatarios').closest('fieldset');
    fireEvent.click(within(recipients).getAllByRole('checkbox')[0]);
    fireEvent.click(within(recipients).getAllByRole('checkbox')[0]);
    fireEvent.click(within(recipients).getAllByRole('checkbox')[0]);
    fillMessage();
    send();
    await waitFor(() => expect(triggerMock).toHaveBeenCalledTimes(2));
  });

  it.each([
    [{ success: false, message: 'Cuota agotada' }, 'Cuota agotada'],
    [{ success: false, respuesta: 'n8n no publicado' }, 'n8n no publicado'],
    [{ success: false }, 'No se pudo procesar el comunicado']
  ])('informa respuestas fallidas (%o)', async (response, message) => {
    triggerMock.mockResolvedValue(response);
    renderAdmin();
    open('Centro de Correos');
    fillMessage();
    send();
    // El mensaje aparece en el toast y en el recuadro de respuesta: se verifica en el recuadro.
    const responseBox = (await screen.findByText('Error del envío')).parentElement;
    expect(within(responseBox).getByText(message)).toBeInTheDocument();
  });

  it('informa errores inesperados del servicio', async () => {
    triggerMock.mockRejectedValue(new Error('caído'));
    renderAdmin();
    open('Centro de Correos');
    fillMessage();
    send();
    expect(await screen.findByText('Error al procesar la solicitud de correo')).toBeInTheDocument();
  });

  it('muestra un aviso si no hay destinatarios disponibles', () => {
    localStorage.setItem('cacique_admin_email_contacts', encryptData([]));
    renderAdmin();
    open('Centro de Correos');
    fireEvent.change(screen.getByLabelText('Audiencia'), { target: { value: 'clientes_seleccionados' } });
    expect(screen.getByText('No hay destinatarios disponibles.')).toBeInTheDocument();
  });

  it('valida los contactos nuevos y evita duplicados', () => {
    renderAdmin();
    open('Centro de Correos');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }));
    expect(screen.getByText('Ingrese el nombre y un correo válido del cliente')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre del cliente'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Correo del cliente'), { target: { value: 'ana@correo.cr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }));
    fireEvent.change(screen.getByLabelText('Nombre del cliente'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Correo del cliente'), { target: { value: 'ANA@correo.cr' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar contacto' }));
    expect(screen.getByText('Este correo ya está registrado en la audiencia')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------------ */

describe('Inventario', () => {
  it('valida, permite elegir unidad, cancelar y filtrar stock crítico', () => {
    renderAdmin();
    open('Gestión de Inventario');
    fireEvent.click(screen.getByRole('button', { name: /Agregar Insumo/ }));
    fireEvent.submit(screen.getByLabelText('Nombre del insumo').closest('form'));
    expect(screen.getByText('Por favor complete todos los campos requeridos')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Unidad de medida'), { target: { value: 'litros' } });
    expect(screen.getByLabelText('Unidad de medida')).toHaveValue('litros');
    fireEvent.click(within(screen.getByLabelText('Nombre del insumo').closest('form')).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByLabelText('Nombre del insumo')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por estado de stock'), { target: { value: 'critico' } });
    expect(screen.getByLabelText('Filtrar por estado de stock')).toHaveValue('critico');
    fireEvent.change(screen.getByPlaceholderText('Buscar insumo por nombre...'), { target: { value: 'zzz-sin-insumo' } });
    expect(screen.getByText('No se encontraron insumos con los filtros seleccionados.')).toBeInTheDocument();
  });

  it('las compras de caja suman al insumo existente o crean uno nuevo', () => {
    localStorage.setItem('cacique_admin_inventory', JSON.stringify([
      { id: 1, nombre: 'Yuca', stock: 5, minLimit: 1, maxLimit: 50, unidad: 'kg', sede: 'escazu' }
    ]));
    renderAdmin();
    open('Arqueo de Caja & POS');
    const buy = (insumo) => {
      fireEvent.change(screen.getByLabelText('Insumo comprado'), { target: { value: insumo } });
      fireEvent.change(screen.getByLabelText('Cantidad comprada'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Costo de compra'), { target: { value: '100' } });
      fireEvent.click(screen.getByRole('button', { name: 'Registrar compra' }));
    };
    buy('Yuca');
    buy('Achiote');
    const inventory = JSON.parse(localStorage.getItem('cacique_admin_inventory'));
    expect(inventory.find((item) => item.nombre === 'Yuca').stock).toBe(8);
    expect(inventory.find((item) => item.nombre === 'Achiote')).toMatchObject({ stock: 3, unidad: 'unid' });
  });
});

/* ------------------------------------------------------------------------ */

describe('Menú', () => {
  it('exporta el menú en CSV, Excel y JSON', () => {
    const createObjectURL = mockDownloads();
    renderAdmin();
    open('Gestión de Menú');
    const menu = screen.getByText('Gestión dinámica del menú').closest('section, div');
    fireEvent.click(within(menu.parentElement).getAllByRole('button', { name: 'Exportar CSV' })[0]);
    fireEvent.click(within(menu.parentElement).getAllByRole('button', { name: 'Exportar Excel' })[0]);
    fireEvent.click(within(menu.parentElement).getAllByRole('button', { name: 'Exportar JSON' })[0]);
    expect(createObjectURL).toHaveBeenCalledTimes(3);
    expect(screen.getByText('Menú exportado en JSON')).toBeInTheDocument();
  });

  it('importa menús JSON como lista u objeto y omite selecciones vacías', async () => {
    renderAdmin();
    open('Gestión de Menú');
    const input = screen.getByLabelText('Importar archivo de menú');
    fireEvent.change(input, { target: { files: [] } });

    const item = { nombre: 'Olla de Carne', categoria: 'Bocas & Ceviches', precio: 5200, descripcion: '', sedesNoDisponibles: '' };
    fireEvent.change(input, { target: { files: [new File([JSON.stringify([item])], 'menu.json', { type: 'application/json' })] } });
    expect(await screen.findByText('Olla de Carne')).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [new File([JSON.stringify({ menu: [{ ...item, nombre: 'Picadillo de Arracache' }] })], 'menu.json', { type: 'application/json' })] } });
    expect(await screen.findByText('Picadillo de Arracache')).toBeInTheDocument();
  });

  it('valida platillos, categorías vacías, busca, filtra y edita platillos sin descripción', async () => {
    renderAdmin();
    open('Gestión de Menú');
    fireEvent.submit(screen.getByPlaceholderText('Nueva categoría o sección').closest('form'));
    fireEvent.submit(screen.getByPlaceholderText('Nombre del platillo').closest('form'));
    expect(screen.getByText('Ingrese el nombre y un precio válido para el platillo')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nombre del platillo'), { target: { value: 'Tortilla Aliñada' } });
    fireEvent.change(screen.getByPlaceholderText('Precio en colones'), { target: { value: '2500' } });
    fireEvent.submit(screen.getByPlaceholderText('Nombre del platillo').closest('form'));

    fireEvent.change(screen.getByLabelText('Filtrar por categoría'), { target: { value: 'Postres' } });
    fireEvent.change(screen.getByLabelText('Buscar platillos'), { target: { value: 'zzz-sin-resultados' } });
    expect(screen.queryByRole('button', { name: /^Editar / })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por categoría'), { target: { value: 'todas' } });
    fireEvent.change(screen.getByLabelText('Buscar platillos'), { target: { value: 'Tortilla Aliñada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Editar Tortilla Aliñada' }));
    expect(screen.getByPlaceholderText('Descripción breve')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }));
    expect(screen.getByPlaceholderText('Nombre del platillo')).toHaveValue('');
  });
});

/* ------------------------------------------------------------------------ */

describe('Planilla, cajas, clientes y reservas', () => {
  it('valida empleados, usa los selectores y asigna la sede en la vista consolidada', () => {
    localStorage.setItem('cacique_admin_payroll', encryptData([
      { id: 'e1', nombre: 'Guardado QA', puesto: 'Cocinero', salario: 400000, frecuenciaPago: 'Mensual', diaPago: '30', banco: 'BAC Credomatic', iban: '' }
    ]));
    renderAdmin();
    selectSede('todas');
    open('Personal & Planilla');
    expect(screen.getByText('Guardado QA')).toBeInTheDocument();

    // La validacion del handler respalda a la nativa (required/pattern): se envia el formulario.
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Nuevo QA' } });
    fireEvent.change(screen.getByLabelText('Salario mensual'), { target: { value: '450000' } });
    fireEvent.change(screen.getByLabelText('Cuenta IBAN'), { target: { value: 'CR123' } });
    fireEvent.submit(screen.getByLabelText('Nombre completo').closest('form'));
    expect(screen.getByText('Ingrese el nombre y un salario mensual válido')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cuenta IBAN'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Puesto / rol'), { target: { value: screen.getByLabelText('Puesto / rol').options[1].value } });
    fireEvent.change(screen.getByLabelText('Banco destino'), { target: { value: screen.getByLabelText('Banco destino').options[1].value } });
    fireEvent.change(screen.getByLabelText('Sede asignada'), { target: { value: 'heredia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar empleado' }));
    expect(screen.getByText('Nuevo QA')).toBeInTheDocument();
  });

  it('informa si no puede eliminar una caja y muestra sedes sin cajas creadas', () => {
    renderAdmin();
    open('Configuración de Cajas');
    fireEvent.change(screen.getByLabelText('Nombre de la caja'), { target: { value: 'Caja QA' } });
    fireEvent.change(screen.getByLabelText('Correo de acceso de la caja'), { target: { value: 'caja.qa@elcacique.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña de la caja'), { target: { value: 'segura123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear caja' }));

    const originalSet = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function setItem(key, value) {
      if (key === 'cacique_admin_registers') throw new Error('QuotaExceededError');
      return originalSet.call(this, key, value);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar caja Caja QA' }));
    expect(screen.getByText('No se pudo eliminar la caja.')).toBeInTheDocument();
  });

  it('suma reservas de clientes guardados sin contador previo', () => {
    localStorage.setItem('cacique_admin_clients', encryptData([
      { id: 'c1', nombre: 'Cliente Legado', correo: 'legado@correo.cr', telefono: '8888', sede: 'escazu', estado: 'Activo' }
    ]));
    renderAdmin();
    open('Gestión de Clientes');
    fireEvent.click(screen.getByRole('button', { name: 'Registrar reserva de Cliente Legado' }));
    expect(screen.getByText('Cliente Legado').closest('tr')).toHaveTextContent('1');
  });

  it('edita reservas sin afectar a las demás y confirma solo la elegida', () => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([
      { id: 'r1', cliente: 'Ana', personas: 2, fecha: '2026-10-05', hora: '12:00', sede: 'escazu', mesa: '1', estado: 'Reservada' },
      { id: 'r2', cliente: 'Luis', personas: 4, fecha: '2026-10-05', hora: '13:00', sede: 'escazu', mesa: '2', estado: 'Reservada' }
    ]));
    renderAdmin();
    open('Mesas & Reservaciones');
    fireEvent.click(screen.getByRole('button', { name: 'Editar reserva de Ana' }));
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nombre del Cliente'), { target: { value: 'Ana María' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/ }));
    fireEvent.click(within(screen.getByText('Luis').closest('article')).getByRole('button', { name: 'Confirmar' }));

    const saved = JSON.parse(localStorage.getItem(RESERVATIONS_KEY));
    expect(saved.find((item) => item.id === 'r1')).toMatchObject({ cliente: 'Ana María', estado: 'Reservada' });
    expect(saved.find((item) => item.id === 'r2').estado).toBe('Confirmada');
  });

  it('edita un empleado heredado sin sede y cancela la edición', () => {
    localStorage.setItem('cacique_admin_payroll', encryptData([
      { id: 'e1', nombre: 'Heredado QA', puesto: 'Cocinero', salario: 400000, frecuenciaPago: 'Mensual', diaPago: '30', banco: 'BAC Credomatic', iban: '' }
    ]));
    renderAdmin();
    open('Personal & Planilla');
    fireEvent.click(screen.getByRole('button', { name: 'Editar Heredado QA' }));
    expect(screen.getByLabelText('Sede asignada')).toHaveValue('escazu');
    fireEvent.click(within(screen.getByLabelText('Nombre completo').closest('form')).getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('');
  });

  it('cancela la edición de reservas y muestra reservas web sin teléfono ni estado', () => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([
      { id: 'r1', cliente: 'Web Sin Datos', personas: 2, fecha: '2026-10-05', hora: '12:00', sede: 'escazu', mesa: '', origen: 'web' }
    ]));
    renderAdmin();
    open('Mesas & Reservaciones');
    const row = screen.getByText('Web Sin Datos').closest('article');
    expect(row).toHaveTextContent('Reservada');
    expect(within(row).getByText(/Reserva web/)).not.toHaveAttribute('title');
    fireEvent.click(within(row).getByRole('button', { name: 'Editar reserva de Web Sin Datos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }));
    expect(screen.getByRole('button', { name: 'Crear reserva' })).toBeInTheDocument();
  });

  it('al cancelar una edición en la vista consolidada el formulario vuelve a Escazú', () => {
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify([
      { id: 'r9', cliente: 'Heredia QA', personas: 2, fecha: '2026-10-05', hora: '12:00', sede: 'heredia', mesa: '3', estado: 'Reservada' }
    ]));
    renderAdmin();
    selectSede('todas');
    open('Mesas & Reservaciones');
    fireEvent.click(screen.getByRole('button', { name: 'Editar reserva de Heredia QA' }));
    expect(screen.getByRole('button', { name: 'Guardar cambios de reserva' })).toBeInTheDocument();
    expect(screen.getByLabelText('Sede de reserva')).toHaveValue('heredia');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }));
    expect(screen.getByLabelText('Sede de reserva')).toHaveValue('escazu');
  });

  it('el arqueo consolidado usa la caja de Escazú y las reseñas muestran el promedio general', () => {
    renderAdmin();
    selectSede('todas');
    open('Arqueo de Caja & POS');
    expect(screen.getByLabelText('Monto inicial')).toBeInTheDocument();
    open('Reseñas & Clientes');
    expect(screen.getByText('Promedio general')).toBeInTheDocument();
    act(() => {});
  });
});
