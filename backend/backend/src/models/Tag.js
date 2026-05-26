const db = require('./index');

const Tag = {
  async upsertTag({ userId, name, type = 'pomodoro', color = '#757575' }) {
    if (!name) return null;
    const selectSql = 'SELECT id FROM tags WHERE user_id = ? AND name = ? AND type = ? LIMIT 1';
    const [rows] = await db.query(selectSql, [userId, name, type]);
    if (rows[0]) {
      const updateSql = 'UPDATE tags SET usage_count = usage_count + 1 WHERE id = ?';
      await db.query(updateSql, [rows[0].id]);
      return rows[0];
    }
    const insertSql = 'INSERT INTO tags (user_id, name, type, color, usage_count) VALUES (?, ?, ?, ?, 1)';
    const [result] = await db.query(insertSql, [userId, name, type, color]);
    return { id: result.insertId, name, type, color };
  },

  async listByType(userId, type = 'pomodoro') {
    const sql = 'SELECT id, name, color, type, usage_count, created_at FROM tags WHERE user_id = ? AND type = ? ORDER BY usage_count DESC, name ASC';
    return db.query(sql, [userId, type]);
  },
};

module.exports = Tag;
