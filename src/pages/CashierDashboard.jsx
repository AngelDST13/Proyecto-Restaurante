import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FacturacionPanel from '../components/FacturacionPanel';
import Toast from '../components/Toast';
import { formatSedeName } from '../services/authSecurity';
import { getCashierOrders, recordCashierSale, removeCashierOrder } from '../services/cashierService';
import { CreditCard, LogOut, Receipt, Wallet } from 'lucide-react';

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'SINPE Móvil'];
const formatCurrency = amount => `₡${Number(amount || 0).toLocaleString('es-CR')}`;

export default function CashierDashboard() {
  const { user, logout } = useAuth();
  const sede = user?.sede || 'escazu';
  const sedeNombre = formatSedeName(sede);
  const [orders, setOrders] = useState(() => getCashierOrders(sede));
  const [paymentMethods, setPaymentMethods] = useState({});
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const refreshOrders = () => setOrders(getCashierOrders(sede));
    const handleStorage = event => {
      if (!event.key || event.key === 'cacique_cashier_orders') refreshOrders();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cacique-cashier-orders-updated', refreshOrders);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cacique-cashier-orders-updated', refreshOrders);
    };
  }, [sede]);

  const showToast = (message, type = 'success') => setToast({ show: true, message, type });

  const handleChargeOrder = order => {
    const paymentMethod = paymentMethods[order.id] || order.pago;
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
    setReceipt({ sale: result.sale, consecutive, key, supportUrl });
    setOrders(getCashierOrders(sede));
  };

  return (
    <main className="min-h-screen w-full bg-[#080A08] px-4 pb-12 pt-24 text-[#F8FFE5] sm:px-6">
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast(previous => ({ ...previous, show: false }))} />}
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#659B5E]/20 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Caja · {sedeNombre}</p>
            <h1 className="mt-1 text-2xl font-black text-white">Panel de Cajero</h1>
            <p className="mt-1 text-sm text-zinc-400">Turno de {user?.nombre || 'Cajero de turno'}</p>
          </div>
          <button type="button" onClick={logout} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-3 text-sm font-bold text-zinc-200 hover:border-rose-400/50 hover:text-rose-200">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </header>

        <section aria-labelledby="pending-cashier-orders" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="pending-cashier-orders" className="flex items-center gap-2 text-lg font-bold text-white"><CreditCard className="h-5 w-5 text-amber-400" />Comandas listas para cobrar</h2>
              <p className="mt-1 text-xs text-zinc-400">Cuentas enviadas desde las mesas de {sedeNombre}.</p>
            </div>
            <span className="text-sm font-bold text-amber-300">Pendientes: {orders.length}</span>
          </div>

          {orders.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-zinc-400">No hay cuentas pendientes de cobro.</p>
          ) : (
            <div className="divide-y divide-white/10 border-y border-white/10">
              {orders.map(order => (
                <article key={order.id} className="grid min-w-0 gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_13rem_auto] lg:items-center">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white">{order.mesa} <span className="font-normal text-zinc-400">· {order.cliente || 'Cliente de mesa'}</span></h3>
                    <p className="mt-1 break-words text-sm text-zinc-300">{order.descripcion}</p>
                    <p className="mt-1 text-xs text-zinc-500">IVA: {formatCurrency(order.iva)} · Servicio: {formatCurrency(order.servicio)}</p>
                  </div>
                  <label className="space-y-1 text-xs text-zinc-400">Forma de pago
                    <select aria-label={`Forma de pago ${order.mesa}`} value={paymentMethods[order.id] || order.pago} onChange={event => setPaymentMethods(previous => ({ ...previous, [order.id]: event.target.value }))} className="min-h-10 w-full rounded-lg border border-white/15 bg-[#0A090C] px-3 text-sm text-white">
                      {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                    </select>
                  </label>
                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <strong className="text-lg text-amber-300">{formatCurrency(order.total)}</strong>
                    <button type="button" onClick={() => handleChargeOrder(order)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#D16014] px-4 font-bold text-white hover:bg-[#b8510f]">
                      <Wallet className="h-4 w-4" /> Cobrar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {receipt && (
          <article id="cashier-invoice" aria-label="Factura electrónica de demostración" className="space-y-4 rounded-xl border border-amber-500/25 bg-white p-5 text-zinc-900 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-3">
              <div><h2 className="font-black">CHICHARRONERA EL CACIQUE</h2><p className="text-sm text-zinc-500">Factura de demostración · {sedeNombre}</p></div>
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
    </main>
  );
}