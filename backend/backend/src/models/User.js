const db = require('./index');

const baseSelect = 'id, username, email, avatar_url, created_at, updated_at, last_login_at, is_active, email_verified';

const User = {
  async create({ username, email, password_hash, avatar_url = null }) {
    const sql = `INSERT INTO users (username, email, password_hash, avatar_url) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(sql, [username, email, password_hash, avatar_url]);
    return { id: result.insertId, username, email, avatar_url };
  },

  async findByEmail(email) {
    const sql = `SELECT ${baseSelect}, password_hash FROM users WHERE email = ? LIMIT 1`;
    const [rows] = await db.query(sql, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const sql = `SELECT ${baseSelect} FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async findWithPasswordById(id) {
    const sql = `SELECT ${baseSelect}, password_hash FROM users WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  async updateById(id, payload = {}) {
    const allowed = ['username', 'email', 'avatar_url'];
    const fields = [];
    const values = [];
    allowed.forEach((key) => {
      if (payload[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(payload[key]);
      }
    });
    if (!fields.length) return this.findById(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await db.query(sql, [...values, id]);
    return this.findById(id);
  },

  async updatePassword(id, password_hash) {
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await db.query(sql, [password_hash, id]);
  },

  async updateLastLogin(id) {
    const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
    await db.query(sql, [id]);
  },

  async setEmailVerified(id) {
    const sql = 'UPDATE users SET email_verified = TRUE WHERE id = ?';
    await db.query(sql, [id]);
  },

  async deleteById(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await db.query(sql, [id]);
  },

  async findByUsername(username) {
    const sql = 'SELECT id, username, email, avatar_url, created_at, updated_at, last_login_at, is_active, email_verified FROM users WHERE username = ? LIMIT 1';
    const [rows] = await db.query(sql, [username]);
    return rows[0] || null;
  }
};

module.exports = User;