import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { useAutoLogout } from '../hooks/useAutoLogout';
import { useAccessibility } from '../context/AccessibilityContext';
import FacturacionPanel from '../components/FacturacionPanel';
import caciqueIcon from '../assets/img/Cacique.svg';
import officialLogo from '../assets/img/LogoN.svg';
import { decryptData, encryptData, formatSedeName } from '../services/authSecurity';
import { triggerN8nAutomation } from '../services/n8nService';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { 
  ShieldCheck, DollarSign, ShoppingBag, Users, Clock, 
  TrendingUp, AlertTriangle, Plus, Trash2, Pencil, CheckCircle2,
  BarChart3, Package, CreditCard, Calendar, MapPin, LogOut, ExternalLink,
  Search, Sliders, AlertCircle, Star, Ticket, MessageSquare,
  Award, ArrowUpRight, Download, Upload, Mail, FileText, Truck, Send, Paperclip
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { increaseFontSize, decreaseFontSize } = useAccessibility();
  const navigate = useNavigate();
  const navigateToLogin = useCallback(() => navigate('/login'), [navigate]);
  const { showWarning: showInactivityWarning, resetTimer: resetInactivityTimer } = useAutoLogout(null, {
    timeoutMs: 10 * 60 * 1000,
    warningMs: 9 * 60 * 1000,
    onTimeout: navigateToLogin
  });

  const [activeSection, setActiveSection] = useState('resumen');
  const [selectedSede, setSelectedSede] = useState('escazu');
  const [timePeriod, setTimePeriod] = useState('dia');
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState('');
  const [historicalData, setHistoricalData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cacique_admin_history_2026') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [emailResponse, setEmailResponse] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [menuCategories, setMenuCategories] = useState(['Chicharrones & Paila', 'Cortes a la Leña', 'Bocas & Ceviches', 'Bebidas', 'Postres']);
  const [menuItems, setMenuItems] = useState([
    { id: 1, nombre: 'Chifrijo Especial Cacique', categoria: 'Chicharrones & Paila', precio: 6800, descripcion: 'Chicharrón crujiente, frijoles tiernos y pico de gallo.' },
    { id: 2, nombre: 'Vigorón Criollo (1kg)', categoria: 'Chicharrones & Paila', precio: 14500, descripcion: 'Chicharrón con yuca al vapor y ensalada de repollo.' },
    { id: 3, nombre: 'Costilla a la Leña Ahumada', categoria: 'Cortes a la Leña', precio: 9200, descripcion: 'Costilla de cerdo bañada en salsa BBQ artesanal.' }
  ]);
  const [newCategory, setNewCategory] = useState('');
  const sedesDisponibles = ['Sede Escazú', 'Sede Santa Ana', 'Sede Cartago', 'Sede Heredia'];
  const branchKeys = ['escazu', 'santa_ana', 'cartago', 'heredia'];
  const branchLabels = { escazu: 'Escazú', santa_ana: 'Santa Ana', cartago: 'Cartago', heredia: 'Heredia' };
  const [newMenuItem, setNewMenuItem] = useState({ nombre: '', categoria: 'Chicharrones & Paila', precio: '', descripcion: '', sedesNoDisponibles: [] });
  const [editingMenuItemId, setEditingMenuItemId] = useState(null);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const previousMonthDate = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}-15`;
  const [customerInvoices] = useState([
    { id: 'FE-001-982143', cliente: 'Corporación El Sol S.A.', cedula: '3101123456', fecha: today, monto: 32500, tipo: 'Factura Electrónica' },
    { id: 'FE-001-982144', cliente: 'Angel Daniela Salazar T.', cedula: '118230491', fecha: today, monto: 18500, tipo: 'Factura Electrónica' },
    { id: 'FE-001-881201', cliente: 'Bryan Gómez', cedula: '117450892', fecha: previousMonthDate, monto: 45000, tipo: 'Factura Electrónica' }
  ]);
  const [invoicePeriod, setInvoicePeriod] = useState('dia');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceKind, setInvoiceKind] = useState('clientes');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // FILTROS Y BÚSQUEDA DE INVENTARIO
  const [searchInsumo, setSearchInsumo] = useState('');
  const [filterState, setFilterState] = useState('todos');

  // ESTADO DE MODAL Y FORMULARIO CON UMBRALES MÍNIMOS Y MÁXIMOS
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [itemForm, setItemForm] = useState({
    nombre: '',
    stock: '',
    minLimit: '',
    maxLimit: '',
    unidad: 'kg',
    sede: 'escazu'
  });

  const [supplierForm, setSupplierForm] = useState({ nombre: '', contacto: '', telefono: '', email: '', insumos: '', sede: 'escazu' });
  const [invoiceForm, setInvoiceForm] = useState({ proveedor: '', monto: '', codigo: '', fecha: '', categoria: 'Insumos', archivoNombre: '' });
  const [emailData, setEmailData] = useState({ tipo: 'INVENTARIO_ALERTA', destinatarioTipo: 'todos_clientes', especifico: '', asunto: '', mensaje: '' });
  const [emailSelectedRecipients, setEmailSelectedRecipients] = useState([]);
  const [emailContact, setEmailContact] = useState({ nombre: '', correo: '' });
  const [emailContacts, setEmailContacts] = useState(() => {
    const storedContacts = decryptData(localStorage.getItem('cacique_admin_email_contacts'));
    const savedContacts = Array.isArray(storedContacts) ? storedContacts : [];
    const registeredClients = decryptData(localStorage.getItem('cacique_registered_clients')) || {};
    const authContacts = Object.entries(registeredClients).map(([correo, client]) => ({ id: correo, nombre: client.nombre, correo }));
    const combined = [...authContacts, ...savedContacts];
    return combined.filter((contact, index) => combined.findIndex(candidate => candidate.correo === contact.correo) === index);
  });
  const [employeeForm, setEmployeeForm] = useState({ nombre: '', puesto: 'Mesero de Salón & Terraza', salario: '', frecuenciaPago: 'Quincenal', diaPago: '15 y 30', banco: 'BAC Credomatic', iban: '', sede: 'escazu' });
  const [reservations, setReservations] = useState(() => { try { return JSON.parse(localStorage.getItem('cacique_admin_reservations') || '[]'); } catch { return []; } });
  const [reservationForm, setReservationForm] = useState({ cliente: '', personas: 2, fecha: '', hora: '', sede: 'escazu', mesa: '1' });
  const [employees, setEmployees] = useState(() => {
    const savedEmployees = decryptData(localStorage.getItem('cacique_admin_payroll'));
    if (Array.isArray(savedEmployees)) return savedEmployees;
    return [
      { id: 'emp-admin', nombre: 'Angel Daniela Salazar T.', puesto: 'Administradora General', salario: 850000, frecuenciaPago: 'Quincenal', diaPago: '15 y 30', banco: 'BAC Credomatic', iban: 'CR05010200009876543210' },
      { id: 'emp-carlos', nombre: 'Carlos Ramírez', puesto: 'Mesero de Salón & Terraza', salario: 420000, frecuenciaPago: 'Quincenal', diaPago: '15 y 30', banco: 'Banco Nacional (BNCR)', iban: 'CR11015200001234567890' }
    ];
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // BASE DE DATOS LOCAL DE INVENTARIOS CON LÍMITES
  const [inventory, setInventory] = useState([
    { id: 1, nombre: 'Carne de Cerdo para Chicharrón', stock: 120, minLimit: 30, maxLimit: 200, unidad: 'kg', sede: 'escazu' },
    { id: 2, nombre: 'Yuca Fresca de Paila', stock: 18, minLimit: 25, maxLimit: 100, unidad: 'kg', sede: 'escazu' },
    { id: 3, nombre: 'Frijoles Cubaces Tiernos', stock: 85, minLimit: 20, maxLimit: 150, unidad: 'kg', sede: 'escazu' },
    { id: 4, nombre: 'Plátano Verde para Patacones', stock: 15, minLimit: 40, maxLimit: 200, unidad: 'unid', sede: 'santa_ana' },
    { id: 5, nombre: 'Costilla de Cerdo Ahumada', stock: 12, minLimit: 20, maxLimit: 80, unidad: 'kg', sede: 'heredia' },
    { id: 6, nombre: 'Cas Criollo para Naturales', stock: 45, minLimit: 10, maxLimit: 60, unidad: 'kg', sede: 'cartago' }
  ]);

  const [suppliers, setSuppliers] = useState([
    { id: 1, nombre: 'Distribuidora Carnes San Martín', contacto: 'Mario San Martín', telefono: '+506 8888-1122', email: 'ventas@sanmartin.cr', insumos: 'Carne de Cerdo, Costilla, Chicharrón', sede: 'escazu', estado: 'Activo' },
    { id: 2, nombre: 'Vegetales y Verduras de Zarcero', contacto: 'Ana María Mora', telefono: '+506 8765-4321', email: 'pedidos@zarcero.cr', insumos: 'Yuca, Plátano Verde, Tomate, Limón', sede: 'santa_ana', estado: 'Activo' },
    { id: 3, nombre: 'Lácteos & Quesos Coronado', contacto: 'Jorge Hernández', telefono: '+506 8333-4455', email: 'contacto@coronadocruz.cr', insumos: 'Queso Turrialba, Natilla Criolla', sede: 'cartago', estado: 'Activo' }
  ]);

  const [invoices, setInvoices] = useState([
    { id: 'FAC-2026-089', proveedor: 'Distribuidora Carnes San Martín', monto: 350000, fecha: '2026-09-18', estado: 'Pagada', categoria: 'Insumos Culinarios', archivoNombre: 'Factura_Carnes_089.pdf' },
    { id: 'FAC-2026-090', proveedor: 'Vegetales y Verduras de Zarcero', monto: 125000, fecha: '2026-09-17', estado: 'Pendiente', categoria: 'Verduras', archivoNombre: 'Factura_Zarcero_090.xml' }
  ]);

  const topSellingFoods = [
    { rank: '#1', nombre: 'Chifrijo Especial de Paila', ventas: 342, monto: '₡2,325,600', rating: 4.9 },
    { rank: '#2', nombre: 'Costilla Cerdo a la Leña', ventas: 215, monto: '₡1,978,000', rating: 4.8 },
    { rank: '#3', nombre: 'Vigorón Criollo Cacique (1kg)', ventas: 184, monto: '₡2,668,000', rating: 5.0 },
    { rank: '#4', nombre: 'Ceviche de Tilapia Arreglado', ventas: 142, monto: '₡781,000', rating: 4.7 }
  ];

  const liveActivities = [
    { id: 1, texto: 'Nueva comanda #ORD-105 recibida', hora: 'Hace 2 min', tipo: 'pedido' },
    { id: 2, texto: 'Calificación 5 estrellas asignada por un cliente', hora: 'Hace 8 min', tipo: 'review' },
    { id: 3, texto: 'Reabastecimiento de Yuca aprobado', hora: 'Hace 15 min', tipo: 'stock' }
  ];

  const coupons = [
    { id: 1, codigo: 'CACIQUE10', descripcion: '10% de descuento en pedidos familiares', usos: 84, estado: 'Activo' },
    { id: 2, codigo: 'PAILA2026', descripcion: 'Bebida gratis en consumo mayor a ₡15,000', usos: 42, estado: 'Activo' },
    { id: 3, codigo: 'LUNESCRIOLLO', descripcion: '15% de descuento los lunes', usos: 0, estado: 'Programado' }
  ];

  const reviews = [
    { id: 1, cliente: 'María González', sede: 'Escazú', rating: 5, comentario: 'El chifrijo estuvo increíble y el servicio fue muy rápido.' },
    { id: 2, cliente: 'Diego Vargas', sede: 'Santa Ana', rating: 4, comentario: 'Muy buen sabor. La terraza es excelente para compartir.' },
    { id: 3, cliente: 'Sofía Ramírez', sede: 'Cartago', rating: 5, comentario: 'La atención del equipo y la calidad de la paila fueron excelentes.' }
  ];

  const metricsByPeriod = {
    dia: {
      escazu: { ventas: 785400, comandas: 189, clientes: 420, coccion: '15 min', completados: 165, pendientes: 18, cancelados: 6 },
      santa_ana: { ventas: 540200, comandas: 132, clientes: 310, coccion: '17 min', completados: 115, pendientes: 12, cancelados: 5 },
      cartago: { ventas: 610900, comandas: 145, clientes: 350, coccion: '16 min', completados: 130, pendientes: 11, cancelados: 4 },
      heredia: { ventas: 485250, comandas: 118, clientes: 280, coccion: '18 min', completados: 102, pendientes: 12, cancelados: 4 }
    },
    semana: {
      escazu: { ventas: 5497800, comandas: 1320, clientes: 2940, coccion: '14 min', completados: 1210, pendientes: 80, cancelados: 30 },
      santa_ana: { ventas: 3781400, comandas: 924, clientes: 2170, coccion: '16 min', completados: 850, pendientes: 50, cancelados: 24 },
      cartago: { ventas: 4276300, comandas: 1015, clientes: 2450, coccion: '15 min', completados: 940, pendientes: 55, cancelados: 20 },
      heredia: { ventas: 3396750, comandas: 826, clientes: 1960, coccion: '17 min', completados: 760, pendientes: 46, cancelados: 20 }
    },
    mes: {
      escazu: { ventas: 23562000, comandas: 5670, clientes: 12600, coccion: '15 min', completados: 5190, pendientes: 340, cancelados: 140 },
      santa_ana: { ventas: 16206000, comandas: 3960, clientes: 9300, coccion: '16 min', completados: 3640, pendientes: 220, cancelados: 100 },
      cartago: { ventas: 18327000, comandas: 4350, clientes: 10500, coccion: '15 min', completados: 4030, pendientes: 230, cancelados: 90 },
      heredia: { ventas: 14557500, comandas: 3540, clientes: 8400, coccion: '17 min', completados: 3260, pendientes: 200, cancelados: 80 }
    }
  };

  const branchDetails = {
    escazu: { personal: 12, mesasLibres: 8, mesasTotal: 24 },
    santa_ana: { personal: 8, mesasLibres: 4, mesasTotal: 18 },
    cartago: { personal: 10, mesasLibres: 6, mesasTotal: 20 },
    heredia: { personal: 9, mesasLibres: 3, mesasTotal: 16 }
  };
  const historicalMonthOptions = [
    ['2026-01', 'Enero 2026'], ['2026-02', 'Febrero 2026'], ['2026-03', 'Marzo 2026'],
    ['2026-04', 'Abril 2026'], ['2026-05', 'Mayo 2026'], ['2026-06', 'Junio 2026'],
    ['2026-07', 'Julio 2026'], ['2026-08', 'Agosto 2026'], ['2026-09', 'Septiembre 2026']
  ];
  const loadHistoricalData = () => {
    const growthFactors = [0.72, 0.76, 0.81, 0.84, 0.88, 0.93, 0.96, 0.98, 1];
    const generatedHistory = historicalMonthOptions.flatMap(([month], monthIndex) => branchKeys.map((sede, branchIndex) => {
      const factor = growthFactors[monthIndex] * (1 + branchIndex * 0.015);
      const base = metricsByPeriod.mes[sede];
      return {
        month,
        sede,
        ventas: Math.round(base.ventas * factor),
        comandas: Math.round(base.comandas * factor),
        clientes: Math.round(base.clientes * factor),
        insumosConsumidos: Math.round((base.comandas * 0.42 + base.clientes * 0.06) * factor)
      };
    }));
    setHistoricalData(generatedHistory);
    localStorage.setItem('cacique_admin_history_2026', JSON.stringify(generatedHistory));
    setSelectedHistoryMonth('2026-09');
    showToast('Histórico de enero a septiembre de 2026 cargado', 'success');
  };
  const selectedHistoricalRows = selectedHistoryMonth
    ? historicalData.filter(row => row.month === selectedHistoryMonth && (selectedSede === 'todas' || row.sede === selectedSede))
    : [];
  const historyScale = timePeriod === 'dia' ? 30 : timePeriod === 'semana' ? 4 : 1;
  const baseMetrics = selectedSede === 'todas'
    ? { ...branchKeys.reduce((sum, key) => { const metric = metricsByPeriod[timePeriod][key]; return { ventas: sum.ventas + metric.ventas, comandas: sum.comandas + metric.comandas, clientes: sum.clientes + metric.clientes, completados: sum.completados + metric.completados, pendientes: sum.pendientes + metric.pendientes, cancelados: sum.cancelados + metric.cancelados }; }, { ventas: 0, comandas: 0, clientes: 0, completados: 0, pendientes: 0, cancelados: 0 }), coccion: '16 min', mesasTotal: branchKeys.reduce((n, key) => n + branchDetails[key].mesasTotal, 0), mesasLibres: branchKeys.reduce((n, key) => n + branchDetails[key].mesasLibres, 0) }
    : { ...metricsByPeriod[timePeriod][selectedSede], ...branchDetails[selectedSede] };
  const currentMetrics = selectedHistoricalRows.length
    ? { ...baseMetrics,
      ventas: Math.round(selectedHistoricalRows.reduce((total, row) => total + row.ventas, 0) / historyScale),
      comandas: Math.round(selectedHistoricalRows.reduce((total, row) => total + row.comandas, 0) / historyScale),
      clientes: Math.round(selectedHistoricalRows.reduce((total, row) => total + row.clientes, 0) / historyScale)
    }
    : baseMetrics;
  const historicalSuppliesConsumed = selectedHistoricalRows.reduce((total, row) => total + row.insumosConsumidos, 0);
  const salesByBranch = branchKeys.map(key => ({ sede: branchLabels[key], ventas: metricsByPeriod[timePeriod][key].ventas, clientes: metricsByPeriod[timePeriod][key].clientes }));
  const averageTicket = currentMetrics.comandas ? Math.round(currentMetrics.ventas / currentMetrics.comandas) : 0;
  const salesTrendByPeriod = {
    dia: [58, 66, 52, 78, 70, 92],
    semana: [64, 72, 68, 86, 80, 100],
    mes: [48, 62, 74, 68, 88, 100]
  };
  const currentSalesTrend = salesTrendByPeriod[timePeriod];
  const monthlySalesData = historicalData.length
    ? historicalMonthOptions.map(([month, label]) => ({
      mes: label.slice(0, 3),
      ventas: historicalData.filter(row => row.month === month && (selectedSede === 'todas' || row.sede === selectedSede)).reduce((total, row) => total + row.ventas, 0)
    }))
    : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((mes, index) => ({
      mes,
      ventas: Math.round(currentMetrics.ventas * currentSalesTrend[index] / 100)
    }));

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const exportReport = (format) => {
    const report = {
      restaurante: 'Chicharronera El Cacique',
      sede: formatSedeName(selectedSede),
      periodo: timePeriod,
      fechaGeneracion: new Date().toISOString(),
      metricas: currentMetrics,
      inventarioCritico: inventory.filter(item => (selectedSede === 'todas' || item.sede === selectedSede) && item.stock <= item.minLimit)
    };
    const csv = `Métrica,Valor\nVentas,${currentMetrics.ventas}\nComandas,${currentMetrics.comandas}\nClientes,${currentMetrics.clientes}\nTiempo cocción,${currentMetrics.coccion}`;
    const blob = new Blob([format === 'csv' ? csv : JSON.stringify(report, null, 2)], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_ElCacique_${selectedSede}_${timePeriod}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Reporte ${format.toUpperCase()} descargado correctamente`, 'success');
  };

  const handleSaveSupplier = (event) => {
    event.preventDefault();
    if (!supplierForm.nombre || !supplierForm.contacto || !supplierForm.email) {
      showToast('Complete nombre, contacto y correo del proveedor', 'error');
      return;
    }
    setSuppliers(previous => [...previous, { ...supplierForm, id: Date.now(), estado: 'Activo' }]);
    setSupplierForm({ nombre: '', contacto: '', telefono: '', email: '', insumos: '', sede: selectedSede });
    setIsSupplierModalOpen(false);
    showToast('Proveedor registrado correctamente', 'success');
  };

  const handleSaveInvoice = (event) => {
    event.preventDefault();
    if (!invoiceForm.proveedor || !invoiceForm.monto || !invoiceForm.codigo) {
      showToast('Complete proveedor, monto y código de factura', 'error');
      return;
    }
    setInvoices(previous => [{ ...invoiceForm, id: invoiceForm.codigo, monto: Number(invoiceForm.monto), fecha: invoiceForm.fecha || new Date().toISOString().slice(0, 10), estado: 'Pendiente', archivoNombre: invoiceForm.archivoNombre || `Factura_${invoiceForm.codigo}.pdf` }, ...previous]);
    setInvoiceForm({ proveedor: '', monto: '', codigo: '', fecha: '', categoria: 'Insumos', archivoNombre: '' });
    setIsInvoiceModalOpen(false);
    showToast('Factura registrada correctamente', 'success');
  };

  const handleDownloadInvoice = (invoice) => {
    const content = `CHICHARRONERA EL CACIQUE\nFactura: ${invoice.id}\nProveedor: ${invoice.proveedor}\nMonto: ₡${invoice.monto.toLocaleString()}\nFecha: ${invoice.fecha}\nEstado: ${invoice.estado}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = invoice.archivoNombre;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Comprobante ${invoice.archivoNombre} descargado`, 'info');
  };

  const handleSendEmail = async (event) => {
    event.preventDefault();
    const requiresSelection = ['clientes_seleccionados', 'proveedores_seleccionados'].includes(emailData.destinatarioTipo);
    if (!emailData.asunto || !emailData.mensaje || (emailData.destinatarioTipo === 'especifico' && !emailData.especifico) || (requiresSelection && emailSelectedRecipients.length === 0)) {
      showToast('Complete destinatario, asunto y mensaje para enviar el comunicado', 'error');
      return;
    }
    showToast('Enviando comunicado mediante n8n...', 'info');
    setEmailLoading(true);
    try {
      const response = await triggerN8nAutomation(emailData.tipo, {
        ...emailData,
        destinatarios: emailData.destinatarioTipo === 'especifico'
          ? [emailData.especifico]
          : requiresSelection
            ? emailSelectedRecipients
            : emailData.destinatarioTipo === 'todos_proveedores'
              ? suppliers.map(supplier => supplier.email)
              : emailData.destinatarioTipo === 'personal_meseros'
                ? employees.map(employee => employee.nombre)
                : emailContacts.map(contact => contact.correo),
        correoCliente: emailData.destinatarioTipo === 'especifico' ? emailData.especifico : '',
        producto: 'Comunicado Admin',
        sede: formatSedeName(selectedSede) || 'Central',
        remitente: 'admin@elcacique.com'
      });
      setEmailResponse(response);

      if (!response.success) {
        showToast(response.message || response.respuesta || 'No se pudo procesar el comunicado', 'error');
        return;
      }

      setEmailData({ tipo: 'INVENTARIO_ALERTA', destinatarioTipo: 'todos_clientes', especifico: '', asunto: '', mensaje: '' });
      setEmailSelectedRecipients([]);
      showToast(`Comunicado procesado (${response.mode === 'n8n_online' ? 'n8n conectado' : 'modo local'})`, 'success');
    } catch {
      setEmailResponse({ success: false, message: 'Error al procesar la solicitud de correo.' });
      showToast('Error al procesar la solicitud de correo', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setTimePeriod(period);
    showToast(`Métricas actualizadas: ${period === 'dia' ? 'Día' : period === 'semana' ? 'Semana' : 'Mes'}`, 'info');
  };

  // MANEJO DE MODAL DE INVENTARIO
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setItemForm({
      nombre: '',
      stock: '',
      minLimit: '',
      maxLimit: '',
      unidad: 'kg',
      sede: selectedSede
    });
    setIsInventoryModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setItemForm({
      nombre: item.nombre,
      stock: item.stock.toString(),
      minLimit: item.minLimit.toString(),
      maxLimit: item.maxLimit.toString(),
      unidad: item.unidad,
      sede: item.sede
    });
    setIsInventoryModalOpen(true);
  };

  const handleSaveInventoryItem = (e) => {
    e.preventDefault();
    if (!itemForm.nombre || !itemForm.stock || !itemForm.minLimit || !itemForm.maxLimit) {
      showToast('Por favor complete todos los campos requeridos', 'error');
      return;
    }

    const stockNum = parseInt(itemForm.stock, 10);
    const minNum = parseInt(itemForm.minLimit, 10);
    const maxNum = parseInt(itemForm.maxLimit, 10);

    if (editingItem) {
      setInventory(prev => prev.map(item => item.id === editingItem.id ? {
        ...item,
        nombre: itemForm.nombre,
        stock: stockNum,
        minLimit: minNum,
        maxLimit: maxNum,
        unidad: itemForm.unidad,
        sede: itemForm.sede
      } : item));
      showToast(`Insumo "${itemForm.nombre}" actualizado correctamente`, 'success');
    } else {
      const newItem = {
        id: Date.now(),
        nombre: itemForm.nombre,
        stock: stockNum,
        minLimit: minNum,
        maxLimit: maxNum,
        unidad: itemForm.unidad,
        sede: itemForm.sede
      };
      setInventory(prev => [...prev, newItem]);
      showToast(`Insumo "${itemForm.nombre}" registrado en inventario`, 'success');
    }

    setIsInventoryModalOpen(false);
  };

  const handleDeleteItem = (id, nombre) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast(`Insumo "${nombre}" eliminado del registro`, 'info');
  };

  const handleRegisterPurchase = ({ insumo, cantidad, sede }) => {
    setInventory(previous => {
      const existing = previous.find(item => item.sede === sede && item.nombre.toLocaleLowerCase() === insumo.toLocaleLowerCase());
      if (existing) return previous.map(item => item.id === existing.id ? { ...item, stock: Number(item.stock) + Number(cantidad) } : item);
      return [...previous, { id: Date.now(), nombre: insumo, stock: Number(cantidad), minLimit: 0, maxLimit: Number(cantidad), unidad: 'unid', sede }];
    });
    showToast(`${insumo}: inventario actualizado en ${formatSedeName(sede)}`, 'success');
  };

  // FILTRADO DE INVENTARIO
  const branchInventory = inventory.filter(i => selectedSede === 'todas' || i.sede === selectedSede);
  const filteredInventory = branchInventory.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchInsumo.toLowerCase());
    const isCritical = item.stock <= item.minLimit;
    const isOptimal = item.stock > item.minLimit;

    if (filterState === 'critico') return matchesSearch && isCritical;
    if (filterState === 'optimo') return matchesSearch && isOptimal;
    return matchesSearch;
  });

  const criticalItemsCount = branchInventory.filter(i => i.stock <= i.minLimit).length;
  const filteredCustomerInvoices = customerInvoices.filter(invoice => {
    const query = invoiceSearch.trim().toLocaleLowerCase();
    const matchesSearch = `${invoice.cliente} ${invoice.id} ${invoice.cedula}`.toLocaleLowerCase().includes(query);
    const matchesPeriod = invoicePeriod === 'dia' ? invoice.fecha === today : invoicePeriod === 'mes' ? invoice.fecha.startsWith(today.slice(0, 7)) : true;
    return matchesSearch && matchesPeriod;
  });
  const addMenuCategory = event => {
    event.preventDefault();
    const category = newCategory.trim();
    if (!category) return;
    if (menuCategories.some(existing => existing.toLocaleLowerCase() === category.toLocaleLowerCase())) {
      showToast('Esta categoría ya existe', 'error');
      return;
    }
    setMenuCategories(previous => [...previous, category]);
    setNewCategory('');
    showToast('Categoría agregada al menú', 'success');
  };

  const handleSaveEmailContact = (event) => {
    event.preventDefault();
    const nombre = emailContact.nombre.trim();
    const correo = emailContact.correo.trim().toLocaleLowerCase();
    if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      showToast('Ingrese el nombre y un correo válido del cliente', 'error');
      return;
    }
    if (emailContacts.some(contact => contact.correo.toLocaleLowerCase() === correo)) {
      showToast('Este correo ya está registrado en la audiencia', 'error');
      return;
    }
    const contact = { id: correo, nombre, correo };
    const updatedContacts = [...emailContacts, contact];
    setEmailContacts(updatedContacts);
    localStorage.setItem('cacique_admin_email_contacts', encryptData(updatedContacts));
    setEmailContact({ nombre: '', correo: '' });
    showToast('Cliente agregado a la lista de comunicaciones', 'success');
  };

  const handleSaveEmployee = (event) => {
    event.preventDefault();
    const nombre = employeeForm.nombre.trim();
    const salario = Number(employeeForm.salario);
    if (!nombre || !Number.isFinite(salario) || salario <= 0 || (employeeForm.iban && !/^CR\d{20}$/i.test(employeeForm.iban.replace(/\s/g, '')))) {
      showToast('Ingrese el nombre y un salario mensual válido', 'error');
      return;
    }
    const employee = { ...employeeForm, nombre, salario };
    const updatedEmployees = editingEmployeeId
      ? employees.map(current => current.id === editingEmployeeId ? { ...employee, id: editingEmployeeId } : current)
      : [...employees, { ...employee, id: Date.now() }];
    setEmployees(updatedEmployees);
    if (editingEmployeeId) {
      showToast('Datos del colaborador actualizados', 'success');
    } else {
      showToast('Colaborador agregado a la planilla', 'success');
    }
    localStorage.setItem('cacique_admin_payroll', encryptData(updatedEmployees));
    setEmployeeForm({ nombre: '', puesto: 'Mesero de Salón & Terraza', salario: '', frecuenciaPago: 'Quincenal', diaPago: '15 y 30', banco: 'BAC Credomatic', iban: '', sede: selectedSede === 'todas' ? 'escazu' : selectedSede });
    setEditingEmployeeId(null);
  };
  const addMenuItem = event => {
    event.preventDefault();
    const price = Number(newMenuItem.precio);
    if (!newMenuItem.nombre.trim() || !Number.isFinite(price) || price <= 0) {
      showToast('Ingrese el nombre y un precio válido para el platillo', 'error');
      return;
    }
    const savedItem = { ...newMenuItem, nombre: newMenuItem.nombre.trim(), precio: price, id: editingMenuItemId || Date.now() };
    setMenuItems(previous => editingMenuItemId
      ? previous.map(item => item.id === editingMenuItemId ? savedItem : item)
      : [...previous, savedItem]);
    setNewMenuItem({ nombre: '', categoria: menuCategories[0] || '', precio: '', descripcion: '', sedesNoDisponibles: [] });
    showToast(editingMenuItemId ? 'Platillo actualizado correctamente' : 'Platillo agregado al menú', 'success');
    setEditingMenuItemId(null);
  };
  const editMenuItem = item => {
    setEditingMenuItemId(item.id);
    setNewMenuItem({ nombre: item.nombre, categoria: item.categoria, precio: String(item.precio), descripcion: item.descripcion || '', sedesNoDisponibles: item.sedesNoDisponibles || [] });
  };
  const handleToggleExcludedBranch = sede => {
    setNewMenuItem(previous => ({
      ...previous,
      sedesNoDisponibles: previous.sedesNoDisponibles.includes(sede)
        ? previous.sedesNoDisponibles.filter(excluded => excluded !== sede)
        : [...previous.sedesNoDisponibles, sede]
    }));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0A090C] text-[#F8FFE5] font-sans flex flex-col lg:flex-row">
      
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* SIDEBAR DE NAVEGACIÓN DEDICADO DEL PANEL ADMIN */}
      <aside className="w-full max-w-full overflow-x-hidden lg:w-72 bg-[#001812] border-r border-[#659B5E]/30 p-4 sm:p-6 flex flex-col justify-between shrink-0 shadow-2xl">
        <div className="space-y-8">
          
          <div className="flex items-center p-3 border-b border-zinc-800/80 mb-4">
            <img
              src={officialLogo}
              onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = caciqueIcon; }}
              alt="El Cacique Logo"
              className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
            />
          </div>

          <div className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#659B5E]">
              <ShieldCheck className="w-4 h-4" />
              <span>Administradora General</span>
            </div>
            <p className="font-extrabold text-sm text-[#F8FFE5]">
              {user?.nombre || 'Angel Daniela Salazar T.'}
            </p>
            <p className="text-[10px] text-gray-400">admin@elcacique.com</p>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#659B5E]/20 bg-black/20 px-3 py-2" aria-label="Tamaño del texto">
            <span className="text-xs text-zinc-400">Tamaño del texto</span>
            <div className="flex gap-2"><button type="button" aria-label="Reducir tamaño de letra" onClick={decreaseFontSize} className="min-h-9 min-w-10 rounded-lg border border-white/10 px-2 font-bold hover:border-amber-400">A−</button><button type="button" aria-label="Aumentar tamaño de letra" onClick={increaseFontSize} className="min-h-9 min-w-10 rounded-lg border border-white/10 px-2 font-bold hover:border-amber-400">A+</button></div>
          </div>

          <nav className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
            {[
                { id: 'resumen', label: 'Resumen & Analíticas', icon: BarChart3 },
                { id: 'inventario', label: 'Gestión de Inventario', icon: Package, badge: criticalItemsCount > 0 ? criticalItemsCount : null },
                { id: 'menu', label: 'Gestión de Menú', icon: ShoppingBag },
                { id: 'proveedores', label: 'Proveedores', icon: Truck },
                { id: 'facturas', label: 'Facturas & Finanzas', icon: FileText },
                { id: 'correos', label: 'Centro de Correos', icon: Mail },
                { id: 'cupones', label: 'Cupones & Promos', icon: Ticket },
                { id: 'resenas', label: 'Reseñas & Clientes', icon: Star },
                { id: 'arqueo', label: 'Arqueo de Caja & POS', icon: CreditCard },
                { id: 'personal', label: 'Personal & Planilla', icon: Users },
                { id: 'mesas', label: 'Mesas & Reservaciones', icon: Calendar }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                    activeSection === item.id 
                      ? 'bg-[#D16014] text-white shadow-lg shadow-[#D16014]/30' 
                      : 'text-gray-400 hover:text-white hover:bg-[#0A090C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#F8FFE5]/10 space-y-2 text-xs font-bold">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-300 hover:text-white hover:border-[#659B5E] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-4 h-4" /> Ir a Sitio Web
          </button>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="min-w-0 w-full max-w-full grow overflow-x-hidden p-4 sm:p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        <header className="bg-gradient-to-r from-[#001812] via-zinc-900 to-[#0A090C] rounded-3xl border border-[#659B5E]/30 p-6 sm:p-8 grid grid-cols-1 2xl:grid-cols-[minmax(16rem,1fr)_auto] items-center gap-6 shadow-2xl shadow-black/60">
          <div className="min-w-0 space-y-1">
            <div>
              <span className="inline-flex px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                Dirección General de Operaciones
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">¡{getGreeting()}, {user?.alias || 'Angel'}!</h1>
            <p className="text-xs text-zinc-400 mt-1">
              {selectedSede === 'todas' ? 'Resumen ejecutivo del rendimiento operativo y consolidado de sedes.' : `Resumen ejecutivo del rendimiento operativo de Sede ${formatSedeName(selectedSede)}.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap 2xl:flex-nowrap items-stretch sm:items-center gap-3 w-full 2xl:w-auto">
            <div className="flex bg-[#0A090C] p-1 rounded-2xl border border-[#659B5E]/40 text-xs font-extrabold">
              {['dia', 'semana', 'mes'].map(period => (
                <button key={period} onClick={() => handlePeriodChange(period)} className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${timePeriod === period ? 'bg-[#D16014] text-white' : 'text-gray-400 hover:text-white'}`}>
                  {period === 'dia' ? 'Día' : period === 'semana' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="historical-month">Mes del histórico</label>
            <select id="historical-month" aria-label="Mes del histórico" value={selectedHistoryMonth} disabled={!historicalData.length} onChange={event => setSelectedHistoryMonth(event.target.value)} className="bg-[#0A090C] border border-[#659B5E]/40 disabled:opacity-50 rounded-2xl px-3 py-3 text-xs font-bold text-[#F8FFE5] cursor-pointer">
              <option value="">Periodo actual</option>
              {historicalMonthOptions.map(([month, label]) => <option key={month} value={month}>{label}</option>)}
            </select>
            <button type="button" onClick={loadHistoricalData} className="px-3 py-2.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 rounded-2xl text-amber-300 text-xs font-extrabold whitespace-nowrap">
              <Upload className="w-4 h-4 inline-block mr-1.5" />Cargar histórico
            </button>
            <div className="relative grow sm:grow-0">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-[#659B5E]" />
              <select
                aria-label="Sede del panel"
                value={selectedSede}
                onChange={e => {
                  setSelectedSede(e.target.value);
                  showToast(`Filtros aplicados para Sede ${formatSedeName(e.target.value)}`, 'info');
                }}
                className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-[#F8FFE5] focus:outline-none focus:border-[#D16014] cursor-pointer"
              >
                <option value="todas">Todas las Sedes • Consolidado General</option>
                <option value="escazu">Sede Escazú • Centro Culinario</option>
                <option value="santa_ana">Sede Santa Ana • Plaza Real</option>
                <option value="cartago">Sede Cartago • Paso Ancho</option>
                <option value="heredia">Sede Heredia • Vía Central</option>
              </select>
            </div>

            <button
              onClick={() => exportReport('csv')}
              className="px-3 py-2.5 bg-[#659B5E] hover:bg-[#52824c] rounded-2xl text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              title="Exportar CSV"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => exportReport('json')}
              className="px-3 py-2.5 bg-[#0A090C] border border-[#F8FFE5]/15 hover:border-[#D16014] rounded-2xl text-gray-300 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              title="Exportar JSON"
            >
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
        </header>

        {/* ALERTA CRÍTICA */}
        {criticalItemsCount > 0 && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center justify-between text-xs text-amber-300 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="font-extrabold block">Atención: Reabastecimiento Requerido</strong>
                <span>Hay {criticalItemsCount} insumo(s) en Sede {formatSedeName(selectedSede)} por debajo de su Límite Mínimo.</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveSection('inventario')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl text-[11px] cursor-pointer"
            >
              Ver Insumos
            </button>
          </div>
        )}

        {/* RESUMEN Y MÉTRICAS */}
        {activeSection === 'resumen' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Ventas ({timePeriod})</span>
                  <DollarSign className="w-4 h-4 text-[#659B5E]" />
                </div>
                <div className="text-3xl font-black text-[#D16014]">₡{currentMetrics.ventas.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5% rendimiento mensual
                </span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Comandas ({timePeriod})</span>
                  <ShoppingBag className="w-4 h-4 text-[#D16014]" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentMetrics.comandas.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +8.2% incremento diario</span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Clientes Atendidos</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentMetrics.clientes.toLocaleString()}</div>
                <span className="text-[10px] text-[#659B5E] font-bold flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +15.3% preferencia</span>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span>Tiempo Prom. Entrega</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-black text-[#F8FFE5]">{currentMetrics.coccion}</div>
                <span className="text-[10px] text-gray-400">Objetivo: &lt; 20 min</span>
              </div>
              {selectedHistoryMonth && <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-3 shadow-xl">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400"><span>Insumos consumidos · {historicalMonthOptions.find(([month]) => month === selectedHistoryMonth)?.[1]}</span><Package className="w-4 h-4 text-amber-400" /></div>
                <div className="text-3xl font-black text-amber-400">{Math.round(historicalSuppliesConsumed / historyScale).toLocaleString('es-CR')}</div>
                <span className="text-[10px] text-gray-400">Unidades estimadas en periodo {timePeriod}</span>
              </div>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-2xl p-5"><p className="text-xs text-gray-400">Ticket promedio</p><p className="text-2xl font-black text-amber-400">₡{averageTicket.toLocaleString('es-CR')}</p></div>
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-2xl p-5"><p className="text-xs text-gray-400">Ocupación de mesas</p><p className="text-2xl font-black text-[#659B5E]">{currentMetrics.mesasTotal ? Math.round((currentMetrics.mesasTotal - currentMetrics.mesasLibres) / currentMetrics.mesasTotal * 100) : 0}% <span className="text-xs text-gray-400 font-normal">({currentMetrics.mesasTotal - currentMetrics.mesasLibres}/{currentMetrics.mesasTotal})</span></p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6"><h3 className="font-extrabold mb-4">Comparativo de Ventas por Sede</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={salesByBranch}><CartesianGrid stroke="#659B5E" strokeOpacity={0.18} vertical={false} /><XAxis dataKey="sede" stroke="#9ca3af" /><YAxis stroke="#9ca3af" /><Tooltip /><Bar dataKey="ventas" fill="#D16014" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div></section>
              <section className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6"><h3 className="font-extrabold mb-4">Distribución de Clientes por Sucursal</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={salesByBranch} dataKey="clientes" nameKey="sede" innerRadius={55} outerRadius={90} label>{salesByBranch.map((entry, index) => <Cell key={entry.sede} fill={['#D16014','#659B5E','#EAB308','#38BDF8'][index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center border-b border-[#F8FFE5]/10 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#F8FFE5]">Tendencia de Ventas</h3>
                    <p className="text-xs text-gray-400">Evolución del periodo {timePeriod} en Sede {formatSedeName(selectedSede)}.</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[#659B5E]" />
                </div>
                <div className="h-56 w-full" role="img" aria-label={`Gráfico de ventas para el periodo ${timePeriod} en Sede ${formatSedeName(selectedSede)}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlySalesData} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D16014" stopOpacity={0.65} />
                          <stop offset="95%" stopColor="#659B5E" stopOpacity={0.08} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#659B5E" strokeOpacity={0.18} vertical={false} />
                      <XAxis dataKey="mes" stroke="#9ca3af" tickLine={false} />
                      <YAxis stroke="#9ca3af" tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0A090C', borderColor: '#659B5E' }} />
                      <Area type="monotone" dataKey="ventas" stroke="#D16014" strokeWidth={3} fill="url(#salesFill)" activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-5 shadow-2xl">
                <h3 className="font-extrabold text-base border-b border-[#F8FFE5]/10 pb-4">Estado de Órdenes</h3>
                {[
                  { label: 'Despachadas', value: currentMetrics.completados, color: 'text-[#659B5E]', icon: CheckCircle2 },
                  { label: 'En Proceso / Paila', value: currentMetrics.pendientes, color: 'text-amber-400', icon: Clock },
                  { label: 'Canceladas', value: currentMetrics.cancelados, color: 'text-red-400', icon: AlertTriangle }
                ].map(status => {
                  const StatusIcon = status.icon;
                  return (
                    <div key={status.label} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex justify-between items-center">
                      <span className={`text-xs font-bold ${status.color} flex items-center gap-2`}><StatusIcon className="w-4 h-4" /> {status.label}</span>
                      <span className="text-lg font-black text-white">{status.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="font-extrabold text-base border-b border-[#F8FFE5]/10 pb-3 flex items-center gap-2"><Award className="w-5 h-5 text-[#D16014]" /> Platillos Más Vendidos</h3>
                <div className="space-y-3 text-xs">
                  {topSellingFoods.map(food => (
                    <div key={food.rank} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><span className="font-mono font-black text-[#D16014]">{food.rank}</span><div><strong className="font-bold text-white block">{food.nombre}</strong><span className="text-[10px] text-gray-400">{food.ventas} órdenes servidas</span></div></div>
                      <div className="text-right"><span className="font-black text-[#659B5E] block">{food.monto}</span><span className="text-[10px] text-amber-400">Calificación {food.rating}/5</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="font-extrabold text-base border-b border-[#F8FFE5]/10 pb-3">Actividad en Vivo</h3>
                {liveActivities.map(activity => <div key={activity.id} className="p-3 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10"><p className="text-xs font-bold text-gray-200">{activity.texto}</p><span className="text-[10px] text-[#659B5E] font-mono">{activity.hora}</span></div>)}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'proveedores' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F8FFE5]/10 pb-4">
              <div><h3 className="font-extrabold text-lg">Directorio de Proveedores</h3><p className="text-gray-400 text-[11px]">Contactos e insumos para las sedes de El Cacique.</p></div>
              <button onClick={() => setIsSupplierModalOpen(true)} className="px-5 py-3 rounded-2xl bg-[#D16014] text-white font-extrabold flex items-center gap-2 cursor-pointer"><Plus className="w-4 h-4" /> Registrar Proveedor</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {suppliers.filter(supplier => supplier.sede === selectedSede || suppliers.length < 4).map(supplier => (
                <div key={supplier.id} className="p-5 bg-[#0A090C] border border-[#659B5E]/30 rounded-2xl space-y-3">
                  <div className="flex justify-between gap-3"><div><span className="text-[10px] text-[#659B5E] font-black uppercase">Proveedor verificado</span><h4 className="font-extrabold text-base text-white">{supplier.nombre}</h4></div><span className="px-2 py-1 rounded-lg bg-[#659B5E]/20 text-[#659B5E] text-[10px] font-black">{supplier.estado}</span></div>
                  <p className="text-gray-300">Contacto: <strong>{supplier.contacto}</strong></p><p className="text-gray-300">Tel: {supplier.telefono} · {supplier.email}</p><p className="text-amber-300">Insumos: {supplier.insumos}</p>
                  <button onClick={() => { setEmailData({ tipo: 'INVENTARIO_ALERTA', destinatarioTipo: 'especifico', especifico: supplier.email, asunto: 'Solicitud de reabastecimiento', mensaje: '' }); setActiveSection('correos'); }} className="w-full py-2 rounded-xl border border-[#F8FFE5]/15 text-gray-300 hover:border-[#D16014] flex items-center justify-center gap-2 cursor-pointer"><Mail className="w-4 h-4" /> Contactar proveedor</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'facturas' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-[#F8FFE5]/10 pb-4"><div><h3 className="font-extrabold text-lg">Facturas & Finanzas</h3><p className="text-gray-400 text-[11px]">Consulta comprobantes emitidos y facturas de proveedores.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setInvoiceKind('clientes')} className={`px-3 py-2 rounded-xl font-bold ${invoiceKind === 'clientes' ? 'bg-[#D16014] text-white' : 'border border-[#F8FFE5]/15 text-gray-300'}`}>Emitidas a clientes</button><button onClick={() => setInvoiceKind('proveedores')} className={`px-3 py-2 rounded-xl font-bold ${invoiceKind === 'proveedores' ? 'bg-[#D16014] text-white' : 'border border-[#F8FFE5]/15 text-gray-300'}`}>Proveedores</button>{invoiceKind === 'proveedores' && <button onClick={() => setIsInvoiceModalOpen(true)} className="px-4 py-2 rounded-xl bg-[#D16014] text-white font-extrabold flex items-center gap-2 cursor-pointer"><Upload className="w-4 h-4" /> Subir Factura</button>}</div></div>
            {invoiceKind === 'clientes' ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">{[['dia', 'Hoy'], ['mes', 'Este mes'], ['todos', 'Todas']].map(([period, label]) => <button key={period} onClick={() => setInvoicePeriod(period)} className={`px-3 py-2 rounded-xl font-bold ${invoicePeriod === period ? 'bg-[#D16014] text-white' : 'border border-[#F8FFE5]/15 text-gray-300'}`}>{label}</button>)}<input value={invoiceSearch} onChange={event => setInvoiceSearch(event.target.value)} placeholder="Buscar cliente, identificación o clave de Hacienda..." className="flex-1 min-w-56 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2" /></div>
                <div className="overflow-x-auto rounded-2xl border border-[#F8FFE5]/10"><table className="w-full text-left"><thead><tr className="bg-[#0A090C] uppercase text-[10px]"><th className="p-4">Clave Hacienda</th><th className="p-4">Cliente</th><th className="p-4">Identificación</th><th className="p-4">Fecha</th><th className="p-4">Tipo</th><th className="p-4 text-right">Monto</th></tr></thead><tbody className="divide-y divide-[#F8FFE5]/10">{filteredCustomerInvoices.map(invoice => <tr key={invoice.id}><td className="p-4 text-[#D16014] font-bold">{invoice.id}</td><td className="p-4">{invoice.cliente}</td><td className="p-4">{invoice.cedula}</td><td className="p-4 text-gray-400">{invoice.fecha}</td><td className="p-4">{invoice.tipo}</td><td className="p-4 text-right text-[#659B5E] font-bold">₡{invoice.monto.toLocaleString('es-CR')}</td></tr>)}{filteredCustomerInvoices.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-gray-400">No hay facturas que coincidan con los filtros.</td></tr>}</tbody></table></div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#F8FFE5]/10"><table className="w-full text-left"><thead><tr className="bg-[#0A090C] uppercase text-[10px]"><th className="p-4">Código</th><th className="p-4">Proveedor</th><th className="p-4">Monto</th><th className="p-4">Fecha</th><th className="p-4">Estado</th><th className="p-4 text-right">Archivo</th></tr></thead><tbody className="divide-y divide-[#F8FFE5]/10">{invoices.map(invoice => <tr key={invoice.id}><td className="p-4 text-[#D16014] font-bold">{invoice.id}</td><td className="p-4">{invoice.proveedor}</td><td className="p-4 text-[#659B5E] font-bold">₡{invoice.monto.toLocaleString()}</td><td className="p-4 text-gray-400">{invoice.fecha}</td><td className="p-4"><span className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-bold">{invoice.estado}</span></td><td className="p-4 text-right"><button onClick={() => handleDownloadInvoice(invoice)} className="px-3 py-1.5 border border-[#F8FFE5]/15 rounded-xl flex items-center gap-1 ml-auto cursor-pointer"><Download className="w-3.5 h-3.5" /> Descargar</button></td></tr>)}</tbody></table></div>
            )}
          </div>
        )}

        {activeSection === 'menu' && (
          <div className="w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-[#659B5E]/30 bg-gradient-to-br from-[#001812] via-zinc-900 to-[#0A090C] p-4 shadow-2xl sm:p-6">
            <div className="mb-5"><h3 className="font-extrabold text-lg">Gestión dinámica del menú</h3><p className="text-gray-400 text-[11px]">Agrega, edita o elimina platillos y disponibilidad por sucursal.</p></div>
            <form onSubmit={addMenuCategory} className="mb-6 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><input value={newCategory} onChange={event => setNewCategory(event.target.value)} placeholder="Nueva categoría o sección" className="min-w-0 w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" /><button className="min-h-11 px-4 py-2.5 rounded-xl bg-[#D16014] text-white font-bold">Crear categoría</button></form>
            <form onSubmit={addMenuItem} className="mb-7 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <input required value={newMenuItem.nombre} onChange={event => setNewMenuItem({ ...newMenuItem, nombre: event.target.value })} placeholder="Nombre del platillo" className="min-w-0 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />
              <select aria-label="Categoría del platillo" value={newMenuItem.categoria} onChange={event => setNewMenuItem({ ...newMenuItem, categoria: event.target.value })} className="min-w-0 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5">{menuCategories.map(category => <option key={category} value={category}>{category}</option>)}</select>
              <input required type="number" min="1" step="1" value={newMenuItem.precio} onChange={event => setNewMenuItem({ ...newMenuItem, precio: event.target.value })} placeholder="Precio en colones" className="min-w-0 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />
              <input value={newMenuItem.descripcion} onChange={event => setNewMenuItem({ ...newMenuItem, descripcion: event.target.value })} placeholder="Descripción breve" className="min-w-0 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />
              <fieldset className="sm:col-span-2 min-w-0 rounded-2xl border border-[#659B5E]/25 bg-black/20 p-4"><legend className="px-2 font-bold text-amber-300">Restricción de disponibilidad por sede</legend><p className="mb-3 text-[11px] text-gray-400">Selecciona las sedes donde este platillo no estará disponible.</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{sedesDisponibles.map(sede => { const excluded = newMenuItem.sedesNoDisponibles.includes(sede); return <label key={sede} className={`flex min-h-12 min-w-0 items-center gap-3 rounded-xl border p-3 text-xs transition-colors ${excluded ? 'border-amber-500/40 bg-amber-500/10 text-amber-200' : 'border-[#659B5E]/20 bg-[#001812]/50 text-zinc-300'}`}><input aria-label={`No disponible en ${sede}`} type="checkbox" checked={excluded} onChange={() => handleToggleExcludedBranch(sede)} className="h-4 w-4 shrink-0 accent-amber-500"/><span className="min-w-0 break-words">No disponible en {sede}</span><span className="ml-auto shrink-0 rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wide">{excluded ? 'Excluida' : 'Disponible'}</span></label>; })}</div></fieldset>
              <div className="sm:col-span-2 flex flex-wrap justify-end gap-2"><button type="submit" className="min-h-11 rounded-xl bg-[#D16014] px-5 py-2.5 font-extrabold text-white">{editingMenuItemId ? 'Guardar cambios del platillo' : 'Guardar platillo'}</button>{editingMenuItemId && <button type="button" onClick={() => { setEditingMenuItemId(null); setNewMenuItem({ nombre: '', categoria: menuCategories[0] || '', precio: '', descripcion: '', sedesNoDisponibles: [] }); }} className="min-h-11 rounded-xl border border-white/15 px-4 py-2.5 font-bold">Cancelar edición</button>}</div>
            </form>
            <div className="w-full max-w-full divide-y divide-[#F8FFE5]/10 overflow-hidden border-y border-[#F8FFE5]/10">{menuItems.map(item => <article key={item.id} className="flex min-w-0 flex-col justify-between gap-4 py-4 sm:flex-row sm:items-center"><div className="min-w-0"><strong className="break-words text-white">{item.nombre}</strong><span className="ml-2 text-[#659B5E]">{item.categoria}</span><p className="mt-1 break-words text-gray-400">{item.descripcion}</p>{item.sedesNoDisponibles?.length > 0 && <p className="mt-1 break-words text-amber-300">No disponible en: {item.sedesNoDisponibles.join(', ')}</p>}</div><div className="flex shrink-0 flex-wrap items-center gap-3"><strong className="text-amber-300">₡{item.precio.toLocaleString('es-CR')}</strong><button type="button" aria-label={`Editar ${item.nombre}`} onClick={() => editMenuItem(item)} className="min-h-10 rounded-lg border border-amber-500/20 px-3 text-amber-200 hover:bg-amber-500/10"><Pencil className="h-4 w-4"/></button><button type="button" aria-label={`Eliminar ${item.nombre}`} onClick={() => setMenuItems(previous => previous.filter(current => current.id !== item.id))} className="min-h-10 min-w-10 rounded-lg border border-red-500/20 px-3 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div></article>)}</div>
          </div>
        )}

        {activeSection === 'correos' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 sm:p-8 space-y-6 text-xs shadow-2xl">
            <div className="border-b border-[#F8FFE5]/10 pb-4"><h3 className="font-extrabold text-lg flex items-center gap-2"><Mail className="w-5 h-5 text-[#D16014]" /> Centro de Correos y Comunicados</h3><p className="text-gray-400 text-[11px]">Envía comunicaciones a clientes, proveedores o personal mediante n8n.</p></div>
            <section className="space-y-3" aria-labelledby="email-templates-title">
              <h4 id="email-templates-title" className="font-bold text-amber-400">Plantillas</h4>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setEmailData({ ...emailData, asunto: 'Bienvenido a El Cacique', mensaje: 'Gracias por registrarse. Le esperamos para disfrutar de nuestra propuesta gastronómica.' })} className="px-3 py-2 rounded-xl border border-[#F8FFE5]/15 hover:border-[#D16014]">Bienvenida</button>
                <button type="button" onClick={() => setEmailData({ ...emailData, asunto: 'Promoción de temporada', mensaje: 'Consulte nuestras promociones vigentes en su sede favorita.' })} className="px-3 py-2 rounded-xl border border-[#F8FFE5]/15 hover:border-[#D16014]">Promoción de temporada</button>
                <button type="button" onClick={() => setEmailData({ ...emailData, asunto: 'Aviso de reabastecimiento', mensaje: 'Le compartimos la solicitud de reabastecimiento de insumos correspondiente.' })} className="px-3 py-2 rounded-xl border border-[#F8FFE5]/15 hover:border-[#D16014]">Reabastecimiento</button>
              </div>
            </section>
            <form onSubmit={handleSendEmail} className="space-y-4 max-w-2xl">
              <label className="block space-y-1"><span className="text-gray-400">Tipo de notificación</span><select value={emailData.tipo} onChange={event => setEmailData({ ...emailData, tipo: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5"><option value="INVENTARIO_ALERTA">Alerta de inventario / proveedores</option><option value="RESERVA_MESA">Confirmación / modificación de reserva</option></select></label>
              <label className="block space-y-1"><span className="text-gray-400">Audiencia</span><select aria-label="Audiencia" value={emailData.destinatarioTipo} onChange={event => { setEmailData({ ...emailData, destinatarioTipo: event.target.value }); setEmailSelectedRecipients([]); }} className="w-full min-w-0 bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5"><option value="todos_clientes">Todos los clientes registrados ({emailContacts.length})</option><option value="clientes_seleccionados">Clientes seleccionados</option><option value="todos_proveedores">Todos los proveedores ({suppliers.length})</option><option value="proveedores_seleccionados">Proveedores seleccionados</option><option value="personal_meseros">Personal y cocina ({employees.length})</option><option value="especifico">Correo específico</option></select></label>
              {['clientes_seleccionados', 'proveedores_seleccionados'].includes(emailData.destinatarioTipo) && <fieldset className="max-h-48 w-full max-w-full space-y-2 overflow-y-auto rounded-xl border border-[#659B5E]/20 bg-[#0A090C] p-3"><legend className="px-1 font-bold text-amber-300">Selecciona uno o varios destinatarios</legend>{(emailData.destinatarioTipo === 'clientes_seleccionados' ? emailContacts : suppliers).map(recipient => {
                const email = recipient.correo || recipient.email;
                const label = `${recipient.nombre || recipient.contacto || recipient.empresa || 'Destinatario'} — ${email}`;
                return <label key={email} className="flex min-w-0 items-start gap-2 rounded-lg px-2 py-2 hover:bg-white/5"><input type="checkbox" aria-label={label} checked={emailSelectedRecipients.includes(email)} onChange={() => setEmailSelectedRecipients(previous => previous.includes(email) ? previous.filter(value => value !== email) : [...previous, email])} className="mt-0.5 shrink-0 accent-amber-500"/><span className="min-w-0 break-all text-zinc-300">{label}</span></label>;
              })}{(emailData.destinatarioTipo === 'clientes_seleccionados' ? emailContacts : suppliers).length === 0 && <p className="text-zinc-400">No hay destinatarios disponibles.</p>}</fieldset>}
              {emailData.destinatarioTipo === 'especifico' && <input aria-label="Correo del destinatario" type="email" placeholder="destinatario@correo.cr" value={emailData.especifico} onChange={event => setEmailData({ ...emailData, especifico: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />}
              <input type="text" placeholder="Asunto del comunicado" value={emailData.asunto} onChange={event => setEmailData({ ...emailData, asunto: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />
              <textarea rows="6" placeholder="Escriba el mensaje..." value={emailData.mensaje} onChange={event => setEmailData({ ...emailData, mensaje: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-3" />
              <button type="submit" disabled={emailLoading} className="py-3 px-6 bg-[#D16014] text-white font-extrabold rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"><Send className="w-4 h-4" /> {emailLoading ? 'Enviando correo...' : 'Despachar con n8n'}</button>
            </form>
            <section className="max-w-2xl border-t border-[#F8FFE5]/10 pt-5 space-y-3" aria-labelledby="email-contact-title">
              <h4 id="email-contact-title" className="font-bold text-amber-400">Registrar contacto de cliente</h4>
              <p className="text-gray-400">Las cuentas creadas desde el registro del sitio se incorporan automáticamente a la audiencia.</p>
              <form onSubmit={handleSaveEmailContact} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input aria-label="Nombre del cliente" value={emailContact.nombre} onChange={event => setEmailContact({ ...emailContact, nombre: event.target.value })} placeholder="Nombre completo" className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />
                <input aria-label="Correo del cliente" type="email" value={emailContact.correo} onChange={event => setEmailContact({ ...emailContact, correo: event.target.value })} placeholder="cliente@correo.cr" className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5" />
                <button type="submit" className="px-4 py-2.5 bg-[#659B5E] text-white font-bold rounded-xl">Guardar contacto</button>
              </form>
              <ul className="space-y-1 text-gray-300" aria-label="Contactos registrados">
                {emailContacts.map(contact => <li key={contact.id}>{contact.nombre} — {contact.correo}</li>)}
              </ul>
            </section>
            {emailResponse && (
              <div className={`max-w-2xl rounded-2xl border p-4 text-xs ${emailResponse.success ? 'border-[#659B5E]/40 bg-[#659B5E]/10 text-[#B9E3B3]' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}>
                <strong className="block font-extrabold">{emailResponse.success ? 'Respuesta del envío' : 'Error del envío'}</strong>
                <span>{emailResponse.success ? `Comunicado aceptado por ${emailResponse.mode === 'n8n_online' ? 'n8n' : 'el modo local de respaldo'}.` : emailResponse.message}</span>
              </div>
            )}
          </div>
        )}

        {/* MÓDULO DE INVENTARIO CON LÍMITES Y ALERTAS */}
        {activeSection === 'inventario' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F8FFE5]/10 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#F8FFE5]">Control de Insumos &amp; Umbrales de Seguridad</h3>
                <p className="text-gray-400 text-[11px]">Establece límites mínimos de reorden y máximos de capacidad por sede.</p>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-3 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Insumo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar insumo por nombre..."
                  value={searchInsumo}
                  onChange={e => setSearchInsumo(e.target.value)}
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl pl-10 pr-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#659B5E]" />
                <select
                  value={filterState}
                  onChange={e => setFilterState(e.target.value)}
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] font-bold focus:outline-none focus:border-[#D16014] cursor-pointer"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="critico">Stock Crítico (En o bajo Límite Mínimo)</option>
                  <option value="optimo">✓ Stock Óptimo</option>
                </select>
              </div>
            </div>

            {/* TABLA DE REGISTROS */}
            <div className="overflow-x-auto rounded-2xl border border-[#F8FFE5]/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A090C] text-[#F8FFE5] border-b border-[#F8FFE5]/10 text-[11px] uppercase tracking-wider font-extrabold">
                    <th className="p-4">Insumo</th>
                    <th className="p-4">Stock Actual</th>
                    <th className="p-4">Límite Mínimo</th>
                    <th className="p-4">Límite Máximo</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FFE5]/10 font-mono">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map(item => {
                      const isLow = item.stock <= item.minLimit;
                      return (
                        <tr key={item.id} className="hover:bg-[#0A090C]/50 transition-colors">
                          <td className="p-4 font-sans font-extrabold text-[#F8FFE5]">{item.nombre}</td>
                          <td className="p-4 text-sm font-bold text-white">{item.stock} {item.unidad}</td>
                          <td className="p-4 text-amber-400 font-bold">{item.minLimit} {item.unidad}</td>
                          <td className="p-4 text-gray-400">{item.maxLimit} {item.unidad}</td>
                          <td className="p-4 font-sans">
                            {isLow ? (
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1 w-max">
                                <AlertTriangle className="w-3 h-3" /> Stock Crítico
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#659B5E]/20 text-[#659B5E] border border-[#659B5E]/40 text-[10px] font-black uppercase flex items-center gap-1 w-max">
                                <CheckCircle2 className="w-3 h-3" /> Óptimo
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2 font-sans">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg cursor-pointer"
                              title="Editar Insumo y Límites"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id, item.nombre)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                              title="Eliminar Insumo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-400 font-sans">
                        No se encontraron insumos con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'cupones' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F8FFE5]/10 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#F8FFE5] flex items-center gap-2"><Ticket className="w-5 h-5 text-[#D16014]" /> Cupones y Promociones</h3>
                <p className="text-gray-400 text-[11px]">Gestiona campañas activas y mide su uso en Sede {formatSedeName(selectedSede)}.</p>
              </div>
              <button
                onClick={() => showToast('Formulario de nueva promoción disponible próximamente', 'info')}
                className="px-5 py-3 rounded-2xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Crear Promoción
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div key={coupon.id} className="p-5 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono font-black text-[#D16014] text-base">{coupon.codigo}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${coupon.estado === 'Activo' ? 'bg-[#659B5E]/20 text-[#659B5E]' : 'bg-amber-500/20 text-amber-400'}`}>{coupon.estado}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{coupon.descripcion}</p>
                  <div className="flex items-center justify-between border-t border-[#F8FFE5]/10 pt-3">
                    <span className="text-gray-400">Usos registrados</span>
                    <span className="font-black text-white">{coupon.usos}</span>
                  </div>
                  <button
                    onClick={() => {
                      triggerN8nAutomation('PROMOCION_CACIQUE', { codigo: coupon.codigo, sede: selectedSede, accion: 'ACTUALIZAR_PROMOCION' });
                      showToast(`Promoción ${coupon.codigo} sincronizada`, 'success');
                    }}
                    className="w-full py-2 rounded-xl border border-[#659B5E]/30 text-[#659B5E] font-bold hover:bg-[#659B5E]/10 cursor-pointer"
                  >
                    Sincronizar Campaña
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'resenas' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#F8FFE5]/10 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#F8FFE5] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#D16014]" /> Reseñas y Clientes</h3>
                <p className="text-gray-400 text-[11px]">Comentarios recientes de la experiencia gastronómica.</p>
              </div>
              <div className="text-right"><span className="block text-2xl font-black text-amber-400">4.8</span><span className="text-[10px] text-gray-400">Promedio general</span></div>
            </div>

            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="p-4 bg-[#0A090C] rounded-2xl border border-[#F8FFE5]/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><strong className="text-white">{review.cliente}</strong><span className="text-[10px] text-[#659B5E]">Sede {review.sede}</span></div>
                    <p className="text-gray-300 leading-relaxed">{review.comentario}</p>
                  </div>
                  <div className="shrink-0 text-amber-400 tracking-wide">Calificación {review.rating}/5</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => showToast('No hay reseñas pendientes de moderación', 'info')}
              className="px-5 py-2.5 rounded-xl bg-[#659B5E] hover:bg-[#52824c] text-white font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Revisar moderación
            </button>
          </div>
        )}

        {/* ARQUEO DE CAJA */}
        {activeSection === 'arqueo' && <FacturacionPanel key={selectedSede} sede={selectedSede === 'todas' ? 'escazu' : selectedSede} sedeNombre={selectedSede === 'todas' ? 'Escazú (sede operativa)' : formatSedeName(selectedSede)} inventory={branchInventory} onPurchase={handleRegisterPurchase} />}

        {/* PERSONAL */}
        {activeSection === 'personal' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-6 text-xs shadow-2xl">
            <h3 className="font-extrabold text-lg text-[#F8FFE5]">Personal y planilla — Sede {formatSedeName(selectedSede)}</h3>
            <form onSubmit={handleSaveEmployee} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="space-y-1"><span>Nombre completo</span><input required aria-label="Nombre completo" value={employeeForm.nombre} onChange={event => setEmployeeForm({ ...employeeForm, nombre: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5" /></label>
              <label className="space-y-1"><span>Puesto / rol</span><select aria-label="Puesto / rol" value={employeeForm.puesto} onChange={event => setEmployeeForm({ ...employeeForm, puesto: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"><option>Mesero de Salón &amp; Terraza</option><option>Cocinero / Chef de Paila</option><option>Cajero POS</option><option>Administrador de Sede</option></select></label>
              <label className="space-y-1"><span>Salario mensual (CRC)</span><input required min="1" type="number" aria-label="Salario mensual" value={employeeForm.salario} onChange={event => setEmployeeForm({ ...employeeForm, salario: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5" /></label>
              <label className="space-y-1"><span>Frecuencia de pago</span><select aria-label="Frecuencia de pago" value={employeeForm.frecuenciaPago} onChange={event => setEmployeeForm({ ...employeeForm, frecuenciaPago: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"><option>Quincenal</option><option>Mensual</option></select></label>
              <label className="space-y-1"><span>Días de pago</span><input aria-label="Días de pago" value={employeeForm.diaPago} onChange={event => setEmployeeForm({ ...employeeForm, diaPago: event.target.value })} placeholder="15 y 30 o último día del mes" className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5" /></label>
              <label className="space-y-1"><span>Banco destino</span><select aria-label="Banco destino" value={employeeForm.banco} onChange={event => setEmployeeForm({ ...employeeForm, banco: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"><option>BAC Credomatic</option><option>Banco Nacional (BNCR)</option><option>Banco de Costa Rica (BCR)</option><option>Banco Popular</option></select></label>
              <label className="space-y-1"><span>Sede asignada</span><select aria-label="Sede asignada" value={employeeForm.sede || 'escazu'} onChange={event => setEmployeeForm({ ...employeeForm, sede: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5">{branchKeys.map(key => <option key={key} value={key}>{branchLabels[key]}</option>)}</select></label>
              <label className="space-y-1 sm:col-span-2"><span>Cuenta IBAN CR (22 caracteres)</span><input aria-label="Cuenta IBAN" value={employeeForm.iban} onChange={event => setEmployeeForm({ ...employeeForm, iban: event.target.value.toUpperCase() })} placeholder="CR..." pattern="CR[0-9]{20}" title="Formato: CR seguido de 20 dígitos" className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5" /></label>
              <div className="flex items-end gap-2"><button type="submit" className="px-5 py-2.5 bg-[#D16014] text-white font-extrabold rounded-xl">{editingEmployeeId ? 'Guardar cambios' : 'Agregar empleado'}</button>{editingEmployeeId && <button type="button" onClick={() => { setEditingEmployeeId(null); setEmployeeForm({ nombre: '', puesto: 'Mesero de Salón & Terraza', salario: '', frecuenciaPago: 'Quincenal', diaPago: '15 y 30', banco: 'BAC Credomatic', iban: '' }); }} className="px-4 py-2.5 border border-[#F8FFE5]/20 rounded-xl">Cancelar</button>}</div>
            </form>
            <div className="overflow-x-auto rounded-xl border border-[#F8FFE5]/10"><table className="w-full text-left"><thead className="bg-[#0A090C] text-gray-300"><tr><th className="p-3">Colaborador</th><th className="p-3">Puesto / Sede</th><th className="p-3">Salario mensual</th><th className="p-3">Pago</th><th className="p-3">Banco / IBAN</th><th className="p-3">Acciones</th></tr></thead><tbody className="divide-y divide-[#F8FFE5]/10">{employees.filter(employee => selectedSede === 'todas' || !employee.sede || employee.sede === selectedSede).map(employee => <tr key={employee.id}><td className="p-3 font-bold">{employee.nombre}</td><td className="p-3">{employee.puesto}<br/><span className="text-gray-400">{branchLabels[employee.sede] || 'Escazú'}</span></td><td className="p-3">₡{employee.salario.toLocaleString('es-CR')}</td><td className="p-3">{employee.frecuenciaPago}: {employee.diaPago}</td><td className="p-3">{employee.banco}<br /><span className="text-gray-400">{employee.iban || 'Pendiente de registrar'}</span></td><td className="p-3 flex gap-3"><button type="button" aria-label={`Editar ${employee.nombre}`} onClick={() => { setEditingEmployeeId(employee.id); setEmployeeForm({ ...employee, salario: String(employee.salario) }); }} className="text-amber-300 hover:underline">Editar</button><button type="button" aria-label={`Eliminar ${employee.nombre}`} onClick={() => { const next = employees.filter(item => item.id !== employee.id); setEmployees(next); localStorage.setItem('cacique_admin_payroll', encryptData(next)); }} className="text-red-300 hover:underline">Eliminar</button></td></tr>)}</tbody></table></div>
          </div>
        )}

        {/* MESAS */}
        {activeSection === 'mesas' && (
          <div className="bg-[#001812] border border-[#659B5E]/30 rounded-3xl p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="font-extrabold text-base text-[#F8FFE5]">Mesas y reservaciones — {selectedSede === 'todas' ? 'Todas las sedes' : formatSedeName(selectedSede)}</h3>
            <p className="text-gray-400">Mesas registradas: {currentMetrics.mesasTotal} | Libres: {currentMetrics.mesasLibres} | Ocupadas: {currentMetrics.mesasTotal-currentMetrics.mesasLibres} | Reservadas: {reservations.filter(item => selectedSede === 'todas' || item.sede === selectedSede).length}</p>
            <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3" onSubmit={event => { event.preventDefault(); const next = [...reservations, { ...reservationForm, id: Date.now(), personas: Number(reservationForm.personas), estado: 'Reservada' }]; setReservations(next); localStorage.setItem('cacique_admin_reservations', JSON.stringify(next)); setReservationForm({ ...reservationForm, cliente: '', fecha: '', hora: '' }); showToast('Reserva registrada', 'success'); }}>
              <input required aria-label="Nombre del Cliente" placeholder="Nombre del cliente" value={reservationForm.cliente} onChange={event => setReservationForm({ ...reservationForm, cliente: event.target.value })} className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"/><input required aria-label="Cantidad de Personas" type="number" min="1" value={reservationForm.personas} onChange={event => setReservationForm({ ...reservationForm, personas: event.target.value })} className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"/><input required aria-label="Fecha" type="date" value={reservationForm.fecha} onChange={event => setReservationForm({ ...reservationForm, fecha: event.target.value })} className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"/><input required aria-label="Hora" type="time" value={reservationForm.hora} onChange={event => setReservationForm({ ...reservationForm, hora: event.target.value })} className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5"/><select aria-label="Sede de reserva" value={reservationForm.sede} onChange={event => setReservationForm({ ...reservationForm, sede: event.target.value })} className="bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-3 py-2.5">{branchKeys.map(key=><option key={key} value={key}>{branchLabels[key]}</option>)}</select><button className="rounded-xl bg-[#D16014] px-4 py-2 font-bold">Crear reserva</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">{branchKeys.filter(key => selectedSede === 'todas' || key === selectedSede).map(key => <div key={key} className="p-4 rounded-2xl bg-[#0A090C] border border-[#659B5E]/20"><strong>{branchLabels[key]}</strong><p className="text-gray-400">Libres {branchDetails[key].mesasLibres} · Ocupadas {branchDetails[key].mesasTotal-branchDetails[key].mesasLibres} · Reservadas {reservations.filter(item=>item.sede===key).length}</p></div>)}</div>
            <div className="space-y-2">{reservations.filter(item => selectedSede === 'todas' || item.sede === selectedSede).map(item=><div key={item.id} className="flex flex-wrap justify-between gap-2 rounded-xl bg-[#0A090C] p-3"><span>{item.cliente} · {item.personas} personas · {item.fecha} {item.hora} · {branchLabels[item.sede]} · Mesa {item.mesa}</span><button onClick={()=>{const next=reservations.filter(res=>res.id!==item.id);setReservations(next);localStorage.setItem('cacique_admin_reservations',JSON.stringify(next));}} className="text-red-300">Cancelar</button></div>)}</div>
          </div>
        )}

      </main>

      {/* MODAL CONFIGURADOR DE INSUMO Y UMBRALES */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#001812] border border-[#659B5E]/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-xs text-[#F8FFE5]">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#F8FFE5]">
                {editingItem ? 'Editar Insumo & Umbrales' : 'Registrar Nuevo Insumo'}
              </h3>
              <p className="text-gray-400">Define los límites mínimo y máximo de existencias por sede.</p>
            </div>

            <form onSubmit={handleSaveInventoryItem} className="space-y-4">
              <div className="space-y-1">
                <label className="block font-bold text-gray-300">Nombre del Insumo</label>
                <input
                  type="text"
                  placeholder="ej: Carne de Cerdo para Chicharrón"
                  value={itemForm.nombre}
                  onChange={e => setItemForm({ ...itemForm, nombre: e.target.value })}
                  required
                  className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-300">Stock Actual</label>
                  <input
                    type="number"
                    placeholder="Cantidad..."
                    value={itemForm.stock}
                    onChange={e => setItemForm({ ...itemForm, stock: e.target.value })}
                    required
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-300">Unidad de Medida</label>
                  <select
                    value={itemForm.unidad}
                    onChange={e => setItemForm({ ...itemForm, unidad: e.target.value })}
                    className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#D16014]"
                  >
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="unid">Unidades (unid)</option>
                    <option value="litros">Litros (l)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-amber-400">Límite Mínimo (Alerta)</label>
                  <input
                    type="number"
                    placeholder="ej: 30"
                    value={itemForm.minLimit}
                    onChange={e => setItemForm({ ...itemForm, minLimit: e.target.value })}
                    required
                    className="w-full bg-[#0A090C] border border-amber-500/40 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#659B5E]">Límite Máximo (Capacidad)</label>
                  <input
                    type="number"
                    placeholder="ej: 200"
                    value={itemForm.maxLimit}
                    onChange={e => setItemForm({ ...itemForm, maxLimit: e.target.value })}
                    required
                    className="w-full bg-[#0A090C] border border-[#659B5E]/40 rounded-xl px-4 py-2.5 text-[#F8FFE5] focus:outline-none focus:border-[#659B5E]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-400 hover:text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#D16014] hover:bg-[#b8510f] text-white font-extrabold shadow-lg cursor-pointer"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#001812] border border-[#659B5E]/50 rounded-3xl p-6 space-y-5 shadow-2xl text-xs">
            <h3 className="text-xl font-black">Registrar Nuevo Proveedor</h3>
            <form onSubmit={handleSaveSupplier} className="space-y-3">
              <input type="text" placeholder="Nombre de la empresa" value={supplierForm.nombre} onChange={event => setSupplierForm({ ...supplierForm, nombre: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" />
              <input type="text" placeholder="Contacto principal" value={supplierForm.contacto} onChange={event => setSupplierForm({ ...supplierForm, contacto: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" />
              <div className="grid grid-cols-2 gap-2"><input type="tel" placeholder="Teléfono" value={supplierForm.telefono} onChange={event => setSupplierForm({ ...supplierForm, telefono: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" /><input type="email" placeholder="Correo" value={supplierForm.email} onChange={event => setSupplierForm({ ...supplierForm, email: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" /></div>
              <input type="text" placeholder="Insumos suministrados" value={supplierForm.insumos} onChange={event => setSupplierForm({ ...supplierForm, insumos: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" />
              <select value={supplierForm.sede} onChange={event => setSupplierForm({ ...supplierForm, sede: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5"><option value="escazu">Escazú</option><option value="santa_ana">Santa Ana</option><option value="cartago">Cartago</option><option value="heredia">Heredia</option></select>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsSupplierModalOpen(false)} className="flex-1 py-2.5 bg-[#0A090C] rounded-xl text-gray-400 font-bold cursor-pointer">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#D16014] rounded-xl text-white font-extrabold cursor-pointer">Guardar Proveedor</button></div>
            </form>
          </div>
        </div>
      )}

      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#001812] border border-[#659B5E]/50 rounded-3xl p-6 space-y-5 shadow-2xl text-xs">
            <h3 className="text-xl font-black">Subir y Registrar Factura</h3>
            <form onSubmit={handleSaveInvoice} className="space-y-3">
              <input type="text" placeholder="Código / número de factura" value={invoiceForm.codigo} onChange={event => setInvoiceForm({ ...invoiceForm, codigo: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" />
              <input type="text" placeholder="Proveedor" value={invoiceForm.proveedor} onChange={event => setInvoiceForm({ ...invoiceForm, proveedor: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" />
              <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Monto total" value={invoiceForm.monto} onChange={event => setInvoiceForm({ ...invoiceForm, monto: event.target.value })} required className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" /><input type="date" value={invoiceForm.fecha} onChange={event => setInvoiceForm({ ...invoiceForm, fecha: event.target.value })} className="w-full bg-[#0A090C] border border-[#F8FFE5]/15 rounded-xl p-2.5" /></div>
              <label className="flex items-center gap-2 border border-dashed border-[#659B5E]/40 rounded-xl p-3 text-gray-400 cursor-pointer"><Paperclip className="w-4 h-4 text-[#659B5E]" />{invoiceForm.archivoNombre || 'Adjuntar PDF/XML (simulado)'}<input type="file" accept=".pdf,.xml" className="hidden" onChange={event => setInvoiceForm({ ...invoiceForm, archivoNombre: event.target.files[0]?.name || '' })} /></label>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="flex-1 py-2.5 bg-[#0A090C] rounded-xl text-gray-400 font-bold cursor-pointer">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#D16014] rounded-xl text-white font-extrabold cursor-pointer">Registrar Factura</button></div>
            </form>
          </div>
        </div>
      )}

      {showInactivityWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <section data-inactivity-dialog="true" role="dialog" aria-modal="true" aria-labelledby="inactivity-title" className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-5">
            <div className="flex items-center gap-3"><AlertCircle className="w-8 h-8 text-amber-400"/><h2 id="inactivity-title" className="text-lg font-black text-white">Aviso de Inactividad de Sesión</h2></div>
            <p className="text-sm text-zinc-300">Su sesión administrativa expirará en 60 segundos debido a inactividad por seguridad.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={resetInactivityTimer} className="flex-1 rounded-xl bg-[#659B5E] px-4 py-3 font-extrabold text-white">Mantener Sesión Activa</button>
              <button type="button" onClick={() => { logout(); navigate('/login'); }} className="flex-1 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 font-extrabold text-red-300">Cerrar Sesión Ahora</button>
            </div>
          </section>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#001812] border border-red-500/40 rounded-3xl p-6 space-y-5 text-center shadow-2xl text-xs text-[#F8FFE5]">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">¿Cerrar Sesión Operativa?</h3>
              <p className="text-gray-400">Se finalizará la sesión activa de administración general.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#0A090C] border border-[#F8FFE5]/15 text-gray-300 font-bold hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold shadow-lg cursor-pointer"
              >
                Sí, Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
