import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { decryptData, formatSedeName } from '../services/authSecurity';
import { subscribeToLiveEvents } from '../services/n8nService';
import Toast from '../components/Toast';
import { 
  Utensils, LogOut, Clock, DollarSign, Layers, Plus, Minus, ShoppingBag, Scissors, CreditCard, User,
  ShieldCheck, CheckCircle2, Search, AlertCircle, FileText, Send, Trash2, 
  Sparkles, Coffee, BellRing
} from 'lucide-react';

const READY_ORDERS_STORAGE_KEY = 'cacique_ready_order_notifications';

export default function WaiterDashboard() {
  const { user, logout } = useAuth();
  const [selectedFloor, setSelectedFloor] = useState('piso1');
  const [selectedTable, setSelectedTable] = useState(null);
  const [precuentaTable, setPrecuentaTable] = useState(null);
  const [splitCount, setSplitCount] = useState(2);
  const [showSplitPanel, setShowSplitPanel] = useState(false);
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [billingLegalName, setBillingLegalName] = useState('');
  const [businessActivityCode, setBusinessActivityCode] = useState('561001');
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');
  const [isElectronicInvoice, setIsElectronicInvoice] = useState(false);
  const [applyWelcomeDiscount, setApplyWelcomeDiscount] = useState(false);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [readyNotifications, setReadyNotifications] = useState([]);

  const handleLogout = () => {
    logout();
  };

  // Mesas por Piso
  const [tables, setTables] = useState({
    piso1: [
      { id: 1, numero: 'Mesa 01', capacidad: 4, estado: 'Libre', tiempo: '0 min' },
      { id: 2, numero: 'Mesa 02', capacidad: 2, estado: 'Ocupada', total: 18500, tiempo: '25 min' },
      { id: 3, numero: 'Mesa 03', capacidad: 6, estado: 'Libre', tiempo: '0 min' },
      { id: 4, numero: 'Mesa 04', capacidad: 4, estado: 'Cuenta', total: 24000, tiempo: '42 min' },
      { id: 5, numero: 'Mesa 05', capacidad: 8, estado: 'Reservada', tiempo: 'En espera' },
      { id: 6, numero: 'Mesa 06', capacidad: 2, estado: 'Libre', tiempo: '0 min' }
    ],
    piso2: [
      { id: 7, numero: 'Mesa T1', capacidad: 4, estado: 'Libre', tiempo: '0 min' },
      { id: 8, numero: 'Mesa T2', capacidad: 4, estado: 'Ocupada', total: 32000, tiempo: '15 min' },
      { id: 9, numero: 'Mesa T3', capacidad: 6, estado: 'Libre', tiempo: '0 min' },
      { id: 10, numero: 'Mesa T4', capacidad: 2, estado: 'Libre', tiempo: '0 min' }
    ]
  });

  // Catálogo Completo del POS
  const platillosMenu = [
    { id: 101, nombre: 'Chifrijo Especial de Paila', cat: 'bocas', precio: 6800, desc: 'Concha crocante, frijoles tiernos, arroz y pico de gallo.' },
    { id: 102, nombre: 'Vigorón Criollo (1kg)', cat: 'platos', precio: 14500, desc: 'Surtido de chicharrón con yuca al vapor y repollo.' },
    { id: 103, nombre: 'Costilla Cerdo a la Leña', cat: 'cortes', precio: 9200, desc: 'Costilla ahumada con leña de café y chimichurri.' },
    { id: 104, nombre: 'Cerveza Imperial Helada (350ml)', cat: 'bebidas', precio: 2200, desc: 'Cerveza nacional bien fría en vaso cervecero.' },
    { id: 105, nombre: 'Surtido Cacique Familiar', cat: 'platos', precio: 22500, desc: 'Chicharrones, yucas, plátanos maduros y frijoles.' },
    { id: 106, nombre: 'Ceviche de Tilapia Arreglado', cat: 'bocas', precio: 5500, desc: 'Con galletas soda, aguacate Hass y chile dulce.' },
    { id: 107, nombre: 'Refresco Natural de Cas (500ml)', cat: 'bebidas', precio: 1800, desc: 'Cas natural recién preparado con hielo.' }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const currentSede = user?.sede || 'escazu';
    const addNotification = event => {
      if (event.modulo !== 'PEDIDO_MENU' || event.accion !== 'NOTIFICAR_MESERO_LISTO' || event.sede !== currentSede) return;

      const notification = {
        id: event.id || `${event.orderId || 'pedido'}-${event.fechaEnvio || Date.now()}`,
        mesa: event.mesa || 'Mesa desconocida',
        orderId: event.orderId || 'ORD-100',
        sede: event.sede,
        hora: new Date(event.fechaEnvio || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setReadyNotifications(previous => {
        if (previous.some(item => item.id === notification.id || item.orderId === notification.orderId)) return previous;
        return [notification, ...previous];
      });
      showToast(`Cocina avisa: pedido de ${notification.mesa} listo para servir`, 'success');
    };

    const readPendingNotifications = () => {
      const notifications = JSON.parse(localStorage.getItem(READY_ORDERS_STORAGE_KEY) || '[]');
      const matchingNotifications = notifications
        .filter(notification => notification.sede === (user?.sede || 'escazu'))
        .sort((first, second) => second.createdAt - first.createdAt)
        .map(notification => ({
          ...notification,
          hora: new Date(notification.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

      setReadyNotifications(previous => {
        const knownIds = new Set(previous.map(item => item.id));
        return [...previous, ...matchingNotifications.filter(item => !knownIds.has(item.id))];
      });
    };

    readPendingNotifications();
    const unsubscribe = subscribeToLiveEvents(addNotification);
    window.addEventListener('storage', readPendingNotifications);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', readPendingNotifications);
    };
  }, [user?.sede]);

  const dismissReadyNotification = (notificationId) => {
    setReadyNotifications(previous => previous.filter(notification => notification.id !== notificationId));
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setCustomerName(table.clienteNombre || '');
    setCustomerEmail(table.clienteCorreo || '');
    setOrderItems([]);
    setOrderNote('');
  };

  const handleAssignCustomer = () => {
    if (!selectedTable || !customerName.trim()) {
      showToast('Seleccione una mesa e indique el nombre del cliente.', 'error');
      return;
    }

    const updatedTable = { ...selectedTable, clienteNombre: customerName.trim(), clienteCorreo: normalizedCustomerEmail || '' };
    setTables(previous => ({
      ...previous,
      [selectedFloor]: previous[selectedFloor].map(table => table.id === selectedTable.id ? updatedTable : table)
    }));
    setSelectedTable(updatedTable);
    showToast(`${customerName.trim()} asignado a ${selectedTable.numero}`, 'success');
  };

  const handleAddItemToOrder = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
    showToast(`${item.nombre} agregado`, 'info');
  };

  const handleQuantityChange = (id, delta) => {
    setOrderItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cantidad + delta;
        return newQty > 0 ? { ...item, cantidad: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemoveItem = (id) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  // Cálculo de Subtotal e Impuestos
  const subtotal = orderItems.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);
  const iva = Math.round(subtotal * 0.13);
  const servicio = Math.round(subtotal * 0.10);
  const totalGeneral = subtotal + iva + servicio;
  const totalItemsCount = orderItems.reduce((total, item) => total + item.cantidad, 0);

  const storedCustomers = decryptData(localStorage.getItem('cacique_registered_clients')) || {};
  const normalizedCustomerEmail = customerEmail.trim().toLowerCase();
  const registeredCustomer = normalizedCustomerEmail ? storedCustomers[normalizedCustomerEmail] : null;
  const welcomeCoupon = registeredCustomer?.coupon || (
    user?.rol === 'cliente' && user?.email?.toLowerCase() === normalizedCustomerEmail ? user.coupon : null
  );
  const welcomeCouponKey = welcomeCoupon && normalizedCustomerEmail
    ? `cacique_coupon_used_${normalizedCustomerEmail}_${welcomeCoupon.code}`
    : null;
  const welcomeCouponAvailable = Boolean(welcomeCoupon && welcomeCouponKey && !localStorage.getItem(welcomeCouponKey));
  const welcomeDiscountRate = welcomeCouponAvailable && applyWelcomeDiscount
    ? (welcomeCoupon.discountPercentage || 5) / 100
    : 0;
  const previousSubtotal = selectedTable?.subtotal ?? selectedTable?.total ?? 0;
  const receiptGrossSubtotal = previousSubtotal + subtotal;
  const discountAmount = Math.round(receiptGrossSubtotal * welcomeDiscountRate);
  const receiptSubtotal = receiptGrossSubtotal - discountAmount;
  const receiptIva = Math.round(receiptSubtotal * 0.13);
  const receiptService = Math.round(receiptSubtotal * 0.10);
  const receiptTotal = receiptSubtotal + receiptIva + receiptService;
  const discountedTotal = receiptTotal;
  const splitTotal = receiptTotal;
  const baseSplitAmount = Math.floor(splitTotal / splitCount);
  const splitRemainder = splitTotal % splitCount;

  const visibleTables = tables[selectedFloor].filter(table => {
    const query = tableSearchTerm.trim().toLowerCase();
    return !query || table.numero.toLowerCase().includes(query) || (table.clienteNombre || '').toLowerCase().includes(query);
  });

  const handleSendToKitchen = () => {
    if (!selectedTable || orderItems.length === 0) return;
    
    setTables(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor].map(t => 
        t.id === selectedTable.id
          ? {
              ...t,
              estado: 'Ocupada',
              total: totalGeneral,
              subtotal,
              iva,
              servicio,
              items: [...(t.items || []), ...orderItems],
              tiempo: 'Justo ahora'
            }
          : t
      )
    }));

    showToast(`Comanda enviada a Cocina para ${selectedTable.numero}`, 'success');
    setOrderItems([]);
    setOrderNote('');
    setSelectedTable(null);
  };

  const handleGenerarPrecuenta = (mesa) => {
    if (!mesa) {
      showToast('Por favor seleccione una mesa ocupada para generar la pre-cuenta.', 'error');
      return;
    }

    if (isElectronicInvoice && (!(billingLegalName.trim() || customerName.trim()) || !customerId.trim() || !businessActivityCode.trim() || !normalizedCustomerEmail)) {
      showToast('Para la factura electrónica en borrador, complete nombre o razón social, cédula, actividad económica y correo.', 'error');
      return;
    }

    setPrecuentaTable({
      ...mesa,
      subtotal: receiptSubtotal,
      subtotalBruto: receiptGrossSubtotal,
      iva: receiptIva,
      servicio: receiptService,
      total: receiptTotal,
      items: [...(mesa.items || []), ...orderItems],
      clienteNombre: customerName.trim() || mesa.clienteNombre || '',
      clienteCorreo: normalizedCustomerEmail,
      cedulaCliente: customerId.trim(),
      razonSocial: billingLegalName.trim(),
      codigoActividad: businessActivityCode.trim(),
      metodoPago: paymentMethod,
      tipoComprobante: isElectronicInvoice ? 'Factura electrónica (borrador)' : 'Pre-cuenta / tiquete',
      descuento: discountAmount,
      division: showSplitPanel ? Array.from({ length: splitCount }, (_, index) => baseSplitAmount + (index < splitRemainder ? 1 : 0)) : null
    });
    if (isElectronicInvoice && welcomeDiscountRate > 0 && welcomeCouponKey) {
      localStorage.setItem(welcomeCouponKey, 'used');
      setApplyWelcomeDiscount(false);
    }
    setTables(prev => ({
      ...prev,
      [selectedFloor]: prev[selectedFloor].map(t => 
        t.id === mesa.id ? { ...t, estado: 'Cuenta' } : t
      )
    }));
    showToast(`${isElectronicInvoice ? 'Borrador de factura' : 'Pre-cuenta'} generado para ${mesa.numero}`, 'info');
  };

  const formatCurrency = (amount) => `₡${amount.toLocaleString('es-CR')}`;

  const filteredMenu = platillosMenu.filter(p => {
    const matchesCat = activeCategory === 'todos' || p.cat === activeCategory;
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-[#07090E] text-[#F8FFE5] pt-20 pb-12 px-4 sm:px-6 font-sans">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {precuentaTable && (() => {
        const subtotalPrecuenta = precuentaTable.subtotal ?? precuentaTable.total ?? 0;
        const servicioPrecuenta = precuentaTable.servicio ?? Math.round(subtotalPrecuenta * 0.1);
        const ivaPrecuenta = precuentaTable.iva ?? Math.round(subtotalPrecuenta * 0.13);
        const totalPrecuenta = subtotalPrecuenta + servicioPrecuenta + ivaPrecuenta;
        const precuentaItems = precuentaTable.items || [];
        const precuentaItemsCount = precuentaItems.reduce((total, item) => total + item.cantidad, 0);

        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPrecuentaTable(null);
          }}>
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="precuenta-title"
              id="precuenta-print"
              className="w-full max-w-md rounded-2xl border border-[#659B5E]/50 bg-[#0A110D] p-6 text-[#F8FFE5] shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F8FFE5]/10 pb-4">
                <div>
                  <h2 id="precuenta-title" className="text-lg font-black text-white">{precuentaTable.tipoComprobante || 'Pre-cuenta'}</h2>
                  <p className="mt-1 text-xs text-gray-400">Chicharronera El Cacique</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrecuentaTable(null)}
                  className="rounded-lg px-3 py-1 text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar pre-cuenta"
                >
                  Cerrar
                </button>
              </div>

              <div className="mb-5 space-y-1 text-sm">
                <p><span className="text-gray-400">Mesa:</span> <strong>{precuentaTable.numero}</strong></p>
                <p><span className="text-gray-400">Sede:</span> {formatSedeName(user?.sede || 'escazu')}</p>
                {(precuentaTable.clienteNombre || precuentaTable.clienteCorreo) && <p><span className="text-gray-400">Cliente:</span> {precuentaTable.clienteNombre || precuentaTable.clienteCorreo}</p>}
                {precuentaTable.razonSocial && <p><span className="text-gray-400">Razón social:</span> {precuentaTable.razonSocial}</p>}
                {precuentaTable.cedulaCliente && <p><span className="text-gray-400">Cédula:</span> {precuentaTable.cedulaCliente}</p>}
                {precuentaTable.codigoActividad && <p><span className="text-gray-400">Actividad económica:</span> {precuentaTable.codigoActividad}</p>}
                {precuentaTable.clienteCorreo && <p><span className="text-gray-400">Correo:</span> {precuentaTable.clienteCorreo}</p>}
                <p><span className="text-gray-400">Forma de pago:</span> {precuentaTable.metodoPago}</p>
                <p><span className="text-gray-400">Estado:</span> Pendiente de pago</p>
              </div>

              <div className="space-y-3 border-y border-dashed border-[#F8FFE5]/20 py-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Ítems pedidos</span><span>{precuentaItemsCount}</span></div>
                {precuentaItems.map(item => (
                  <div key={item.id} className="flex justify-between gap-4 text-xs text-gray-400">
                    <span>{item.cantidad} × {item.nombre}</span>
                    <span>{formatCurrency(item.precio * item.cantidad)}</span>
                  </div>
                ))}
                <div className="flex justify-between"><span className="text-gray-400">Subtotal bruto</span><span>{formatCurrency(precuentaTable.subtotalBruto ?? subtotalPrecuenta)}</span></div>
                {precuentaTable.descuento > 0 && <div className="flex justify-between text-emerald-400"><span>Descuento registro (5%)</span><span>−{formatCurrency(precuentaTable.descuento)}</span></div>}
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{formatCurrency(subtotalPrecuenta)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Servicio (10%)</span><span>{formatCurrency(servicioPrecuenta)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">IVA (13%)</span><span>{formatCurrency(ivaPrecuenta)}</span></div>
                {precuentaTable.division?.map((amount, index) => (
                  <div key={index} className="flex justify-between text-xs text-emerald-400"><span>Parte {index + 1}</span><span>{formatCurrency(amount)}</span></div>
                ))}
                <div className="flex justify-between border-t border-[#F8FFE5]/10 pt-3 text-base font-black">
                  <span>Total a pagar</span><span className="text-[#D16014]">{formatCurrency(totalPrecuenta)}</span>
                </div>
              </div>

              {precuentaTable.tipoComprobante?.startsWith('Factura electrónica') && (
                <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-300">
                  Borrador local: requiere integración con un proveedor autorizado para su emisión ante Hacienda.
                </p>
              )}
              <p className="mt-5 text-center text-xs text-gray-400">Gracias por su visita.</p>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition-colors hover:bg-blue-500 print:hidden"
              >
                Imprimir comprobante
              </button>
              <style>{`@media print { body * { visibility: hidden !important; } #precuenta-print, #precuenta-print * { visibility: visible !important; } #precuenta-print { position: fixed; inset: 0; width: 100%; max-width: none; border: 0; box-shadow: none; background: white; color: black; } #precuenta-print p, #precuenta-print span, #precuenta-print h2 { color: black !important; } }`}</style>
            </section>
          </div>
        );
      })()}

      {readyNotifications.length > 0 && (
        <div className="fixed top-20 right-6 z-40 w-[calc(100%-3rem)] max-w-md space-y-3 pointer-events-auto">
          {readyNotifications.map(notification => (
            <div key={notification.id} className="rounded-2xl border-2 border-[#D16014] bg-[#001812]/95 p-4 text-[#F8FFE5] shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-[#D16014] p-2.5 text-white">
                    <BellRing className="h-6 w-6 animate-bounce" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black uppercase tracking-widest text-[#D16014]">
                      Pedido listo en cocina • {notification.hora}
                    </span>
                    <strong className="block truncate text-sm font-black text-white sm:text-base">
                      {notification.mesa} ({notification.orderId}) listo para servir en Sede {formatSedeName(notification.sede)}
                    </strong>
                  </div>
                </div>
                <button
                  onClick={() => {
                    dismissReadyNotification(notification.id);
                    showToast(`Servicio entregado a ${notification.mesa}`, 'success');
                  }}
                  className="shrink-0 rounded-xl bg-[#659B5E] px-3 py-2 text-[10px] font-black text-white shadow-lg transition-colors hover:bg-[#52824c] sm:px-5 sm:py-2.5 sm:text-xs"
                >
                  Confirmar Entrega
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ENCABEZADO TIPO TERMINAL POS EJECUTIVO */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0A110D] p-5 rounded-2xl border border-[#659B5E]/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D16014] to-[#B8510F] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#D16014]/40">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#659B5E]/20 text-[#659B5E] font-extrabold uppercase px-2 py-0.5 rounded-full border border-[#659B5E]/40">
                  Terminal POS Salón • {user?.nombre || 'Aiden Ruiz'}
                </span>
                <span className="text-xs text-gray-400 font-semibold">• Mesero de Turno</span>
              </div>
              <h1 className="text-xl font-black text-[#F8FFE5] mt-0.5">{user?.nombre || 'Aiden Ruiz'}</h1>
            </div>
          </div>

          {/* INDICADORES DE TURNO Y SEDE FIJA */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-2 bg-[#001812] px-3.5 py-2 rounded-xl border border-[#F8FFE5]/15 text-xs font-bold text-[#659B5E]">
              <ShieldCheck className="w-4 h-4 text-[#D16014]" />
              <span>Sede {formatSedeName(user?.sede || 'cartago')}</span>
            </div>

            <div className="flex items-center gap-2 bg-[#0A090C] px-3.5 py-2 rounded-xl border border-[#F8FFE5]/10 text-xs font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Turno Activo: 11:00 AM - 8:00 PM</span>
            </div>

            <button onClick={handleLogout} title="Cerrar Sesión" className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MÉTRICAS RÁPIDAS DEL SALÓN */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0A110D]/80 p-4 rounded-2xl border border-[#F8FFE5]/10 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">Mesas Ocupadas</span>
            <div className="text-2xl font-black text-amber-400 flex items-center justify-between">
              <span>2 / 10</span>
              <Utensils className="w-5 h-5 text-amber-500/40" />
            </div>
          </div>

          <div className="bg-[#0A110D]/80 p-4 rounded-2xl border border-[#F8FFE5]/10 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">Comandas en Cocina</span>
            <div className="text-2xl font-black text-blue-400 flex items-center justify-between">
              <span>3 Activas</span>
              <Clock className="w-5 h-5 text-blue-500/40" />
            </div>
          </div>

          <div className="bg-[#0A110D]/80 p-4 rounded-2xl border border-[#F8FFE5]/10 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">Facturación Turno</span>
            <div className="text-2xl font-black text-emerald-400 flex items-center justify-between">
              <span>₡74,500</span>
              <DollarSign className="w-5 h-5 text-emerald-500/40" />
            </div>
          </div>

          <div className="bg-[#0A110D]/80 p-4 rounded-2xl border border-[#F8FFE5]/10 space-y-1">
            <span className="text-[11px] text-gray-400 font-semibold block">Promedio Servicio</span>
            <div className="text-2xl font-black text-[#D16014] flex items-center justify-between">
              <span>15 min</span>
              <Sparkles className="w-5 h-5 text-[#D16014]/40" />
            </div>
          </div>
        </div>

        {/* GRID PRINCIPAL: PLANO DE MESAS Y CONSTRUCTOR DE COMANDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PLANO Y MATRIZ DE MESAS POR PISO (7 COLS) */}
          <div className="lg:col-span-7 space-y-4 bg-[#0A110D]/60 p-6 rounded-2xl border border-[#F8FFE5]/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#F8FFE5]/10 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D16014]" />
                <h3 className="font-bold text-base text-[#F8FFE5]">Plano de Salón por Pisos</h3>
              </div>
              
              {/* SELECTOR DE PISO */}
              <div className="flex bg-[#07090E] p-1 rounded-xl text-xs font-bold border border-[#F8FFE5]/10 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedFloor('piso1')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${selectedFloor === 'piso1' ? 'bg-[#D16014] text-white shadow-lg' : 'text-gray-400'}`}
                >
                  Piso 1 (Salón Principal)
                </button>
                <button
                  onClick={() => setSelectedFloor('piso2')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${selectedFloor === 'piso2' ? 'bg-[#D16014] text-white shadow-lg' : 'text-gray-400'}`}
                >
                  Piso 2 (Terraza)
                </button>
              </div>
            </div>

            {/* REJILLA INTERACTIVA DE MESAS */}
            <input
              type="search"
              value={tableSearchTerm}
              onChange={event => setTableSearchTerm(event.target.value)}
              placeholder="Buscar mesa o cliente asignado..."
              aria-label="Buscar por número de mesa o nombre de cliente"
              className="w-full rounded-xl border border-[#F8FFE5]/15 bg-[#07090E] px-3 py-2 text-xs text-[#F8FFE5] placeholder:text-gray-500 focus:border-[#D16014] focus:outline-none"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {visibleTables.map((table) => {
                const isSelected = selectedTable?.id === table.id;
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-40 ${
                      isSelected 
                        ? 'border-[#D16014] bg-[#D16014]/20 ring-2 ring-[#D16014] scale-[1.02]' 
                        : table.estado === 'Ocupada'
                        ? 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500'
                        : table.estado === 'Cuenta'
                        ? 'border-blue-500/50 bg-blue-500/10 hover:border-blue-500'
                        : table.estado === 'Reservada'
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-[#F8FFE5]/10 bg-[#07090E]/80 hover:border-[#659B5E]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black text-xl text-[#F8FFE5] block">{table.numero}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{table.capacidad} Personas</span>
                        {table.clienteNombre && <span className="mt-1 block max-w-28 truncate text-[10px] font-semibold text-[#659B5E]">{table.clienteNombre}</span>}
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{table.tiempo}</span>
                    </div>

                    <div className="space-y-1">
                      {table.total && (
                        <span className="text-xs font-black text-[#D16014] block">₡{table.total.toLocaleString()}</span>
                      )}
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          table.estado === 'Libre' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          table.estado === 'Ocupada' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          table.estado === 'Cuenta' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {table.estado === 'Libre' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {table.estado === 'Ocupada' && <Clock className="w-3 h-3 text-amber-400" />}
                          {table.estado === 'Cuenta' && <DollarSign className="w-3 h-3 text-blue-400" />}
                          {table.estado}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONSTRUCTOR DE COMANDA POS (5 COLS) */}
          <div className="lg:col-span-5 bg-[#0A110D]/90 p-6 rounded-2xl border border-[#F8FFE5]/15 space-y-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              
              <div className="flex justify-between items-center border-b border-[#F8FFE5]/10 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#D16014]" />
                  <h3 className="font-bold text-base text-[#F8FFE5]">Comanda en Vivo POS</h3>
                </div>
                {selectedTable ? (
                  <span className="px-3 py-1 bg-[#D16014] text-white font-black text-xs rounded-xl shadow-md">
                    {selectedTable.numero}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 italic">Seleccione mesa</span>
                )}
              </div>

              {selectedTable ? (
                <>
                  <div className="space-y-2 rounded-xl border border-[#F8FFE5]/10 bg-[#07090E] p-3">
                    <label htmlFor="table-customer-name" className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400"><User className="h-3.5 w-3.5" />Cliente asignado a {selectedTable.numero}</label>
                    <div className="flex gap-2">
                      <input
                        id="table-customer-name"
                        value={customerName}
                        onChange={event => setCustomerName(event.target.value)}
                        placeholder="Nombre del cliente"
                        className="min-w-0 flex-1 rounded-lg border border-[#F8FFE5]/15 bg-[#0A110D] px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-[#D16014] focus:outline-none"
                      />
                      <button type="button" onClick={handleAssignCustomer} className="rounded-lg bg-[#659B5E] px-3 py-2 text-[10px] font-bold text-white hover:bg-emerald-600">Asignar</button>
                    </div>
                  </div>

                  {/* BÚSQUEDA Y CATEGORÍAS DE MENÚ */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                      <input 
                        type="text" 
                        placeholder="Buscar platillo o bebida..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-[#07090E] border border-[#F8FFE5]/15 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F8FFE5] focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                      {['todos', 'bocas', 'platos', 'cortes', 'bebidas'].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-all whitespace-nowrap ${
                            activeCategory === cat ? 'bg-[#D16014] text-white' : 'bg-[#07090E] text-gray-400 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LISTA DE SELECCIÓN DE PLATILLOS */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                    {filteredMenu.map(p => (
                      <div key={p.id} className="p-2.5 bg-[#07090E] rounded-xl flex justify-between items-center border border-[#F8FFE5]/10 hover:border-[#D16014]/50 transition-all">
                        <div className="max-w-[200px]">
                          <span className="font-bold text-[#F8FFE5] block truncate">{p.nombre}</span>
                          <span className="text-[10px] text-[#D16014] font-bold">₡{p.precio.toLocaleString()}</span>
                        </div>
                        <button 
                          onClick={() => handleAddItemToOrder(p)} 
                          className="p-1.5 bg-[#D16014] text-white rounded-lg hover:bg-[#b8510f] transition-colors"
                          title="Agregar a comanda"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* ITEMS DE LA COMANDA ACTIVA */}
                  <div className="space-y-2 pt-3 border-t border-[#F8FFE5]/10">
                    <span className="text-xs font-bold text-gray-400 block">Ítems Seleccionados ({totalItemsCount}):</span>
                    
                    {orderItems.length === 0 ? (
                      <p className="text-xs text-gray-500 italic text-center py-4">No hay ítems agregados aún.</p>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                        {orderItems.map(item => (
                          <div key={item.id} className="p-2 bg-[#07090E]/60 rounded-xl flex items-center justify-between border border-[#F8FFE5]/5">
                            <div className="flex-1">
                              <span className="font-bold text-[#F8FFE5] block">{item.nombre}</span>
                              <span className="text-[10px] text-gray-400">₡{item.precio.toLocaleString()} c/u</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-[#001812] rounded-lg p-0.5 border border-[#F8FFE5]/10">
                                <button onClick={() => handleQuantityChange(item.id, -1)} className="p-1 text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                                <span className="font-black text-[#F8FFE5] px-1 text-xs">{item.cantidad}</span>
                                <button onClick={() => handleQuantityChange(item.id, 1)} className="p-1 text-gray-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                              </div>
                              <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* NOTAS DE COCINA */}
                    <input 
                      type="text"
                      placeholder="Nota especial para cocina (ej: bien cocido, sin cebolla)..."
                      value={orderNote}
                      onChange={e => setOrderNote(e.target.value)}
                      className="w-full bg-[#07090E] border border-[#F8FFE5]/10 rounded-xl px-3 py-1.5 text-xs text-[#F8FFE5] focus:outline-none"
                    />
                  </div>

                  {/* DESGLOSE FINANCIERO CON IVA Y SERVICIO */}
                  {orderItems.length > 0 && (
                    <div className="bg-[#07090E] p-3 rounded-xl space-y-1.5 text-xs font-semibold border border-[#F8FFE5]/10">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal:</span>
                        <span>₡{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>IVA (13%):</span>
                        <span>₡{iva.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Servicio (10%):</span>
                        <span>₡{servicio.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#F8FFE5] font-black text-sm pt-1 border-t border-[#F8FFE5]/10">
                        <span>Total Comanda:</span>
                        <span className="text-[#D16014]">₡{totalGeneral.toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 rounded-xl border border-[#F8FFE5]/10 bg-[#07090E] p-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="col-span-2 space-y-1 text-gray-400">
                        <span>Correo del cliente (validar cupón de registro)</span>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={event => { setCustomerEmail(event.target.value); setApplyWelcomeDiscount(false); }}
                          placeholder="cliente@correo.com"
                          className="w-full rounded-lg border border-[#F8FFE5]/15 bg-[#0A110D] px-2.5 py-2 text-white placeholder:text-gray-500 focus:border-[#D16014] focus:outline-none"
                        />
                      </label>
                      <label className="col-span-2 space-y-1 text-gray-400">
                        <span>Cédula física o jurídica</span>
                        <input
                          value={customerId}
                          onChange={event => setCustomerId(event.target.value)}
                          placeholder="Identificación del cliente"
                          className="w-full rounded-lg border border-[#F8FFE5]/15 bg-[#0A110D] px-2.5 py-2 text-white placeholder:text-gray-500 focus:border-[#D16014] focus:outline-none"
                        />
                      </label>
                    </div>

                    <label className="flex items-center justify-between gap-3 text-gray-300">
                      <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" />Forma de pago</span>
                      <select value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} className="rounded-lg border border-[#F8FFE5]/15 bg-[#0A110D] px-2 py-2 text-white">
                        <option>Efectivo</option>
                        <option>Tarjeta</option>
                        <option>Sinpe Móvil</option>
                      </select>
                    </label>

                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" checked={isElectronicInvoice} onChange={event => setIsElectronicInvoice(event.target.checked)} className="accent-amber-500" />
                      Factura electrónica (borrador imprimible)
                    </label>

                    {isElectronicInvoice && (
                      <div className="space-y-2 border-t border-[#F8FFE5]/10 pt-2">
                        <label className="block space-y-1 text-gray-400">
                          <span>Nombre o razón social *</span>
                          <input value={billingLegalName} onChange={event => setBillingLegalName(event.target.value)} placeholder="Nombre registrado del cliente" className="w-full rounded-lg border border-[#F8FFE5]/15 bg-[#0A110D] px-2.5 py-2 text-white placeholder:text-gray-500 focus:border-[#D16014] focus:outline-none" />
                        </label>
                        <label className="block space-y-1 text-gray-400">
                          <span>Código de actividad económica *</span>
                          <input value={businessActivityCode} onChange={event => setBusinessActivityCode(event.target.value)} className="w-full rounded-lg border border-[#F8FFE5]/15 bg-[#0A110D] px-2.5 py-2 text-white focus:border-[#D16014] focus:outline-none" />
                        </label>
                      </div>
                    )}

                    {welcomeCouponAvailable ? (
                      <label className="flex items-center gap-2 text-emerald-300">
                        <input type="checkbox" checked={applyWelcomeDiscount} onChange={event => setApplyWelcomeDiscount(event.target.checked)} className="accent-emerald-500" />
                        Aplicar cupón de bienvenida ({welcomeCoupon.discountPercentage || 5}%)
                      </label>
                    ) : (
                      <p className="text-[10px] text-gray-500">Sin cupón de bienvenida válido para este correo.</p>
                    )}

                    {applyWelcomeDiscount && welcomeCouponAvailable && (
                      <div className="space-y-1 border-t border-[#F8FFE5]/10 pt-2">
                        <div className="flex justify-between text-gray-400"><span>Descuento aplicado</span><span>−{formatCurrency(discountAmount)}</span></div>
                        <div className="flex justify-between font-bold text-amber-400"><span>Total con descuento e impuestos</span><span>{formatCurrency(discountedTotal)}</span></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-xs text-gray-500 space-y-3">
                  <AlertCircle className="w-10 h-10 mx-auto text-gray-600" />
                  <p className="max-w-[220px] mx-auto">Selecciona una mesa en el plano para iniciar o editar su comanda.</p>
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            {selectedTable && (
              <div className="space-y-2 pt-2 border-t border-[#F8FFE5]/10">
                <button
                  type="button"
                  onClick={() => setShowSplitPanel(open => !open)}
                  className="w-full py-2.5 rounded-xl bg-[#07090E] border border-amber-500/30 text-amber-400 font-bold text-xs transition-all hover:bg-amber-500/10"
                >
                  <span className="inline-flex items-center justify-center gap-2"><Scissors className="h-3.5 w-3.5" />{showSplitPanel ? 'Ocultar división' : `Dividir cuenta (${splitCount} personas)`}</span>
                </button>

                {showSplitPanel && (
                  <div className="space-y-3 rounded-xl border border-amber-500/30 bg-[#07090E] p-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-300">Personas</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setSplitCount(count => Math.max(2, count - 1))} disabled={splitCount <= 2} className="h-7 w-7 rounded-lg bg-[#0A110D] font-bold text-white disabled:opacity-40" aria-label="Una persona menos">−</button>
                        <span className="min-w-5 text-center font-black text-amber-400">{splitCount}</span>
                        <button type="button" onClick={() => setSplitCount(count => count + 1)} className="h-7 w-7 rounded-lg bg-[#0A110D] font-bold text-white" aria-label="Una persona más">+</button>
                      </div>
                    </div>
                    <div className="space-y-1 border-t border-[#F8FFE5]/10 pt-2">
                      {Array.from({ length: splitCount }, (_, index) => (
                        <div key={index} className="flex justify-between font-bold">
                          <span className="text-gray-300">Persona {index + 1}</span>
                          <span className="text-emerald-400">{formatCurrency(baseSplitAmount + (index < splitRemainder ? 1 : 0))}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-500">Total dividido: {formatCurrency(splitTotal)}</p>
                  </div>
                )}

                <button
                  onClick={handleSendToKitchen}
                  disabled={orderItems.length === 0}
                  className="w-full py-3 rounded-xl bg-[#D16014] disabled:opacity-30 text-white font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#b8510f] transition-all shadow-lg shadow-[#D16014]/20"
                >
                  <Send className="w-4 h-4" /> Despachar Comanda a Cocina
                </button>

                {selectedTable.estado === 'Ocupada' && (
                  <button
                    onClick={() => handleGenerarPrecuenta(selectedTable)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                  >
                    <FileText className="w-4 h-4" /> {isElectronicInvoice ? 'Generar Factura (borrador)' : 'Generar Pre-cuenta'}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
