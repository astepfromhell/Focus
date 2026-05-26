const db = require('./index');

const STATUS_VALUES = ['in_progress', 'completed', 'cancelled'];

const baseSelect = `id, user_id, start_time, end_time, planned_duration, actual_duration, status, tag, notes, interruptions, created_at`;

const buildFilters = (filters = {}) => {
  const clauses = ['user_id = ?'];
  const values = [filters.userId || null];
  if (filters.status && STATUS_VALUES.includes(filters.status)) {
    clauses.push('status = ?');
    values.push(filters.status);
  }
  if (filters.tag) {
    clauses.push('tag = ?');
    values.push(filters.tag);
  }
  if (filters.startDate) {
    clauses.push('DATE(start_time) >= ?');
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    clauses.push('DATE(start_time) <= ?');
    values.push(filters.endDate);
  }
  return { where: clauses.join(' AND '), values };
};

const PomodoroSession = {
  STATUS_VALUES,

  async create({ userId, startTime, plannedDuration, tag = null, notes = null }) {
    const sql = `INSERT INTO pomodoro_sessions (user_id, start_time, planned_duration, status, tag, notes) VALUES (?, ?, ?, 'in_progress', ?, ?)`;
    const params = [userId, startTime, plannedDuration, tag, notes];
    const [result] = await db.query(sql, params);
    return this.findById(result.insertId);
  },

  async findById(id) {
    const sql = `SELECT ${baseSelect} FROM pomodoro_sessions WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async findByIdForUser(id, userId) {
    const sql = `SELECT ${baseSelect} FROM pomodoro_sessions WHERE id = ? AND user_id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id, userId]);
    return rows[0] || null;
  },

  async listByFilters(filters = {}) {
    const { where, values } = buildFilters(filters);
    const limit = Number(filters.limit) || 20;
    const page = Number(filters.page) || 1;
    const offset = (page - 1) * limit;
    const sql = `SELECT ${baseSelect} FROM pomodoro_sessions WHERE ${where} ORDER BY start_time DESC LIMIT ? OFFSET ?`;
    const [items] = await db.query(sql, [...values, limit, offset]);
    return items;
  },

  async countByFilters(filters = {}) {
    const { where, values } = buildFilters(filters);
    const sql = `SELECT COUNT(*) AS total FROM pomodoro_sessions WHERE ${where}`;
    const [rows] = await db.query(sql, values);
    return rows[0]?.total || 0;
  },

  async updateById(id, userId, payload = {}) {
    const fields = [];
    const values = [];
    const map = {
      startTime: 'start_time',
      endTime: 'end_time',
      plannedDuration: 'planned_duration',
      actualDuration: 'actual_duration',
      status: 'status',
      tag: 'tag',
      notes: 'notes',
    };
    Object.entries(map).forEach(([key, column]) => {
      if (payload[key] !== undefined) {
        fields.push(`${column} = ?`);
        values.push(payload[key]);
      }
    });
    if (!fields.length) return this.findByIdForUser(id, userId);
    const sql = `UPDATE pomodoro_sessions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    await db.query(sql, [...values, id, userId]);
    return this.findByIdForUser(id, userId);
  },

  async deleteById(id, userId) {
    const sql = 'DELETE FROM pomodoro_sessions WHERE id = ? AND user_id = ?';
    const [result] = await db.query(sql, [id, userId]);
    return result.affectedRows > 0;
  },

  async incrementInterruptions(id, userId) {
    const sql = 'UPDATE pomodoro_sessions SET interruptions = interruptions + 1 WHERE id = ? AND user_id = ?';
    const [result] = await db.query(sql, [id, userId]);
    if (!result.affectedRows) return null;
    return this.findByIdForUser(id, userId);
  },
};

module.exports = PomodoroSession;