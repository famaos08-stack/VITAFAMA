/**
 * VITAFAMA · Conexión de la tienda y el chatbot con Google Sheets
 *
 * Cómo instalarlo (una sola vez):
 *  1. Abre la hoja "VITAFAMA - Atención al cliente" en Google Drive.
 *  2. Menú Extensiones > Apps Script. Borra lo que aparezca y pega TODO este archivo. Guarda (Ctrl+S).
 *  3. Botón azul "Implementar" > "Nueva implementación".
 *     - Tipo (ícono del engranaje): "Aplicación web".
 *     - Ejecutar como: "Yo".
 *     - Quién tiene acceso: "Cualquier usuario".
 *  4. Pulsa "Implementar", autoriza con tu cuenta de Google y copia la "URL de la aplicación web"
 *     (termina en /exec). Esa URL va en CONFIG.sheetsUrl dentro de index.html.
 *
 * Si cambias este código después, usa "Implementar > Gestionar implementaciones > Editar (lápiz)
 * > Versión: Nueva versión" para que la URL siga siendo la misma.
 */

const TABS = {
  lead: {
    name: 'Clientes',
    headers: ['Fecha', 'Sesión', 'Nombre', 'WhatsApp', 'Correo', 'Ciudad', 'Interés', 'Origen', 'Autoriza datos'],
    fields: ['session', 'name', 'phone', 'email', 'city', 'interest', 'source', 'consent'],
  },
  chat: {
    name: 'Conversaciones',
    headers: ['Fecha', 'Sesión', 'Cliente', 'Mensaje del cliente', 'Respuesta del bot', '¿Resuelta?'],
    fields: ['session', 'client', 'message', 'answer', 'resolved'],
  },
  order: {
    name: 'Pedidos',
    headers: ['Fecha', 'Referencia', 'Cliente', 'Cédula / NIT', 'WhatsApp', 'Correo', 'Ciudad', 'Dirección',
              'Productos', 'Subtotal', 'Envío', 'Total', 'Método de pago', 'Estado'],
    fields: ['ref', 'name', 'doc', 'phone', 'email', 'city', 'address', 'items', 'sub', 'envio', 'total', 'method', 'status'],
  },
};
const MAX_LEN = 1000;          // máximo de caracteres por celda
const MAX_PER_10_MIN = 80;     // máximo de registros por visitante cada 10 minutos (anti-spam)

function doGet() {
  return ContentService.createTextOutput('VITAFAMA: conexión con Google Sheets activa ✅');
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.website) return json({ ok: true });            // trampa anti-bots (campo oculto)
    if (!allowed(body.session)) return json({ ok: false, error: 'rate' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (body.type === 'orderStatus') updateOrderStatus(body.ref, body.status);
      else if (TABS[body.type]) append(body.type, body);
      else return json({ ok: false, error: 'type' });
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function append(type, data) {
  const tab = TABS[type];
  const sheet = getSheet(tab);
  const row = [new Date()].concat(tab.fields.map(f => clean(data[f])));
  sheet.appendRow(row);
  if (type === 'order') sheet.getRange(sheet.getLastRow(), 10, 1, 3).setNumberFormat('"$"#,##0');
}

function updateOrderStatus(ref, status) {
  const sheet = getSheet(TABS.order);
  const last = sheet.getLastRow();
  if (last < 2 || !ref) return;
  const refs = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (let i = refs.length - 1; i >= 0; i--) {
    if (String(refs[i][0]) === String(ref)) {
      sheet.getRange(i + 2, 14).setValue(clean(status));
      return;
    }
  }
}

function getSheet(tab) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(tab.name);
  if (!sheet) {
    sheet = ss.insertSheet(tab.name);
    sheet.getRange(1, 1, 1, tab.headers.length).setValues([tab.headers])
      .setFontWeight('bold').setBackground('#1B4332').setFontColor('#F5F3EA');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Texto seguro: corta el largo y evita que algo escrito por un visitante se ejecute como fórmula. */
function clean(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  let s = String(v).slice(0, MAX_LEN);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function allowed(session) {
  const cache = CacheService.getScriptCache();
  const key = 'rl_' + String(session || 'anon').slice(0, 40);
  const n = Number(cache.get(key) || 0);
  if (n >= MAX_PER_10_MIN) return false;
  cache.put(key, String(n + 1), 600);
  return true;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Ejecútalo una vez desde el editor: crea las pestañas que falten y arma la pestaña "Resumen". */
function prepararHoja() {
  Object.keys(TABS).forEach(k => getSheet(TABS[k]));
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const r = ss.getSheetByName('Resumen') || ss.insertSheet('Resumen', 0);
  const rows = [
    ['Clientes registrados', '=COUNTA(Clientes!C2:C)', '0'],
    ['Mensajes recibidos en el chat', '=COUNTA(Conversaciones!D2:D)', '0'],
    ['Preguntas que el bot no supo responder', '=COUNTIF(Conversaciones!F2:F,"No")', '0'],
    ['Pedidos registrados', '=COUNTA(Pedidos!B2:B)', '0'],
    ['Valor de pedidos registrados', '=SUM(Pedidos!L2:L)', '"$"#,##0'],
    ['Valor de pedidos pagados', '=SUMIFS(Pedidos!L2:L,Pedidos!N2:N,"Pagado")', '"$"#,##0'],
  ];
  rows.forEach((row, i) => {
    r.getRange(4 + i, 1).setValue(row[0]);
    r.getRange(4 + i, 2).setFormula(row[1]).setNumberFormat(row[2]).setFontWeight('bold');
  });
}
