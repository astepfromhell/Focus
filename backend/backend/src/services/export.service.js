const archiver = require('archiver');
const db = require('../models');

const toPlainObject = (rows = []) => rows.map((row) => ({ ...row }));

const formatRowValues = (row = {}) => {
  const formatted = {};
  Object.entries(row).forEach(([key, value]) => {
    if (value instanceof Date) {
      formatted[key] = value.toISOString();
    } else if (value === null || value === undefined) {
      formatted[key] = '';
    } else if (typeof value === 'boolean') {
      formatted[key] = value ? 'true' : 'false';
    } else {
      formatted[key] = value;
    }
  });
  return formatted;
};

const escapeCsvValue = (value) => {
  const stringValue = `${value}`;
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const toCSV = (items = []) => {
  if (!items.length) return '';
  const formattedItems = items.map(formatRowValues);
  const headers = Array.from(
    formattedItems.reduce((set, item) => {
      Object.keys(item).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
  const lines = [headers.join(',')];
  formattedItems.forEach((item) => {
    const row = headers.map((header) => escapeCsvValue(item[header] ?? ''));
    lines.push(row.join(','));
  });
  return lines.join('\n');
};

const buildDateFilters = (startDate, endDate) => {
  const clauses = [];
  const params = [];
  if (startDate) {
    clauses.push('DATE(start_time) >= ?');
    params.push(startDate);
  }
  if (endDate) {
    clauses.push('DATE(start_time) <= ?');
    params.push(endDate);
  }
  return { clauses, params };
};

const exportService = {
  async getPomodoroSessions(userId, { startDate, endDate } = {}) {
    const baseSql = 'SELECT * FROM pomodoro_sessions WHERE user_id = ?';
    const { clauses, params } = buildDateFilters(startDate, endDate);
    const sql = clauses.length ? `${baseSql} AND ${clauses.join(' AND ')} ORDER BY start_time DESC` : `${baseSql} ORDER BY start_time DESC`;
    const [rows] = await db.query(sql, [userId, ...params]);
    return toPlainObject(rows);
  },

  async getTasks(userId) {
    const sql = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [userId]);
    return toPlainObject(rows);
  },

  async getNotes(userId) {
    const sql = 'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(sql, [userId]);
    return toPlainObject(rows);
  },

  buildCsvAttachment(res, filename, items) {
    const csv = toCSV(items);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(csv || '');
  },

  buildJsonAttachment(res, filename, payload) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    return res.send(JSON.stringify(payload, null, 2));
  },

  async streamZip(res, datasets = {}) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => reject(err));
      res.on('close', resolve);
      res.on('finish', resolve);
      archive.pipe(res);
      Object.entries(datasets).forEach(([name, data]) => {
        archive.append(JSON.stringify(data, null, 2), { name: `${name}.json` });
      });
      archive.finalize().catch(reject);
    });
  },
};

module.exports = exportService;
