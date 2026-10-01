const MENU_HEADERS = ['nombre', 'categoria', 'precio', 'descripcion', 'sedesNoDisponibles'];

function stripControlCharacters(value) {
  return Array.from(value).filter(character => {
    const code = character.charCodeAt(0);
    return !(code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127);
  }).join('');
}

export function sanitizePlainText(value) {
  const withoutMarkup = String(value ?? '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '').replace(/<[^>]*>/g, '');
  return stripControlCharacters(withoutMarkup).trim();
}

export function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsText(file);
  });
}

export function readFileBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsArrayBuffer(file);
  });
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function sanitizeImportedValue(value) {
  const clean = stripControlCharacters(String(value ?? '')).trim();
  return /^[=+\-@\t\r]/.test(clean) ? `'${clean}` : clean;
}

function csvEscape(value) {
  const clean = sanitizeImportedValue(value);
  return `"${clean.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows, headers = Object.keys(rows[0] || {})) {
  const records = [headers, ...rows.map(row => headers.map(header => row[header] ?? ''))];
  return `\uFEFF${records.map(record => record.map(csvEscape).join(',')).join('\r\n')}`;
}

export function parseCsv(text) {
  const source = String(text ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"' && quoted && source[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(sanitizeImportedValue(cell)); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      row.push(sanitizeImportedValue(cell));
      if (row.some(value => value !== '')) rows.push(row);
      row = []; cell = '';
    } else cell += char;
  }
  if (cell || row.length) { row.push(sanitizeImportedValue(cell)); if (row.some(value => value !== '')) rows.push(row); }
  if (quoted) throw new Error('El CSV contiene comillas sin cerrar.');
  if (rows.length < 2) throw new Error('El archivo debe incluir encabezados y al menos una fila.');
  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

export function normalizeMenuRows(rows, createId = () => crypto.randomUUID()) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('No hay platillos para importar.');
  const normalized = rows.map((row, index) => {
    const price = Number(sanitizeImportedValue(row.precio));
    const nombre = sanitizePlainText(row.nombre);
    if (!nombre || !Number.isFinite(price) || price <= 0) throw new Error(`Fila ${index + 2}: nombre o precio no válido.`);
    let branches = row.sedesNoDisponibles ?? [];
    if (typeof branches === 'string') branches = branches.split(/[|;]/).map(value => sanitizeImportedValue(value)).filter(Boolean);
    if (!Array.isArray(branches)) throw new Error(`Fila ${index + 2}: sedes restringidas no válidas.`);
    return {
      id: sanitizeImportedValue(row.id) || createId(),
      nombre,
      categoria: sanitizePlainText(row.categoria) || 'Sin categoría',
      precio: price,
      descripcion: sanitizePlainText(row.descripcion),
      sedesNoDisponibles: branches.map(sanitizePlainText)
    };
  });
  return normalized;
}

function xmlEscape(value) {
  return sanitizeImportedValue(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

function columnName(index) {
  let value = index + 1;
  let label = '';
  while (value > 0) { const remainder = (value - 1) % 26; label = String.fromCharCode(65 + remainder) + label; value = Math.floor((value - 1) / 26); }
  return label;
}

function crc32(bytes) {
  let crc = -1;
  for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (-(crc & 1) & 0xEDB88320); }
  return (crc ^ -1) >>> 0;
}

function zipStored(files) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const fileName = encoder.encode(name);
    const bytes = encoder.encode(content);
    const crc = crc32(bytes);
    const local = new Uint8Array(30 + fileName.length + bytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true); localView.setUint16(8, 0, true);
    localView.setUint32(14, crc, true); localView.setUint32(18, bytes.length, true); localView.setUint32(22, bytes.length, true); localView.setUint16(26, fileName.length, true);
    local.set(fileName, 30); local.set(bytes, 30 + fileName.length); locals.push(local);
    const central = new Uint8Array(46 + fileName.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true); centralView.setUint16(4, 20, true); centralView.setUint16(6, 20, true); centralView.setUint16(10, 0, true);
    centralView.setUint32(16, crc, true); centralView.setUint32(20, bytes.length, true); centralView.setUint32(24, bytes.length, true); centralView.setUint16(28, fileName.length, true); centralView.setUint32(42, offset, true);
    central.set(fileName, 46); centrals.push(central); offset += local.length;
  }
  const centralSize = centrals.reduce((sum, record) => sum + record.length, 0);
  const end = new Uint8Array(22); const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true); endView.setUint16(8, files ? Object.keys(files).length : 0, true); endView.setUint16(10, Object.keys(files).length, true); endView.setUint32(12, centralSize, true); endView.setUint32(16, offset, true);
  return new Blob([...locals, ...centrals, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function createXlsxBlob(rows, headers = Object.keys(rows[0] || {})) {
  const allRows = [headers, ...rows.map(row => headers.map(header => row[header] ?? ''))];
  const sheetRows = allRows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`).join('')}</row>`).join('');
  return zipStored({
    '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="El Cacique" sheetId="1" r:id="rId1"/></sheets></workbook>',
    'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    'xl/worksheets/sheet1.xml': `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`
  });
}

export const menuCsvHeaders = MENU_HEADERS;

export function menuRowsForExport(items) {
  return items.map(item => ({ ...item, sedesNoDisponibles: (item.sedesNoDisponibles || []).join('|') }));
}

export async function parseXlsx(buffer) {
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder();
  const files = new Map();
  const view = new DataView(buffer);
  let endOffset = -1;
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) {
    if (view.getUint32(index, true) === 0x06054b50) { endOffset = index; break; }
  }
  if (endOffset < 0) throw new Error('El archivo no es un libro Excel XLSX válido.');
  let offset = view.getUint32(endOffset + 16, true);
  const entries = view.getUint16(endOffset + 10, true);
  for (let entry = 0; entry < entries; entry += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('El índice del libro Excel está dañado.');
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.slice(offset + 46, offset + 46 + nameLength));
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(start, start + compressedSize);
    let content;
    if (method === 0) content = compressed;
    else if (method === 8 && typeof DecompressionStream !== 'undefined') {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      content = new Uint8Array(await new Response(stream).arrayBuffer());
    } else throw new Error('El archivo Excel usa un método de compresión no compatible.');
    files.set(name, decoder.decode(content));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  const workbook = files.get('xl/workbook.xml');
  const relations = files.get('xl/_rels/workbook.xml.rels');
  const workbookXml = workbook ? new DOMParser().parseFromString(workbook, 'application/xml') : null;
  const relationXml = relations ? new DOMParser().parseFromString(relations, 'application/xml') : null;
  const relationId = workbookXml?.querySelector('sheet')?.getAttribute('r:id');
  const target = relationId ? [...(relationXml?.querySelectorAll('Relationship') || [])].find(item => item.getAttribute('Id') === relationId)?.getAttribute('Target') : null;
  const sheetPath = target ? `xl/${target.replace(/^\//, '').replace(/^xl\//, '')}` : 'xl/worksheets/sheet1.xml';
  const sheet = files.get(sheetPath);
  if (!sheet) throw new Error('No se encontró una hoja de cálculo válida.');
  const sharedXmlText = files.get('xl/sharedStrings.xml');
  const sharedXml = sharedXmlText ? new DOMParser().parseFromString(sharedXmlText, 'application/xml') : null;
  const sharedStrings = [...(sharedXml?.querySelectorAll('si') || [])].map(item => [...item.querySelectorAll('t')].map(text => text.textContent).join(''));
  const xml = new DOMParser().parseFromString(sheet, 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('El contenido Excel está dañado.');
  const rows = [...xml.querySelectorAll('sheetData row')].map(row => [...row.querySelectorAll(':scope > c')].map(cell => {
    const inline = cell.querySelector('is t')?.textContent;
    const rawValue = cell.querySelector('v')?.textContent ?? '';
    const value = cell.getAttribute('t') === 's' ? sharedStrings[Number(rawValue)] ?? '' : inline ?? rawValue;
    return sanitizeImportedValue(value);
  }));
  if (rows.length < 2) throw new Error('El Excel debe incluir encabezados y al menos una fila.');
  const headers = rows[0].map(value => value.trim());
  return rows.slice(1).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}
