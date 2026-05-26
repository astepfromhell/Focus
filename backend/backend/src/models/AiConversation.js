const db = require('./index');

/**
 * AI 会话模型
 * 管理用户的 AI 对话会话
 */
class AiConversation {
  /**
   * 创建新会话
   * @param {string} conversationId 会话ID
   * @param {number} userId 用户ID
   * @param {string} title 会话标题
   * @returns {Promise<number>} 创建的会话ID (数据库自增ID，如果需要) 或 void
   */
  static async create(conversationId, userId, title = 'AI助手对话') {
    const truncatedTitle = title.substring(0, 100);
    const [result] = await db.query(
      'INSERT INTO ai_conversations (id, user_id, title) VALUES (?, ?, ?)',
      [conversationId, userId, truncatedTitle]
    );
    return result.conversationId;
  }

  /**
   * 根据ID获取会话
   * @param {string} conversationId
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  static async findById(conversationId, userId) {
    const [rows] = await db.query(
      'SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * 获取或创建会话
   * @param {string} conversationId
   * @param {number} userId
   * @param {string} title
   * @returns {Promise<Object>}
   */
  static async getOrCreate(conversationId, userId, title) {
    const existing = await this.findById(conversationId, userId);
    if (existing) {
      return existing;
    }
    await this.create(conversationId, userId, title);
    return this.findById(conversationId, userId);
  }

  /**
   * 更新会话（增加消息数，更新时间）
   * @param {string} conversationId
   * @param {number} incrementCount 增加的消息数
   */
  static async touch(conversationId, incrementCount = 1) {
    await db.query(`
      UPDATE ai_conversations 
      SET message_count = message_count + ?, updated_at = NOW() 
      WHERE id = ?
    `, [incrementCount, conversationId]);
  }

  /**
   * 获取用户的会话列表
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async listByUser(userId, limit = 20) {
    const [rows] = await db.query(`
      SELECT * FROM ai_conversations 
      WHERE user_id = ? 
      ORDER BY updated_at DESC 
      LIMIT ?
    `, [userId, limit]);
    return rows;
  }

  /**
   * 删除指定会话（级联删除消息）
   * @param {string} conversationId
   * @param {number} userId
   */
  static async delete(conversationId, userId) {
    await db.query(
      'DELETE FROM ai_conversations WHERE id = ? AND user_id = ?',
      [conversationId, userId]
    );
  }

  /**
   * 清空用户的所有会话
   * @param {number} userId
   */
  static async clearByUser(userId) {
    await db.query('DELETE FROM ai_conversations WHERE user_id = ?', [userId]);
  }

  /**
   * 删除过期会话
   * @param {number} retentionDays
   * @returns {Promise<number>} 删除的行数
   */
  static async deleteExpired(retentionDays = 30) {
    const [result] = await db.query(`
      DELETE FROM ai_conversations 
      WHERE updated_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [retentionDays]);
    return result.affectedRows;
  }
}

module.exports = AiConversation;
