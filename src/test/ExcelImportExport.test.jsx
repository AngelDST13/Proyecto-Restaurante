import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import { AccessibilityProvider } from '../context/AccessibilityContext';
import { AuthProvider } from '../context/AuthContext';
import AdminDashboard from '../pages/AdminDashboard';
import { createXlsxBlob, menuCsvHeaders, normalizeMenuRows, parseCsv, parseXlsx, readFileBuffer, readFileText, rowsToCsv, sanitizeImportedValue, sanitizePlainText } from '../services/spreadsheetService';

vi.mock('../services/n8nService', () => ({
  triggerN8nAutomation: vi.fn(() => Promise.resolve({ success: true })),
  subscribeToLiveEvents: vi.fn(() => () => {})
}));

const readBlob = blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsArrayBuffer(blob);
});

describe('Procesamiento Excel y CSV seguro', () => {
  beforeEach(() => localStorage.removeItem('cacique_admin_menu'));
  afterEach(() => vi.restoreAllMocks());

  it('escapa celdas de fórmula y conserva comas, comillas y saltos en CSV', () => {
    expect(sanitizeImportedValue('=HYPERLINK("https://x")')).toBe('\'=HYPERLINK("https://x")');
    const csv = rowsToCsv([{ nombre: 'Chifrijo, especial', descripcion: 'Con "paila"', precio: 6300 }], ['nombre', 'descripcion', 'precio']);
    expect(parseCsv(csv)).toEqual([{ nombre: 'Chifrijo, especial', descripcion: 'Con "paila"', precio: '6300' }]);
    expect(() => parseCsv('nombre,precio\n"texto sin cierre,200')).toThrow(/comillas sin cerrar/i);
    expect(() => parseCsv('')).toThrow(/encabezados/i);
  });

  it('valida las filas del menú y crea un libro XLSX que puede volver a leer', async () => {
    const rows = normalizeMenuRows([{ nombre: 'Chifrijo', categoria: 'Bocas', precio: '6300', descripcion: '<script>alert(1)</script>Tradicional', sedesNoDisponibles: 'Sede Heredia|Sede Cartago' }], () => 'menu-id-1');
    expect(rows[0]).toEqual({ id: 'menu-id-1', nombre: 'Chifrijo', categoria: 'Bocas', precio: 6300, descripcion: 'Tradicional', sedesNoDisponibles: ['Sede Heredia', 'Sede Cartago'] });
    expect(() => normalizeMenuRows([])).toThrow(/No hay platillos/i);
    expect(() => normalizeMenuRows([{ nombre: '', precio: 0 }])).toThrow(/Fila 2/i);
    const blob = createXlsxBlob(rows, menuCsvHeaders);
    expect(blob.type).toContain('spreadsheetml');
    const parsed = await parseXlsx(await readBlob(blob));
    expect(parsed[0]).toMatchObject({ nombre: 'Chifrijo', categoria: 'Bocas', precio: '6300' });
    expect(parsed[0].descripcion).toBe('Tradicional');
    await expect(parseXlsx(new ArrayBuffer(12))).rejects.toThrow(/XLSX válido/i);
  });

  it('normaliza contenido opcional y rechaza estructuras de menú que no sean válidas', () => {
    expect(sanitizePlainText('<script>alert(1)</script><b>Chifrijo</b>\u0001')).toBe('Chifrijo');
    expect(normalizeMenuRows([{ nombre: '<b>Chifrijo</b>', precio: '6400', sedesNoDisponibles: null }], () => 'generated-id')).toEqual([
      { id: 'generated-id', nombre: 'Chifrijo', categoria: 'Sin categoría', precio: 6400, descripcion: '', sedesNoDisponibles: [] }
    ]);
    expect(() => normalizeMenuRows({ nombre: 'incorrecto' })).toThrow(/No hay platillos/i);
    expect(() => normalizeMenuRows([{ nombre: 'Platillo', precio: 10, sedesNoDisponibles: 12 }])).toThrow(/sedes restringidas no válidas/i);
  });

  it('lee archivos de texto y buffer y propaga errores de FileReader', async () => {
    const file = new File(['contenido QA'], 'datos.csv', { type: 'text/csv' });
    expect(await readFileText(file)).toBe('contenido QA');
    expect(await readFileBuffer(file)).toBeInstanceOf(ArrayBuffer);

    const textReader = vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function () { this.onerror?.(new ProgressEvent('error')); });
    await expect(readFileText(file)).rejects.toThrow(/No se pudo leer el archivo/i);
    textReader.mockRestore();
    vi.spyOn(FileReader.prototype, 'readAsArrayBuffer').mockImplementation(function () { this.onerror?.(new ProgressEvent('error')); });
    await expect(readFileBuffer(file)).rejects.toThrow(/No se pudo leer el archivo/i);
  });

  it('rechaza archivos XLSX cuyo método de compresión no es compatible', async () => {
    const workbook = await readBlob(createXlsxBlob([{ nombre: 'Falla compresión' }], ['nombre']));
    const bytes = new Uint8Array(workbook);
    const view = new DataView(workbook);
    let centralOffset = -1;
    for (let index = 0; index <= bytes.length - 4; index += 1) {
      if (view.getUint32(index, true) === 0x02014b50) { centralOffset = index; break; }
    }
    const localOffset = view.getUint32(centralOffset + 42, true);
    view.setUint16(centralOffset + 10, 8, true);
    view.setUint16(localOffset + 8, 8, true);
    vi.stubGlobal('DecompressionStream', undefined);
    await expect(parseXlsx(workbook)).rejects.toThrow(/compresión no compatible/i);
  });

  it('importa platillos desde CSV y reporta errores de formato sin romper el panel', async () => {
    render(<AccessibilityProvider><AuthProvider><MemoryRouter><AdminDashboard /></MemoryRouter></AuthProvider></AccessibilityProvider>);
    fireEvent.click(screen.getByRole('button', { name: /Gestión de Menú/i }));
    const input = screen.getByLabelText('Importar archivo de menú');
    fireEvent.change(input, { target: { files: [new File(['bad'], 'menu.txt', { type: 'text/plain' })] } });
    await waitFor(() => expect(screen.getByText(/Formato no compatible/i)).toBeInTheDocument());
    const csv = 'nombre,categoria,precio,descripcion,sedesNoDisponibles\nChifrijo QA,Bocas,7200,Texto de prueba,Sede Heredia';
    fireEvent.change(input, { target: { files: [new File([csv], 'menu.csv', { type: 'text/csv' })] } });
    await waitFor(() => expect(screen.getByText('Chifrijo QA')).toBeInTheDocument());
    await waitFor(() => expect(JSON.parse(localStorage.getItem('cacique_admin_menu'))).toEqual(expect.arrayContaining([expect.objectContaining({ nombre: 'Chifrijo QA', precio: 7200, sedesNoDisponibles: ['Sede Heredia'] })])));
    const xlsxBuffer = await readBlob(createXlsxBlob([{ nombre: 'Excel QA', categoria: 'Bocas', precio: 4800, descripcion: 'Importado', sedesNoDisponibles: '' }], menuCsvHeaders));
    fireEvent.change(input, { target: { files: [new File([xlsxBuffer], 'menu.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })] } });
    await waitFor(() => expect(screen.getByText('Excel QA')).toBeInTheDocument());
    await waitFor(() => expect(JSON.parse(localStorage.getItem('cacique_admin_menu'))).toEqual(expect.arrayContaining([expect.objectContaining({ nombre: 'Excel QA', precio: 4800 })])));
    fireEvent.change(input, { target: { files: [new File(['{"nombre":'], 'broken.json', { type: 'application/json' })] } });
    await waitFor(() => expect(screen.getByText(/JSON inválido/i)).toBeInTheDocument());
  });
});
