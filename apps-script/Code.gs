/**
 * Portfolio v2 — Backend Google Apps Script
 * Script Properties wajib: GAS_SECRET, DRIVE_FOLDER_ID
 * Script harus terikat ke Spreadsheet (Extensions > Apps Script).
 */

const SHEETS = {
  Profile:      ['key', 'value'],
  Facts:        ['id', 'order', 'visible', 'value', 'label'],
  Projects:     ['id', 'order', 'visible', 'title', 'tags', 'description', 'points', 'images', 'slug'],
  Certificates: ['id', 'order', 'visible', 'title', 'image_url', 'issuer', 'issued_at', 'credential_url'],
  Experience:   ['id', 'order', 'visible', 'type', 'period', 'title', 'subtitle', 'points', 'images'],
  Publications: ['id', 'order', 'visible', 'title', 'venue', 'date', 'url'],
  Skills:       ['id', 'order', 'visible', 'name', 'icon_url', 'category'],
};
const LIST_SHEETS = ['Facts', 'Projects', 'Certificates', 'Experience', 'Publications', 'Skills'];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BASE64_LENGTH = 7000000; // ± 5 MB file

/* ---------- Setup (jalankan manual sekali) ---------- */

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const expected = SHEETS[name];
    const cols = expected.length;
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@'); // plain text, cegah auto-konversi angka/tanggal
      sh.getRange(1, 1, 1, cols).setValues([expected]).setFontWeight('bold');
      sh.setFrozenRows(1);
      return;
    }
    const lastCol = sh.getLastColumn();
    const existingHeaders = lastCol > 0
      ? sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h); })
      : [];
    expected.forEach(function (colName) {
      if (existingHeaders.indexOf(colName) === -1) {
        const targetCol = existingHeaders.length + 1;
        sh.getRange(1, targetCol, sh.getMaxRows(), 1).setNumberFormat('@');
        sh.getRange(1, targetCol).setValue(colName).setFontWeight('bold');
        existingHeaders.push(colName);
      }
    });
    sh.getRange(1, 1, sh.getMaxRows(), existingHeaders.length).setNumberFormat('@');
  });
}

function authorizeDrive() {
  const folder = DriveApp.getFolderById(prop_('DRIVE_FOLDER_ID'));
  Logger.log('Folder OK: ' + folder.getName());
}

/* ---------- Entry points ---------- */

function doGet(e) {
  return handle_(function () {
    const p = (e && e.parameter) || {};
    authRead_(p.secret);
    if (p.action === 'getAll') return { data: getAll_() };
    throw new Error('unknown_action');
  });
}

function doPost(e) {
  return handle_(function () {
    const body = JSON.parse(e.postData.contents);
    auth_(body.secret);
    return route_(body);
  });
}

function route_(b) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (b.action) {
      case 'updateProfile': return updateProfile_(b.values || {});
      case 'createItem':    return createItem_(b.sheet, b.item || {});
      case 'updateItem':    return updateItem_(b.sheet, b.id, b.item || {});
      case 'deleteItem':    return deleteItem_(b.sheet, b.id);
      case 'reorder':       return reorder_(b.sheet, b.ids || []);
      case 'uploadImage':   return uploadImage_(b);
      default: throw new Error('unknown_action');
    }
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Helpers ---------- */

function prop_(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

function auth_(secret) {
  const real = prop_('GAS_SECRET');
  if (!real || secret !== real) throw new Error('unauthorized');
}

function authRead_(secret) {
  const real = prop_('GAS_READ_SECRET') || prop_('GAS_SECRET');
  if (!real || secret !== real) throw new Error('unauthorized');
}

function handle_(fn) {
  try {
    return json_(Object.assign({ ok: true }, fn()));
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  if (LIST_SHEETS.indexOf(name) === -1) throw new Error('invalid_sheet');
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) throw new Error('sheet_not_found: ' + name);
  return sh;
}

function toCell_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function findRow_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return -1;
  const ids = sh.getRange(1, 1, last, 1).getValues().map(function (r) { return String(r[0]); });
  const idx = ids.indexOf(String(id));
  return idx < 1 ? -1 : idx + 1; // idx 0 = header
}

function headers_(sh) {
  const lastCol = sh.getLastColumn();
  return lastCol < 1 ? [] : sh.getRange(1, 1, 1, lastCol).getValues()[0];
}

// Tambah kolom yang terdaftar di SHEETS tapi belum ada di sheet (mis. kolom baru setelah update).
function ensureColumns_(sh, name) {
  const head = headers_(sh).map(function (h) { return String(h); });
  (SHEETS[name] || []).forEach(function (colName) {
    if (head.indexOf(colName) === -1) {
      const col = head.length + 1;
      sh.getRange(1, col, sh.getMaxRows(), 1).setNumberFormat('@');
      sh.getRange(1, col).setValue(colName).setFontWeight('bold');
      head.push(colName);
    }
  });
  return head;
}

/* ---------- Read ---------- */

function getAll_() {
  return {
    profile: readProfile_(),
    facts: readList_('Facts'),
    projects: readList_('Projects'),
    certificates: readList_('Certificates'),
    experience: readList_('Experience'),
    publications: readList_('Publications'),
    skills: readList_('Skills'),
  };
}

function readProfile_() {
  const sh = SpreadsheetApp.getActive().getSheetByName('Profile');
  const out = {};
  if (!sh || sh.getLastRow() < 2) return out;
  sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues().forEach(function (r) {
    if (r[0] !== '') out[String(r[0])] = r[1] === null ? '' : String(r[1]);
  });
  return out;
}

function readList_(name) {
  const sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh || sh.getLastRow() < 2) return [];
  const vals = sh.getDataRange().getDisplayValues();
  const head = vals[0];
  return vals.slice(1)
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      const o = {};
      head.forEach(function (h, i) { o[h] = r[i] === null ? '' : r[i]; });
      o.order = Number(o.order) || 0;
      o.visible = String(o.visible).toUpperCase() !== 'FALSE';
      return o;
    })
    .sort(function (a, b) { return a.order - b.order; });
}

/* ---------- Write ---------- */

function updateProfile_(values) {
  const sh = SpreadsheetApp.getActive().getSheetByName('Profile');
  if (!sh) throw new Error('sheet_not_found: Profile');
  const last = sh.getLastRow();
  const existingRows = last >= 2
    ? sh.getRange(2, 1, last - 1, 2).getValues()
    : [];
  const keyIndex = {};
  existingRows.forEach(function (r, idx) {
    keyIndex[String(r[0])] = idx;
  });

  let updatedExisting = false;
  const toAppend = [];
  Object.keys(values).forEach(function (k) {
    const cellVal = toCell_(values[k]);
    if (Object.prototype.hasOwnProperty.call(keyIndex, k)) {
      existingRows[keyIndex[k]][1] = cellVal;
      updatedExisting = true;
    } else {
      toAppend.push([k, cellVal]);
      keyIndex[k] = -1;
    }
  });

  if (updatedExisting && existingRows.length > 0) {
    const colValues = existingRows.map(function (r) { return [r[1]]; });
    sh.getRange(2, 2, existingRows.length, 1).setNumberFormat('@').setValues(colValues);
  }
  if (toAppend.length > 0) {
    const startRow = Math.max(last, 1) + 1;
    sh.getRange(startRow, 1, toAppend.length, 2).setNumberFormat('@').setValues(toAppend);
  }
  return {};
}

function createItem_(name, item) {
  const sh = sheet_(name);
  const head = ensureColumns_(sh, name);
  const existing = readList_(name);
  const nextOrder = existing.reduce(function (m, x) { return Math.max(m, x.order); }, 0) + 1;
  const id = Utilities.getUuid().replace(/-/g, '').slice(0, 10);
  const row = head.map(function (h) {
    if (h === 'id') return id;
    if (h === 'order') return String(nextOrder);
    if (h === 'visible') return item.visible === false ? 'FALSE' : 'TRUE';
    return toCell_(item[h]);
  });
  const nextRow = Math.max(sh.getLastRow(), 1) + 1;
  sh.getRange(nextRow, 1, 1, row.length).setNumberFormat('@').setValues([row]);
  return { id: id };
}

function updateItem_(name, id, item) {
  const sh = sheet_(name);
  const row = findRow_(sh, id);
  if (row < 0) throw new Error('not_found');
  const head = ensureColumns_(sh, name);
  const range = sh.getRange(row, 1, 1, head.length);
  const values = range.getValues()[0];
  let changed = false;
  head.forEach(function (h, i) {
    if (h === 'id' || h === 'order') return;
    if (Object.prototype.hasOwnProperty.call(item, h)) {
      values[i] = h === 'visible'
        ? (item[h] === false || item[h] === 'FALSE' ? 'FALSE' : 'TRUE')
        : toCell_(item[h]);
      changed = true;
    }
  });
  if (changed) {
    range.setNumberFormat('@').setValues([values]);
  }
  return {};
}

function deleteItem_(name, id) {
  const sh = sheet_(name);
  const row = findRow_(sh, id);
  if (row < 0) throw new Error('not_found');
  sh.deleteRow(row);
  return {};
}

function reorder_(name, ids) {
  const sh = sheet_(name);
  const orderCol = headers_(sh).indexOf('order') + 1;
  if (orderCol < 1) throw new Error('no_order_column');
  const last = sh.getLastRow();
  if (last < 2) return {};

  const rowIds = sh.getRange(2, 1, last - 1, 1).getValues();
  const rowById = {};
  rowIds.forEach(function (r, idx) {
    const key = String(r[0]);
    if (key !== '') rowById[key] = idx;
  });

  const orderRange = sh.getRange(2, orderCol, last - 1, 1);
  const orderValues = orderRange.getValues();
  let changed = false;
  ids.forEach(function (id, i) {
    const idx = rowById[String(id)];
    if (idx !== undefined) {
      orderValues[idx][0] = String(i + 1);
      changed = true;
    }
  });
  if (changed) {
    orderRange.setNumberFormat('@').setValues(orderValues);
  }
  return {};
}

/* ---------- Upload gambar ---------- */

function uploadImage_(b) {
  if (!b.base64 || !b.filename) throw new Error('missing_file');
  if (ALLOWED_MIME.indexOf(b.mimeType) === -1) throw new Error('invalid_mime');
  if (b.base64.length > MAX_BASE64_LENGTH) throw new Error('file_too_large');
  const safe = String(b.filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const name = Date.now() + '-' + safe;
  const blob = Utilities.newBlob(Utilities.base64Decode(b.base64), b.mimeType, name);
  const folder = DriveApp.getFolderById(prop_('DRIVE_FOLDER_ID'));
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    url: 'https://lh3.googleusercontent.com/d/' + file.getId(),
    fileId: file.getId(),
  };
}
