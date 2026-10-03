import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FacturacionPanel from '../components/FacturacionPanel';
import Toast from '../components/Toast';
import { caciqueAsset as caciqueIcon, logoDarkVariant as officialLogo } from '../assets/img';
import { formatSedeName } from '../services/authSecurity';
import { CASHIER_TABLE_COUNTS, getCashierOrders, getCashierState, recordCashierSale, removeCashierOrder } from '../services/cashierService';
import { CreditCard, LogOut, Receipt } from 'lucide-react';
import LogoutConfirmModal from '../components/LogoutConfirmModal';

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'SINPE Móvil'];
const formatCurrency = amount => `₡${Number(amount || 0).toLocaleString('es-CR')}`;

export default function CashierDashboard() {
  const { user, logout } = useAuth();
  const sede = user?.sede || 'escazu';
  const sedeNombre = formatSedeName(sede);
  const [orders, setOrders] = useState(() => getCashierOrders(sede));
  const [cashierState, setCashierState] = useState(() => getCashierState(sede));
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const refreshCashierData = () => {
      setOrders(getCashierOrders(sede));
      setCashierState(getCashierState(sede));
    };
    const handleStorage = event => {
      if (!event.key || event.key === 'cacique_cashier_orders' || event.key === `cacique_cashier_${sede}`) refreshCashierData();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cacique-cashier-orders-updated', refreshCashierData);
    window.addEventListener('cacique-cashier-state-updated', refreshCashierData);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cacique-cashier-orders-updated', refreshCashierData);
      window.removeEventListener('cacique-cashier-state-updated', refreshCashierData);
    };
  }, [sede]);

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const handleChargeOrder = (order, paymentOverride, issueElectronicInvoice = false) => {
    const paymentMethod = paymentOverride || order.pago;
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      showToast('Seleccione un método de pago válido.', 'error');
      return;
    }

    const issuedAt = new Date();
    const consecutive = `FE-${issuedAt.getFullYear()}-${String(issuedAt.getTime()).slice(-8)}`;
    const key = Array.from(crypto.getRandomValues(new Uint8Array(50)), byte => String(byte % 10)).join('');
    const supportUrl = `https://wa.me/50622008888?text=${encodeURIComponent(`Consulta sobre factura ${consecutive}`)}`;
    const result = recordCashierSale({
      sede,
      orderId: order.id,
      cliente: order.cliente,
      cedula: order.cedula,
      descripcion: order.descripcion,
      subtotal: order.subtotal,
      iva: order.iva,
      total: order.total,
      pago: paymentMethod,
      fecha: issuedAt.toISOString()
    });
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }

    if (!removeCashierOrder(order.id)) {
      showToast('El pago se registró; actualice la cola para sincronizar la cuenta.', 'error');
    } else {
      showToast(`Cuenta de ${order.mesa} cobrada y registrada en ${sedeNombre}.`, 'success');
    }
    setReceipt({ sale: result.sale, consecutive, key, supportUrl, issueElectronicInvoice });
    setOrders(getCashierOrders(sede));
    setCashierState(getCashierState(sede));
    setSelectedOrderId(null);
  };

  const sales = cashierState?.sales || [];
  const cashSales = sales.filter(sale => sale.pago === 'Efectivo').reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const cardSales = sales.filter(sale => sale.pago === 'Tarjeta').reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const sinpeSales = sales.filter(sale => sale.pago === 'SINPE Móvil').reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const cashMovements = (cashierState?.movements || []).reduce((sum, movement) => sum + (movement.tipo === 'Entrada' ? Number(movement.monto) : -Number(movement.monto)), 0);
  const cashExpenses = (cashierState?.expenses || []).filter(expense => expense.pagadoEfectivo).reduce((sum, expense) => sum + Number(expense.costo), 0);
  const expectedCash = Number(cashierState?.openingAmount || 0) + cashSales + cashMovements - cashExpenses;
  const selectedOrder = orders.find(order => order.id === selectedOrderId);
  const selectedOrderSeat = selectedOrder
    ? selectedOrder.mesa || `Mesa ${String(Number(selectedOrder.tableId) || 0).padStart(2, '0')}`
    : null;
  const tableCount = CASHIER_TABLE_COUNTS[sede] || CASHIER_TABLE_COUNTS.escazu;
  const orderByTable = new Map(orders.map(order => [Number(order.tableId), order]));
  const tableSeats = Array.from({ length: tableCount }, (_, index) => {
    const number = index + 1;
    return { number, order: orderByTable.get(number) };
  });

  return (
    <main className="min-h-screen w-full bg-linear-to-br from-[#001812] via-zinc-900 to-[#0A090C] px-4 pb-12 pt-24 text-[#F8FFE5] sm:px-6">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(previous => ({ ...previous, show: false }))} />}
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#659B5E]/30 bg-black/20 p-4 sm:p-5">
          <div>
            <div className="flex items-center gap-3">
              <img src={caciqueIcon} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = officialLogo; }} alt="Dibujo del Cacique" aria-label="Dibujo ilustrado del Cacique" className="h-14 w-14 shrink-0 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
              <div><span className="block text-base font-black leading-none tracking-wide text-amber-400">EL CACIQUE</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Chicharronera Gourmet</span></div>
              <div><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Sede activa · {sedeNombre}</p><h1 className="mt-1 text-2xl font-black text-white">Panel de Cajero</h1><p className="mt-1 text-sm text-zinc-400">Turno de {user?.nombre || 'Cajero de turno'}</p></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-bold ${cashierState?.cashOpen ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'}`}>{cashierState?.cashOpen ? 'Caja Abierta' : 'Caja Cerrada'}</span>
            <button type="button" onClick={() => setIsLogoutModalOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm font-bold text-zinc-200 hover:border-rose-400/50 hover:text-rose-200"><LogOut className="h-4 w-4" /> Cerrar sesión</button>
          </div>
        </header>

        <section aria-label="Ventas del día" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <CashierMetric label="Ventas en efectivo" value={cashSales} />
          <CashierMetric label="Ventas con tarjeta" value={cardSales} />
          <CashierMetric label="Ventas SINPE" value={sinpeSales} />
          <CashierMetric label="Efectivo esperado" value={expectedCash} />
        </section>

        <section aria-labelledby="cashier-table-map" className="space-y-4 rounded-2xl border border-[#659B5E]/30 bg-black/20 p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="cashier-table-map" className="flex items-center gap-2 text-lg font-bold text-white"><CreditCard className="h-5 w-5 text-amber-400" />Mapa de Mesas y Cuentas Activas</h2>
              <p className="mt-1 text-xs text-zinc-400">Selecciona una mesa ámbar con una precuenta pendiente para revisar la comanda.</p>
            </div>
            <span className="text-sm font-bold text-amber-300">{orders.length} cuentas pidiendo cobro</span>
          </div>
          {orders.length === 0 && <p className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-400">No hay cuentas pendientes de cobro.</p>}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10" role="group" aria-label={`Mesas de ${sedeNombre}`}>
            {tableSeats.map(({ number, order }) => {
              const seatLabel = order?.mesa || `Mesa ${String(number).padStart(2, '0')}`;
              const selected = selectedOrderId === order?.id;
              return <button key={number} type="button" aria-pressed={selected} aria-label={`${seatLabel}: ${order ? 'Pidiendo Cuenta' : 'Disponible'}`} onClick={() => {
                if (order) setSelectedOrderId(order.id);
                else { setSelectedOrderId(null); showToast(`${seatLabel} está disponible.`, 'info'); }
              }} className={`flex aspect-square min-w-0 flex-col items-center justify-center gap-1 rounded-xl border p-2 text-center transition-colors ${order ? `border-amber-400/50 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 ${selected ? 'ring-2 ring-amber-300' : ''}` : 'border-emerald-500/20 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40'}`}>
                <span className="wrap-break-word text-xs font-black">{seatLabel}</span><span className="text-[9px] leading-tight">{order ? (order.estado === 'consumo' ? 'En Consumo' : 'Pidiendo Cuenta') : 'Disponible / Libre'}</span>
              </button>;
            })}
          </div>
        </section>

        {selectedOrder && <section aria-label={`Comanda activa ${selectedOrderSeat}`} className="space-y-4 rounded-2xl border border-amber-400/30 bg-linear-to-br from-[#001812] via-zinc-900 to-[#0A090C] p-4 sm:p-5">
          <header className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-black text-white">{selectedOrderSeat} · {selectedOrder.cliente || 'Cliente de mesa'}</h2><p className="text-xs text-amber-300">Comanda activa · esperando cobro</p></div><strong className="text-lg text-amber-300">{formatCurrency(selectedOrder.total)}</strong></header>
          <div className="divide-y divide-white/10 border-y border-white/10">{(selectedOrder.items || []).map((item, index) => <div key={`${item.nombre}-${index}`} className="flex justify-between gap-4 py-2 text-sm"><span>{item.cantidad} × {item.nombre}</span><span>{formatCurrency(Number(item.precio) * Number(item.cantidad))}</span></div>)}</div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4"><p>Subtotal <strong className="block">{formatCurrency(selectedOrder.subtotal)}</strong></p><p>Servicio 10% <strong className="block">{formatCurrency(selectedOrder.servicio)}</strong></p><p>IVA 13% <strong className="block">{formatCurrency(selectedOrder.iva)}</strong></p><p>Total <strong className="block text-amber-300">{formatCurrency(selectedOrder.total)}</strong></p></div>
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
            <button type="button" onClick={() => handleChargeOrder(selectedOrder, selectedOrder.pago, true)} className="min-h-10 rounded-lg border border-amber-400/40 px-3 text-xs font-bold text-amber-200 hover:bg-amber-500/10">Emitir Factura Electrónica</button>
            {PAYMENT_METHODS.map(method => <button key={method} type="button" onClick={() => handleChargeOrder(selectedOrder, method)} className="min-h-10 rounded-lg bg-[#D16014] px-3 text-xs font-bold text-white hover:bg-[#b8510f]">Cobrar {method}</button>)}
          </div>
        </section>}

        {receipt && (
          <article id="cashier-invoice" aria-label="Factura electrónica de demostración" className="space-y-4 rounded-xl border border-amber-500/25 bg-white p-5 text-zinc-900 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-3">
              <div><h2 className="font-black">CHICHARRONERA EL CACIQUE</h2><p className="text-sm text-zinc-500">{receipt.issueElectronicInvoice ? 'Factura electrónica de demostración' : 'Recibo de caja'} · {sedeNombre}</p></div>
              <div className="text-right"><strong>{receipt.consecutive}</strong><p className="text-[10px] text-zinc-500">Clave de Hacienda de demostración</p><p className="break-all font-mono text-xs">{receipt.key}</p></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 text-sm"><p>Cliente: {receipt.sale?.cliente}</p><p>Forma de pago: {receipt.sale?.pago}</p><p>IVA 13%: {formatCurrency(receipt.sale?.iva)}</p><strong>Total: {formatCurrency(receipt.sale?.total)}</strong></div>
              <a href={receipt.supportUrl} target="_blank" rel="noreferrer" aria-label="Abrir soporte WhatsApp de la factura"><img className="h-28 w-28" alt="Código QR para soporte por WhatsApp" src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(receipt.supportUrl)}`} /></a>
            </div>
            <p className="text-xs text-zinc-500">Comprobante local de demostración; no sustituye la emisión autorizada por Hacienda.</p>
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 font-bold text-white print:hidden"><Receipt className="h-4 w-4" /> Imprimir factura</button>
          </article>
        )}

        <section aria-labelledby="petty-cash-title" className="space-y-3">
          <h2 id="petty-cash-title" className="text-lg font-bold text-white">Caja Chica y Arqueo</h2>
          <FacturacionPanel key={sede} sede={sede} sedeNombre={sedeNombre} responsable={user?.nombre || 'Cajero de turno'} />
        </section>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        description="Se finalizará la sesión activa del panel de caja."
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={() => { setIsLogoutModalOpen(false); logout(); }}
      />
    </main>
  );
}

function CashierMetric({ label, value }) {
  return <div className="rounded-xl border border-[#659B5E]/30 bg-black/20 p-3"><span className="text-xs text-zinc-400">{label}</span><strong className="mt-1 block text-lg font-black text-amber-300">{formatCurrency(value)}</strong></div>;
}