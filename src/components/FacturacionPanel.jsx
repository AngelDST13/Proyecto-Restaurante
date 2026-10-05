import { useMemo, useState } from 'react';
import { PackagePlus, Printer, Receipt, Upload, Wallet } from 'lucide-react';
import { logoDarkVariant as officialLogo } from '../assets/img';
import { createXlsxBlob, downloadBlob, parseCsv, parseXlsx, readFileBuffer, readFileText, rowsToCsv, sanitizeImportedValue, sanitizePlainText } from '../services/spreadsheetService';

const WHATSAPP = 'https://wa.me/50622008888';
const STORAGE_PREFIX = 'cacique_cashier_';

function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

export default function FacturacionPanel({ sede = 'escazu', sedeNombre = 'Escazú', inventory = [], onPurchase = () => {}, responsable = 'Cajero de turno' }) {
  const storageKey = `${STORAGE_PREFIX}${sede}`;
  const savedState = useMemo(() => readStored(storageKey) || {}, [storageKey]);
  const [openingAmount, setOpeningAmount] = useState(savedState.openingAmount || '');
  const [cashOpen, setCashOpen] = useState(Boolean(savedState.cashOpen));
  const [sales, setSales] = useState(savedState.sales || []);
  const [movements, setMovements] = useState(savedState.movements || []);
  const [expenses, setExpenses] = useState(savedState.expenses || []);
  const [financeImports, setFinanceImports] = useState(savedState.financeImports || []);
  const [cashierName, setCashierName] = useState(savedState.cashierName || responsable);
  const [openedAt, setOpenedAt] = useState(savedState.openedAt || '');
  const [openedAtLabel, setOpenedAtLabel] = useState(savedState.openedAtLabel || savedState.openedAt || '');
  const [countedAmount, setCountedAmount] = useState(savedState.countedAmount ?? '');
  const [lastInvoice, setLastInvoice] = useState(null);
  const [saleForm, setSaleForm] = useState({ cliente: '', cedula: '', descripcion: '', subtotal: '', pago: 'Efectivo' });
  const [movementForm, setMovementForm] = useState({ tipo: 'Entrada', monto: '', nota: '' });
  const [purchaseForm, setPurchaseForm] = useState({ insumo: '', cantidad: '', costo: '' });
  const [error, setError] = useState('');

  const persist = (next) => localStorage.setItem(storageKey, JSON.stringify(next));
  const cashSales = sales.filter(sale => sale.pago === 'Efectivo').reduce((total, sale) => total + sale.total, 0);
  const cashMovements = movements.reduce((total, movement) => total + (movement.tipo === 'Entrada' ? movement.monto : -movement.monto), 0);
  const cashExpenses = expenses.filter(expense => expense.pagadoEfectivo).reduce((total, expense) => total + expense.costo, 0);
  const cashBalance = Number(openingAmount || 0) + cashSales + cashMovements - cashExpenses;
  const invoiceSubtotal = Number(saleForm.subtotal) || 0;
  const invoiceIva = Math.round(invoiceSubtotal * 0.13);
  const invoiceTotal = invoiceSubtotal + invoiceIva;

  const updatePersistedState = (updates) => {
    const next = { openingAmount, cashOpen, sales, movements, expenses, financeImports, cashierName, openedAt, openedAtLabel, countedAmount, ...updates };
    setOpeningAmount(String(next.openingAmount ?? ''));
    setCashOpen(Boolean(next.cashOpen));
    setSales(next.sales);
    setMovements(next.movements);
    setExpenses(next.expenses);
    setFinanceImports(next.financeImports);
    setCashierName(next.cashierName);
    setOpenedAt(next.openedAt);
    setOpenedAtLabel(next.openedAtLabel);
    setCountedAmount(next.countedAmount);
    persist(next);
  };

  const openCash = (event) => {
    event.preventDefault();
    const amount = Number(openingAmount);
    if (!Number.isFinite(amount) || amount < 0) { setError('Ingrese un monto inicial válido.'); return; }
    const cleanCashierName = sanitizePlainText(cashierName);
    if (!cleanCashierName) { setError('Ingrese el nombre de la persona responsable de la caja.'); return; }
    const openingDate = new Date();
    const openingTime = openingDate.toISOString();
    const openingTimeLabel = openingDate.toLocaleString('es-CR');
    setError('');
    setOpenedAt(openingTime);
    setOpenedAtLabel(openingTimeLabel);
    updatePersistedState({ openingAmount: amount, cashOpen: true, cashierName: cleanCashierName, openedAt: openingTime, openedAtLabel: openingTimeLabel, countedAmount: '' });
  };

  const registerSale = (event) => {
    event.preventDefault();
    const subtotal = Number(saleForm.subtotal);
    const iva = Math.round(subtotal * 0.13);
    const total = subtotal + iva;
    if (!cashOpen) { setError('Abra la caja antes de registrar ventas.'); return; }
    if (!saleForm.cliente.trim() || !saleForm.cedula.trim() || !saleForm.descripcion.trim() || !Number.isFinite(subtotal) || subtotal <= 0) { setError('Complete cliente, cédula, detalle y subtotal válido.'); return; }
    const issuedAt = new Date();
    const sale = { id: crypto.randomUUID(), cliente: sanitizePlainText(saleForm.cliente), cedula: sanitizePlainText(saleForm.cedula), descripcion: sanitizePlainText(saleForm.descripcion), subtotal, iva, total, pago: saleForm.pago, fecha: issuedAt.toISOString() };
    const nextSales = [sale, ...sales];
    updatePersistedState({ sales: nextSales });
    const consecutive = `FE-${issuedAt.getFullYear()}-${String(nextSales.length).padStart(6, '0')}`;
    const numericKey = Array.from(crypto.getRandomValues(new Uint8Array(50)), byte => String(byte % 10)).join('');
    const supportUrl = `${WHATSAPP}?text=${encodeURIComponent(`Consulta sobre factura ${consecutive}`)}`;
    setLastInvoice({ ...sale, consecutive, key: numericKey, supportUrl, issuedAtLabel: issuedAt.toLocaleString('es-CR') });
    setSaleForm({ cliente: '', cedula: '', descripcion: '', subtotal: '', pago: 'Efectivo' });
    setError('');
  };

  const registerMovement = (event) => {
    event.preventDefault();
    const monto = Number(movementForm.monto);
    if (!cashOpen || !Number.isFinite(monto) || monto <= 0 || !movementForm.nota.trim()) { setError('Abra la caja y complete monto y motivo del movimiento.'); return; }
    updatePersistedState({ movements: [{ ...movementForm, nota: sanitizePlainText(movementForm.nota), monto, id: crypto.randomUUID() }, ...movements] });
    setMovementForm({ tipo: 'Entrada', monto: '', nota: '' });
    setError('');
  };

  const registerPurchase = (event) => {
    event.preventDefault();
    const cantidad = Number(purchaseForm.cantidad);
    const costo = Number(purchaseForm.costo);
    if (!purchaseForm.insumo.trim() || cantidad <= 0 || costo <= 0) { setError('Complete insumo, cantidad y costo de compra.'); return; }
    const expense = { id: crypto.randomUUID(), insumo: sanitizePlainText(purchaseForm.insumo), cantidad, costo, pagadoEfectivo: cashOpen, fecha: new Date().toISOString() };
    updatePersistedState({ expenses: [expense, ...expenses] });
    onPurchase({ ...expense, sede });
    setPurchaseForm({ insumo: '', cantidad: '', costo: '' });
    setError('');
  };

  const closeCash = () => {
    if (!cashOpen) { setError('La caja ya está cerrada.'); return; }
    const counted = Number(countedAmount);
    if (!Number.isFinite(counted) || counted < 0 || countedAmount === '') { setError('Ingrese un monto contado válido para cerrar la caja.'); return; }
    const grossSales = sales.reduce((total, sale) => total + Number(sale.total || 0), 0);
    const retainedVat = sales.reduce((total, sale) => total + Number(sale.iva || 0), 0);
    const difference = counted - cashBalance;
    updatePersistedState({ cashOpen: false, countedAmount: counted, closedAt: new Date().toISOString() });
    setError(`Cierre registrado. Responsable: ${cashierName}. Ventas brutas: ₡${grossSales.toLocaleString('es-CR')}; IVA 13%: ₡${retainedVat.toLocaleString('es-CR')}; efectivo esperado: ₡${cashBalance.toLocaleString('es-CR')}; contado: ₡${counted.toLocaleString('es-CR')}; diferencia: ₡${difference.toLocaleString('es-CR')}.`);
  };

  const exportCashReport = format => {
    const rows = [
      ...sales.map(sale => ({ sede: sedeNombre, periodo: sale.fecha.slice(0, 7), fecha: sale.fecha, tipo: 'Venta', ventas: sale.total, costos: 0, pago: sale.pago, detalle: sale.descripcion })),
      ...expenses.map(expense => ({ sede: sedeNombre, periodo: expense.fecha.slice(0, 7), fecha: expense.fecha, tipo: 'Compra / costo', ventas: 0, costos: expense.costo, pago: expense.pagadoEfectivo ? 'Efectivo' : 'Otro', detalle: expense.insumo })),
      ...financeImports.map(row => ({ ...row, fecha: '', tipo: 'Importación', pago: '', detalle: '' }))
    ];
    const headers = ['sede', 'periodo', 'fecha', 'tipo', 'ventas', 'costos', 'pago', 'detalle'];
    const blob = format === 'xlsx'
      ? createXlsxBlob(rows.length ? rows : [Object.fromEntries(headers.map(header => [header, '']))], headers)
      : new Blob([format === 'csv' ? rowsToCsv(rows, headers) : JSON.stringify({ sede, periodo: 'todos', ventas: rows.filter(row => row.tipo === 'Venta').reduce((sum, row) => sum + row.ventas, 0), costos: rows.reduce((sum, row) => sum + row.costos, 0), movimientos: rows }, null, 2)], { type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
    downloadBlob(blob, `Caja_${sede}_${format}.${format}`);
  };

  const importCashReport = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('El archivo supera el límite de 5 MB.');
      const extension = file.name.split('.').pop().toLocaleLowerCase();
      const rows = extension === 'csv'
        ? parseCsv(await readFileText(file))
        : extension === 'xlsx'
          ? await parseXlsx(await readFileBuffer(file))
          : (() => { throw new Error('Formato no compatible. Seleccione CSV o XLSX.'); })();
      if (rows.length > 5000) throw new Error('El archivo supera el límite de 5.000 filas.');
      const normalized = rows.map((row, index) => {
        const values = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.trim().toLocaleLowerCase(), value]));
        const branch = sanitizePlainText(values.sede);
        const period = sanitizeImportedValue(values.periodo);
        const salesTotal = Number(sanitizeImportedValue(values.ventas));
        const costTotal = Number(sanitizeImportedValue(values.costos));
        if (!branch || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period) || !Number.isFinite(salesTotal) || salesTotal < 0 || !Number.isFinite(costTotal) || costTotal < 0) {
          throw new Error(`Fila ${index + 2}: sede, periodo, ventas o costos no válidos.`);
        }
        return { sede: branch, periodo: period, ventas: salesTotal, costos: costTotal };
      });
      updatePersistedState({ financeImports: [...financeImports, ...normalized] });
      setError(`${normalized.length} registros financieros importados y validados.`);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'No se pudo importar el archivo financiero.');
    } finally {
      event.target.value = '';
    }
  };

  const fieldClass = 'min-w-0 w-full rounded-xl border border-[#659B5E]/25 bg-[#0A090C] px-3 py-2.5 text-[#F8FFE5] placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none';
  const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#D16014] px-4 py-2.5 font-bold text-white hover:bg-[#b8510f] disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <section className="min-w-0 w-full max-w-full space-y-6 overflow-hidden rounded-3xl border border-[#659B5E]/30 bg-linear-to-br from-[#001812] via-zinc-900 to-[#0A090C] light:from-[#F5EFE6] light:via-[#F0E8DF] light:to-[#E8DFD8] p-4 shadow-2xl sm:p-6" aria-labelledby="cashier-title">
      <header className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-b border-[#659B5E]/20 pb-4">
        <div className="min-w-0"><h2 id="cashier-title" className="flex flex-wrap items-center gap-2 text-lg font-black text-white"><Wallet className="h-5 w-5 shrink-0 text-amber-400"/>Facturación, POS y Caja Chica</h2><p className="mt-1 text-xs text-zinc-400">Arqueo Financiero Diario de Caja · movimientos de {sedeNombre}; guardado local en este dispositivo.</p></div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cashOpen ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-zinc-600 bg-zinc-800 text-zinc-300'}`}>{cashOpen ? 'Caja abierta' : 'Caja cerrada'}</span>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Monto inicial" amount={Number(openingAmount || 0)} />
        <Metric label="Ventas efectivo" amount={cashSales} />
        <Metric label="Entradas / salidas" amount={cashMovements} />
        <Metric label="Arqueo de efectivo" amount={cashBalance} />
      </div>

      {!cashOpen && <form onSubmit={openCash} className="grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-[#659B5E]/20 bg-black/20 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="min-w-0 space-y-1 text-xs text-zinc-300">Responsable de caja<input aria-label="Responsable de caja" className={fieldClass} value={cashierName} onChange={event => setCashierName(event.target.value)} placeholder="Nombre del cajero" /></label>
        <label className="min-w-0 space-y-1 text-xs text-zinc-300">Monto inicial de caja<input aria-label="Monto inicial" className={fieldClass} min="0" type="number" value={openingAmount} onChange={event => setOpeningAmount(event.target.value)} placeholder="₡ 0"/></label>
        <button className={`${actionClass} self-end`} type="submit"><Wallet className="h-4 w-4"/>Abrir caja</button>
      </form>}
      {cashOpen && <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-xs text-zinc-300"><span>Responsable: <strong className="text-white">{cashierName}</strong></span><span>Apertura: <time dateTime={openedAt}>{openedAtLabel || 'Hora no registrada'}</time></span></div>}

      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <form onSubmit={registerSale} className="min-w-0 space-y-3 rounded-2xl border border-[#659B5E]/20 bg-black/20 p-4">
          <h3 className="font-bold text-white">Registrar venta y emitir factura</h3>
          <input required className={fieldClass} aria-label="Cliente de venta" placeholder="Nombre del cliente" value={saleForm.cliente} onChange={event => setSaleForm({ ...saleForm, cliente: event.target.value })}/>
          <input required className={fieldClass} aria-label="Cédula del cliente" placeholder="Cédula física o jurídica" value={saleForm.cedula} onChange={event => setSaleForm({ ...saleForm, cedula: event.target.value })}/>
          <textarea required rows="2" className={fieldClass} aria-label="Detalle de venta" placeholder="Ítems: producto, cantidad y precio" value={saleForm.descripcion} onChange={event => setSaleForm({ ...saleForm, descripcion: event.target.value })}/>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"><input required className={fieldClass} aria-label="Subtotal de venta" type="number" min="1" placeholder="Subtotal sin IVA" value={saleForm.subtotal} onChange={event => setSaleForm({ ...saleForm, subtotal: event.target.value })}/><select className={fieldClass} aria-label="Método de pago" value={saleForm.pago} onChange={event => setSaleForm({ ...saleForm, pago: event.target.value })}><option>Efectivo</option><option>Tarjeta</option><option>SINPE Móvil</option></select></div>
          <div className="flex flex-wrap justify-between gap-2 rounded-xl border border-[#659B5E]/20 bg-black/20 p-3 text-sm"><span>Subtotal: ₡{invoiceSubtotal.toLocaleString('es-CR')}</span><span>IVA 13%: ₡{invoiceIva.toLocaleString('es-CR')}</span><strong className="text-amber-300">Total: ₡{invoiceTotal.toLocaleString('es-CR')}</strong></div>
          <button type="submit" className={actionClass}><Receipt className="h-4 w-4"/>Registrar venta</button>
        </form>

        <div className="min-w-0 space-y-4 rounded-2xl border border-[#659B5E]/20 bg-black/20 p-4">
          <form onSubmit={registerMovement} className="space-y-3">
            <h3 className="font-bold text-white">Entradas y salidas de efectivo</h3>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3"><select className={fieldClass} aria-label="Tipo de movimiento" value={movementForm.tipo} onChange={event => setMovementForm({ ...movementForm, tipo: event.target.value })}><option>Entrada</option><option>Salida</option></select><input className={fieldClass} aria-label="Monto del movimiento" type="number" min="1" placeholder="Monto" value={movementForm.monto} onChange={event => setMovementForm({ ...movementForm, monto: event.target.value })}/><input className={fieldClass} aria-label="Motivo del movimiento" placeholder="Motivo" value={movementForm.nota} onChange={event => setMovementForm({ ...movementForm, nota: event.target.value })}/></div>
            <button type="submit" className="min-h-11 rounded-xl border border-[#659B5E]/30 px-4 py-2 font-bold text-[#9ad090] hover:bg-[#659B5E]/10">Registrar movimiento</button>
          </form>
          <form onSubmit={registerPurchase} className="space-y-3 border-t border-[#659B5E]/20 pt-4">
            <h3 className="flex items-center gap-2 font-bold text-white"><PackagePlus className="h-4 w-4 text-amber-400"/>Compra / gasto e inventario</h3>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3"><input className={fieldClass} aria-label="Insumo comprado" list="inventory-items" placeholder="Insumo" value={purchaseForm.insumo} onChange={event => setPurchaseForm({ ...purchaseForm, insumo: event.target.value })}/><datalist id="inventory-items">{inventory.map(item => <option key={item.id} value={item.nombre}/>)}</datalist><input className={fieldClass} aria-label="Cantidad comprada" type="number" min="0.01" step="0.01" placeholder="Cantidad" value={purchaseForm.cantidad} onChange={event => setPurchaseForm({ ...purchaseForm, cantidad: event.target.value })}/><input className={fieldClass} aria-label="Costo de compra" type="number" min="1" placeholder="Costo ₡" value={purchaseForm.costo} onChange={event => setPurchaseForm({ ...purchaseForm, costo: event.target.value })}/></div>
            <button type="submit" className="min-h-11 rounded-xl border border-amber-500/30 px-4 py-2 font-bold text-amber-300 hover:bg-amber-500/10">Registrar compra</button>
          </form>
        </div>
      </div>

      {error && <p role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-200">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-white">Ventas recientes ({sales.length})</h3><p className="mt-1 text-xs text-zinc-400">Registros financieros importados: {financeImports.length}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => exportCashReport('csv')} className="min-h-10 rounded-lg border border-white/15 px-3 font-bold text-zinc-200">Exportar CSV</button><button type="button" onClick={() => exportCashReport('xlsx')} className="min-h-10 rounded-lg border border-white/15 px-3 font-bold text-emerald-200">Exportar Excel</button><button type="button" onClick={() => exportCashReport('json')} className="min-h-10 rounded-lg border border-white/15 px-3 font-bold text-amber-200">Exportar JSON</button><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-amber-500/25 px-3 font-bold text-amber-200 hover:bg-amber-500/10"><Upload className="h-4 w-4"/>Importar CSV / Excel<input aria-label="Importar archivo financiero" type="file" accept=".csv,.xlsx" onChange={importCashReport} className="sr-only"/></label>{cashOpen && <><input aria-label="Dinero contado al cierre" className="min-h-10 w-40 rounded-lg border border-white/15 bg-[#0A090C] px-3" type="number" min="0" value={countedAmount} onChange={event => setCountedAmount(event.target.value)} placeholder="Efectivo contado ₡"/><button type="button" onClick={closeCash} className="min-h-11 rounded-xl border border-red-400/30 px-4 py-2 font-bold text-red-300 hover:bg-red-500/10">Cerrar caja y registrar arqueo</button></>}</div></div>
      <div className="w-full max-w-full overflow-x-auto rounded-xl border border-[#659B5E]/20"><table className="w-full min-w-150 text-left text-sm"><thead className="bg-black/30 text-zinc-300"><tr><th className="p-3">Cliente</th><th className="p-3">Detalle</th><th className="p-3">Pago</th><th className="p-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-white/5">{sales.map(sale => <tr key={sale.id}><td className="p-3">{sale.cliente}</td><td className="p-3">{sale.descripcion}</td><td className="p-3">{sale.pago}</td><td className="p-3 text-right">₡{sale.total.toLocaleString('es-CR')}</td></tr>)}</tbody></table></div>
      {financeImports.length > 0 && <div className="w-full max-w-full overflow-x-auto rounded-xl border border-[#659B5E]/20"><table className="w-full min-w-130 text-left text-sm"><caption className="p-3 text-left font-bold text-zinc-200">Histórico financiero importado</caption><thead className="bg-black/30 text-zinc-300"><tr><th className="p-3">Sede</th><th className="p-3">Período</th><th className="p-3 text-right">Ventas</th><th className="p-3 text-right">Costos</th></tr></thead><tbody className="divide-y divide-white/5">{financeImports.map((row, index) => <tr key={`${row.sede}-${row.periodo}-${index}`}><td className="p-3">{row.sede}</td><td className="p-3">{row.periodo}</td><td className="p-3 text-right">₡{row.ventas.toLocaleString('es-CR')}</td><td className="p-3 text-right">₡{row.costos.toLocaleString('es-CR')}</td></tr>)}</tbody></table></div>}

      {lastInvoice && <article className="mx-auto w-full max-w-3xl space-y-4 rounded-2xl bg-white p-5 text-zinc-900 sm:p-8" aria-label="Factura emitida">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 pb-4"><div className="flex items-center gap-3"><img src={officialLogo} alt="Logo El Cacique" className="h-16 w-16 object-contain"/><div><strong className="text-lg">CHICHARRONERA EL CACIQUE</strong><p className="text-sm text-zinc-500">Factura electrónica · {sedeNombre}</p></div></div><div className="text-right"><strong>{lastInvoice.consecutive}</strong><p className="text-xs text-zinc-500">{lastInvoice.issuedAtLabel}</p></div></div>
        <p><strong>Cliente:</strong> {lastInvoice.cliente} · <strong>Cédula:</strong> {lastInvoice.cedula}</p><p className="whitespace-pre-line"><strong>Detalle:</strong> {lastInvoice.descripcion}</p><p className="break-all text-xs"><strong>Clave numérica simulada:</strong> {lastInvoice.key}</p>
        <div className="flex flex-wrap items-end justify-between gap-5 border-t border-zinc-200 pt-4"><div className="space-y-1 text-sm"><p>Subtotal: ₡{lastInvoice.subtotal.toLocaleString('es-CR')}</p><p>IVA 13%: ₡{lastInvoice.iva.toLocaleString('es-CR')}</p><strong className="text-base">Total: ₡{lastInvoice.total.toLocaleString('es-CR')}</strong></div><div className="text-center"><img className="h-28 w-28" alt="Código QR para soporte por WhatsApp" src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(lastInvoice.supportUrl)}`}/><a className="text-xs text-emerald-700 underline" href={lastInvoice.supportUrl} target="_blank" rel="noreferrer">Soporte WhatsApp</a></div></div>
        <p className="border-t border-dashed border-zinc-300 pt-3 text-center text-[10px] text-zinc-500">Representación simulada para demostración; no sustituye el comprobante electrónico autorizado por Hacienda.</p>
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 font-bold text-white print:hidden"><Printer className="h-4 w-4"/>Imprimir factura</button>
      </article>}
    </section>
  );
}

function Metric({ label, amount }) {
  return <div className="min-w-0 rounded-2xl border border-[#659B5E]/20 bg-black/20 p-4"><span className="text-xs text-zinc-400">{label}</span><strong className="mt-1 block wrap-break-word text-xl font-black text-amber-300">₡{amount.toLocaleString('es-CR')}</strong></div>;
}

