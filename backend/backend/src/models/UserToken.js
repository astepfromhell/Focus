const crypto = require('crypto');
const db = require('./index');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const UserToken = {
  hashToken,

  async create({ userId, token, type, expiresAt = null, metadata = null }) {
    const tokenHash = hashToken(token);
    const sql = `INSERT INTO user_tokens (user_id, token_hash, type, expires_at, metadata) VALUES (?, ?, ?, ?, ?)`;
    const metaString = metadata ? JSON.stringify(metadata) : null;
    await db.query(sql, [userId, tokenHash, type, expiresAt, metaString]);
    return token;
  },

  async findValid(token, type) {
    const tokenHash = hashToken(token);
    const sql = `SELECT * FROM user_tokens WHERE token_hash = ? AND type = ? AND consumed = 0 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1`;
    const [rows] = await db.query(sql, [tokenHash, type]);
    return rows[0] || null;
  },

  async consume(id) {
    const sql = 'UPDATE user_tokens SET consumed = 1 WHERE id = ?';
    await db.query(sql, [id]);
  },

  async consumeByToken(token, type) {
    const record = await this.findValid(token, type);
    if (!record) return null;
    await this.consume(record.id);
    return record;
  },

  async revokeByUser(userId, type) {
    const sql = 'UPDATE user_tokens SET consumed = 1 WHERE user_id = ? AND type = ?';
    await db.query(sql, [userId, type]);
  }
};

module.exports = UserToken;
