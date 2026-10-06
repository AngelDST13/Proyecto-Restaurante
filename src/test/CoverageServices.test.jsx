import { deflateRawSync } from 'node:zlib';
import { DecompressionStream as NodeDecompressionStream } from 'node:stream/web';
import { Blob as NodeBlob } from 'node:buffer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { decryptData, encryptData } from '../services/cryptoService';
import { ROLE_LABELS, TEST_ACCESS_CREDENTIALS, VALID_ACCOUNTS, generateJWT, verifyJWT } from '../services/authSecurity';
import { createAdminRegister, removeAdminRegister } from '../services/adminRegistersService';
import {
  CASHIER_ORDERS_STORAGE_KEY,
  closeCashierRegister,
  enqueueCashierOrder,
  getCashierOrders,
  getCashierState,
  openCashierRegister,
  removeCashierOrder
} from '../services/cashierService';
import {
  createXlsxBlob,
  menuRowsForExport,
  parseCsv,
  parseXlsx,
  readFileText,
  rowsToCsv
} from '../services/spreadsheetService';
import { subscribeToLiveEvents } from '../services/n8nService';
import { averageRating } from '../services/adminInsights';
import { addWebReservation, readCollection, RESERVATIONS_KEY } from '../services/liveSync';

/**
 * Ramas de error y casos limite de los servicios: almacenamiento lleno o
 * corrupto, tokens manipulados y libros Excel dañados.
 */

/** localStorage en memoria con fallos configurables. */
function memoryStorage(initial = {}, { failSet = false } = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      if (failSet) throw new Error('QuotaExceededError');
      data.set(key, String(value));
    },
    removeItem: (key) => data.delete(key)
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('cryptoService', () => {
  it('cifra y descifra cadenas de ida y vuelta', () => {
    expect(decryptData(encryptData('texto plano'))).toBe('texto plano');
  });

  it('devuelve null si el valor no se puede serializar', () => {
    const circular = {};
    circular.self = circular;
    expect(encryptData(circular)).toBeNull();
  });

  it('devuelve null si un valor aes2 manipulado no produce texto', () => {
    expect(decryptData(encryptData(''))).toBe('');
    expect(decryptData('aes2:AAAA')).toBeNull();
  });
});

describe('authSecurity', () => {
  it('cada rol de las cuentas de prueba tiene su etiqueta visible', () => {
    for (const account of Object.values(VALID_ACCOUNTS)) {
      expect(ROLE_LABELS[account.rol], account.rol).toEqual(expect.any(String));
    }
    TEST_ACCESS_CREDENTIALS.forEach((credential) => expect(credential.rol).toEqual(expect.any(String)));
  });

  it('usa el alias como nombre y expira en 3 minutos para clientes', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));
    const token = generateJWT({ email: 'c@x.com', alias: 'Comensal', rol: 'cliente', sede: 'escazu' });
    const payload = verifyJWT(token);
    expect(payload.name).toBe('Comensal');
    expect(payload.exp - payload.iat).toBe(180);

    vi.setSystemTime(new Date('2026-10-05T12:03:01Z'));
    expect(verifyJWT(token)).toBeNull();
  });

  it('rechaza cabeceras alteradas y firmas de otra longitud', () => {
    const token = generateJWT({ email: 'a@x.com', nombre: 'Admin', rol: 'administrador', sede: 'escazu' });
    const [, payload, signature] = token.split('.');
    const forgedHeader = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=/g, '');
    expect(verifyJWT(`${forgedHeader}.${payload}.${signature}`)).toBeNull();
    expect(verifyJWT(`${token}extra`)).toBeNull();
  });
});

describe('adminRegistersService', () => {
  const register = { label: 'Caja 9', email: 'caja9@elcacique.com', password: 'segura123', sede: 'escazu' };

  it('valida nombre, correo y contraseña ausentes', () => {
    const storage = memoryStorage();
    expect(createAdminRegister({ sede: 'escazu' }, storage).message).toMatch(/nombre de la caja/);
    expect(createAdminRegister({ label: 'Caja', sede: 'escazu' }, storage).message).toMatch(/correo/);
    expect(createAdminRegister({ label: 'Caja', email: 'a@b.com', sede: 'escazu' }, storage).message).toMatch(/8 caracteres/);
  });

  it('informa si no se puede guardar la caja', () => {
    expect(createAdminRegister(register, memoryStorage({}, { failSet: true }))).toEqual({
      success: false,
      message: 'No se pudo guardar la caja en esta sede.'
    });
  });

  it('devuelve false si no puede persistir la eliminación', () => {
    const storage = memoryStorage();
    const { register: created } = createAdminRegister(register, storage);
    const failing = memoryStorage({ cacique_admin_registers: storage.getItem('cacique_admin_registers') }, { failSet: true });
    expect(removeAdminRegister(created.id, failing)).toBe(false);
  });
});

describe('cashierService', () => {
  it('tolera estados y colas corruptos', () => {
    const storage = memoryStorage({ cacique_cashier_escazu: '{roto', [CASHIER_ORDERS_STORAGE_KEY]: '{"no":"lista"}' });
    expect(getCashierState('escazu', storage)).toBeNull();
    expect(openCashierRegister({ sede: 'escazu', openingAmount: 1000 }, storage).success).toBe(true);
    expect(enqueueCashierOrder({ sede: 'escazu', tableId: 1, mesa: 'Mesa 01', total: 500, items: [] }, storage).success).toBe(true);
    expect(getCashierOrders('escazu', storage)).toHaveLength(1);

    const emptyQueue = memoryStorage({ [CASHIER_ORDERS_STORAGE_KEY]: '{"no":"lista"}' });
    expect(removeCashierOrder('x', emptyQueue)).toBe(true);
    expect(JSON.parse(emptyQueue.getItem(CASHIER_ORDERS_STORAGE_KEY))).toEqual([]);
    expect(removeCashierOrder('x', memoryStorage())).toBe(true);
  });

  it('cierra cajas con datos incompletos usando valores seguros', () => {
    const storage = memoryStorage({ cacique_cashier_escazu: JSON.stringify({ cashOpen: true, sales: 'no-lista' }) });
    const { summary } = closeCashierRegister({ sede: 'escazu', declaredCash: 'abc' }, storage);
    expect(summary).toMatchObject({ openingAmount: 0, expectedCash: 0, declaredCash: 0, difference: 0, totalSales: 0, salesCount: 0 });

    const withSales = memoryStorage({ cacique_cashier_escazu: JSON.stringify({ cashOpen: true, openingAmount: 100, sales: [{ pago: 'Efectivo' }, { pago: 'Tarjeta', total: 50 }] }) });
    expect(closeCashierRegister({ sede: 'escazu' }, withSales).summary).toMatchObject({ expectedCash: 100, totalSales: 50 });
  });

  it('informa los fallos de escritura al abrir y cerrar caja', () => {
    expect(openCashierRegister({ sede: 'escazu', openingAmount: 1 }, memoryStorage({}, { failSet: true })).message)
      .toBe('No se pudo registrar la apertura de caja.');
    const open = memoryStorage({ cacique_cashier_escazu: JSON.stringify({ cashOpen: true, sales: [] }) }, { failSet: true });
    expect(closeCashierRegister({ sede: 'escazu' }, open).message).toBe('No se pudo registrar el cierre de caja.');
  });
});

/* --------------------------------------------------------------------------
   Libros XLSX de prueba (ZIP almacenado o comprimido con deflate)
   -------------------------------------------------------------------------- */

function buildZip(files, { method = 0 } = {}) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const nameBytes = encoder.encode(name);
    const raw = encoder.encode(content);
    const body = method === 8 ? new Uint8Array(deflateRawSync(raw)) : raw;
    const local = new Uint8Array(30 + nameBytes.length + body.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, method, true);
    lv.setUint32(18, body.length, true);
    lv.setUint32(22, raw.length, true);
    lv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(body, 30 + nameBytes.length);
    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, method, true);
    cv.setUint32(20, body.length, true);
    cv.setUint32(24, raw.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((sum, item) => sum + item.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, centrals.length, true);
  ev.setUint16(10, centrals.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  const total = [...locals, ...centrals, end];
  const out = new Uint8Array(total.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of total) { out.set(part, cursor); cursor += part.length; }
  return out.buffer;
}

const sheetXml = (rows) => `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows}</sheetData></worksheet>`;
const HEADER_ROW = '<row><c t="inlineStr"><is><t>nombre</t></is></c><c t="inlineStr"><is><t>precio</t></is></c></row>';

describe('spreadsheetService', () => {
  it('genera CSV y XLSX vacíos o con celdas ausentes', async () => {
    expect(rowsToCsv([])).toBe('﻿');
    expect(rowsToCsv([{ a: 1 }], ['a', 'b'])).toBe('﻿"a","b"\r\n"1",""');
    expect(() => parseCsv(null)).toThrow('al menos una fila');
    expect(parseCsv('a,b\n1')).toEqual([{ a: '1', b: '' }]);
    expect(createXlsxBlob([]).size).toBeGreaterThan(0);
    const rows = await parseXlsx(await createXlsxBlob([{ nombre: 'X' }], ['nombre', 'precio']).arrayBuffer());
    expect(rows).toEqual([{ nombre: 'X', precio: '' }]);
  });

  it('omite líneas vacías intermedias y finales del CSV', () => {
    expect(parseCsv('a,b\n\n1,2\n')).toEqual([{ a: '1', b: '2' }]);
    expect(parseCsv('a,b\n1,2\n,')).toEqual([{ a: '1', b: '2' }]);
  });

  it('localiza el índice del ZIP aunque tenga un comentario al final', async () => {
    const zip = new Uint8Array(buildZip({ 'xl/worksheets/sheet1.xml': sheetXml(`${HEADER_ROW}<row><c><v>A</v></c></row>`) }));
    const comment = new TextEncoder().encode('Exportado por El Cacique');
    const withComment = new Uint8Array(zip.length + comment.length);
    withComment.set(zip);
    withComment.set(comment, zip.length);
    new DataView(withComment.buffer).setUint16(zip.length - 2, comment.length, true);
    await expect(parseXlsx(withComment.buffer)).resolves.toEqual([{ nombre: 'A', precio: '' }]);
  });

  it('prepara el menú para exportar con o sin sedes excluidas', () => {
    expect(menuRowsForExport([{ nombre: 'A', sedesNoDisponibles: ['Sede Cartago', 'Sede Heredia'] }, { nombre: 'B' }]))
      .toEqual([{ nombre: 'A', sedesNoDisponibles: 'Sede Cartago|Sede Heredia' }, { nombre: 'B', sedesNoDisponibles: '' }]);
  });

  it('lee archivos de texto', async () => {
    await expect(readFileText(new Blob(['hola']))).resolves.toBe('hola');
  });

  it('usa la primera hoja por defecto y textos compartidos', async () => {
    const buffer = buildZip({
      'xl/sharedStrings.xml': '<sst><si><t>Chifrijo</t></si><si><r><t>Tama</t></r><r><t>les</t></r></si></sst>',
      'xl/worksheets/sheet1.xml': sheetXml(`${HEADER_ROW}<row><c t="s"><v>0</v></c><c><v>6800</v></c></row><row><c t="s"><v>1</v></c><c t="s"><v>99</v></c></row>`)
    });
    await expect(parseXlsx(buffer)).resolves.toEqual([
      { nombre: 'Chifrijo', precio: '6800' },
      { nombre: 'Tamales', precio: '' }
    ]);
  });

  it('sigue la relación del libro hacia la hoja indicada (rutas absolutas)', async () => {
    const buffer = buildZip({
      'xl/workbook.xml': '<workbook xmlns:r="r"><sheets><sheet r:id="rId7"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<Relationships><Relationship Id="rId7" Target="/xl/worksheets/menu.xml"/></Relationships>',
      'xl/worksheets/menu.xml': sheetXml(`${HEADER_ROW}<row><c t="inlineStr"><is><t>Vigorón</t></is></c></row>`)
    });
    await expect(parseXlsx(buffer)).resolves.toEqual([{ nombre: 'Vigorón', precio: '' }]);
  });

  it('usa la hoja por defecto si el libro no tiene relaciones o identificador', async () => {
    const sheet = sheetXml(`${HEADER_ROW}<row><c t="inlineStr"><is><t>A</t></is></c></row>`);
    const noRels = buildZip({ 'xl/workbook.xml': '<workbook xmlns:r="r"><sheets><sheet r:id="rId1"/></sheets></workbook>', 'xl/worksheets/sheet1.xml': sheet });
    const noId = buildZip({ 'xl/workbook.xml': '<workbook><sheets><sheet/></sheets></workbook>', 'xl/worksheets/sheet1.xml': sheet });
    await expect(parseXlsx(noRels)).resolves.toHaveLength(1);
    await expect(parseXlsx(noId)).resolves.toHaveLength(1);
  });

  it('descomprime entradas deflate', async () => {
    // jsdom no implementa Blob.stream(); los navegadores si. Se usan las
    // implementaciones de Node para ejercitar la ruta real de descompresion.
    vi.stubGlobal('Blob', NodeBlob);
    if (typeof DecompressionStream === 'undefined') vi.stubGlobal('DecompressionStream', NodeDecompressionStream);
    const buffer = buildZip({ 'xl/worksheets/sheet1.xml': sheetXml(`${HEADER_ROW}<row><c t="inlineStr"><is><t>Deflate</t></is></c><c><v>1</v></c></row>`) }, { method: 8 });
    await expect(parseXlsx(buffer)).resolves.toEqual([{ nombre: 'Deflate', precio: '1' }]);
  });

  it.each([
    ['índice dañado', () => {
      const buffer = buildZip({ 'xl/worksheets/sheet1.xml': sheetXml(HEADER_ROW) });
      const bytes = new Uint8Array(buffer);
      const view = new DataView(buffer);
      const centralOffset = view.getUint32(bytes.length - 22 + 16, true);
      view.setUint32(centralOffset, 0, true);
      return buffer;
    }, 'El índice del libro Excel está dañado.'],
    ['compresión no compatible', () => buildZip({ 'a.xml': 'x' }, { method: 9 }), 'método de compresión no compatible'],
    ['sin hoja', () => buildZip({ 'xl/otra.xml': '<x/>' }), 'No se encontró una hoja de cálculo válida.'],
    ['XML inválido', () => buildZip({ 'xl/worksheets/sheet1.xml': '<worksheet><sheetData>' }), 'El contenido Excel está dañado.'],
    ['sin filas de datos', () => buildZip({ 'xl/worksheets/sheet1.xml': sheetXml(HEADER_ROW) }), 'al menos una fila']
  ])('rechaza un libro con %s', async (_label, build, message) => {
    await expect(parseXlsx(build())).rejects.toThrow(message);
  });
});

describe('n8nService, adminInsights y liveSync', () => {
  it('ignora callbacks inválidos al suscribirse a eventos en vivo', () => {
    const unsubscribe = subscribeToLiveEvents(null);
    expect(() => window.dispatchEvent(new CustomEvent('cacique-live-event', { detail: {} }))).not.toThrow();
    unsubscribe();
  });

  it('trata como 0 una calificación ausente', () => {
    expect(averageRating([{ rating: 4 }, {}])).toBe(2);
  });

  it('asume una persona si la cantidad no es válida', () => {
    localStorage.clear();
    expect(addWebReservation({ nombre: 'Ana', sede: 'Escazú', fecha: '2026-10-05', hora: '12:00', personas: 'x' }).personas).toBe(1);
    expect(readCollection(RESERVATIONS_KEY)).toHaveLength(1);
  });
});
