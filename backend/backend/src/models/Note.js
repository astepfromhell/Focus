const db = require('./index');

const baseSelect = `id, user_id, content, position_x, position_y, width, height, z_index, color, is_pinned, is_archived, tags, created_at, updated_at`;

const mapFields = {
  content: 'content',
  positionX: 'position_x',
  positionY: 'position_y',
  width: 'width',
  height: 'height',
  zIndex: 'z_index',
  color: 'color',
  tags: 'tags',
  isPinned: 'is_pinned',
  isArchived: 'is_archived',
};

const Note = {
  async create({
    userId,
    content,
    positionX = 0,
    positionY = 0,
    width = 200,
    height = 200,
    zIndex = 0,
    color = '#FFEB3B',
    isPinned = false,
    isArchived = false,
    tags = null,
  }) {
    const sql = `INSERT INTO notes (user_id, content, position_x, position_y, width, height, z_index, color, is_pinned, is_archived, tags)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      userId,
      content,
      positionX,
      positionY,
      width,
      height,
      zIndex,
      color,
      isPinned,
      isArchived,
      tags,
    ];
    const [result] = await db.query(sql, params);
    return this.findByIdForUser(result.insertId, userId);
  },

  async findByIdForUser(id, userId) {
    const sql = `SELECT ${baseSelect} FROM notes WHERE id = ? AND user_id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id, userId]);
    return rows[0] || null;
  },

  async listByUser(userId, { isArchived = false } = {}) {
    const sql = `SELECT ${baseSelect} FROM notes WHERE user_id = ? AND is_archived = ?
                 ORDER BY is_pinned DESC, z_index DESC, updated_at DESC`;
    return db.query(sql, [userId, isArchived ? 1 : 0]);
  },

  async updateById(id, userId, payload = {}) {
    const fields = [];
    const values = [];
    Object.entries(mapFields).forEach(([key, column]) => {
      if (payload[key] !== undefined) {
        fields.push(`${column} = ?`);
        values.push(payload[key]);
      }
    });
    if (!fields.length) return this.findByIdForUser(id, userId);
    const sql = `UPDATE notes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    await db.query(sql, [...values, id, userId]);
    return this.findByIdForUser(id, userId);
  },

  async updatePosition(id, userId, { positionX, positionY, zIndex }) {
    const sql = `UPDATE notes SET position_x = ?, position_y = ?, z_index = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [positionX, positionY, zIndex, id, userId]);
    if (!result.affectedRows) return null;
    return this.findByIdForUser(id, userId);
  },

  async setPinned(id, userId, isPinned) {
    const sql = `UPDATE notes SET is_pinned = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [isPinned ? 1 : 0, id, userId]);
    if (!result.affectedRows) return null;
    return this.findByIdForUser(id, userId);
  },

  async setArchived(id, userId, isArchived) {
    const sql = `UPDATE notes SET is_archived = ? WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [isArchived ? 1 : 0, id, userId]);
    if (!result.affectedRows) return null;
    return this.findByIdForUser(id, userId);
  },

  async bulkUpdatePositions(userId, updates = []) {
    let updated = 0;
    for (const item of updates) {
      const sql = `UPDATE notes SET position_x = ?, position_y = ?, z_index = ? WHERE id = ? AND user_id = ?`;
      const [result] = await db.query(sql, [item.positionX, item.positionY, item.zIndex, item.id, userId]);
      updated += result.affectedRows || 0;
    }
    return updated;
  },

  async deleteById(id, userId) {
    const sql = 'DELETE FROM notes WHERE id = ? AND user_id = ?';
    const [result] = await db.query(sql, [id, userId]);
    return result.affectedRows > 0;
  },
};

module.exports = Note;
