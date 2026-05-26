const db = require('./index');

/**
 * AI 消息模型
 * 管理 AI 对话的每条消息
 */
class AiMessage {
  /**
   * 创建单条消息
   * @param {Object} data 消息数据
   * @returns {Promise<number>} 消息ID
   */
  static async create(data) {
    const {
      conversation_id,
      user_id,
      role,
      content,
      intent_type = null,
      action_type = null,
      action_success = null
    } = data;

    const [result] = await db.query(
      `INSERT INTO ai_messages 
       (conversation_id, user_id, role, content, intent_type, action_type, action_success) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [conversation_id, user_id, role, content, intent_type, action_type, action_success]
    );
    return result.insertId;
  }

  /**
   * 获取会话的消息列表
   * @param {string} conversationId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async getByConversationId(conversationId, limit = 50) {
    const [rows] = await db.query(
      `SELECT * FROM ai_messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC 
       LIMIT ?`,
      [conversationId, limit]
    );
    return rows;
  }

  /**
   * 获取用于构建上下文的最近消息
   * @param {string} conversationId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async getHistoryForContext(conversationId, limit = 20) {
    // 获取最近的N条，然后按时间正序排列
    const [rows] = await db.query(
      `SELECT role, content FROM (
         SELECT role, content, created_at 
         FROM ai_messages 
         WHERE conversation_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?
       ) as sub ORDER BY created_at ASC`,
      [conversationId, limit]
    );
    return rows;
  }

  /**
   * 获取用户最近的消息（跨会话）
   * @param {number} userId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  static async getRecentByUserId(userId, limit = 20) {
    const [rows] = await db.query(
      `SELECT m.*, c.title as conversation_title 
       FROM ai_messages m
       JOIN ai_conversations c ON m.conversation_id = c.id
       WHERE m.user_id = ? 
       ORDER BY m.created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  /**
   * 更新消息的操作结果
   * @param {number} messageId
   * @param {boolean} success
   */
  static async updateActionResult(messageId, success) {
    await db.query(
      'UPDATE ai_messages SET action_success = ? WHERE id = ?',
      [success, messageId]
    );
  }

  /**
   * 统计每个用户的消息数量
   * @param {number} userId
   * @returns {Promise<number>}
   */
  static async countByUser(userId) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM ai_messages WHERE user_id = ?',
      [userId]
    );
    return rows[0].count;
  }

  /**
   * 删除用户最旧的消息（用于限制存储空间）
   * @param {number} userId
   * @param {number} keepCount 保留的消息数量
   * @returns {Promise<number>} 删除的行数
   */
  static async deleteOldestByUser(userId, keepCount) {
    // 这是一个稍微复杂的操作，需要先找到第 keepCount 条消息的ID，然后删除比它旧的
    // 为了兼容性，使用DELETE JOIN或子查询
    // 注意：MySQL DELETE Limit不支持offset，所以需要用子查询获取临界ID
    
    // 1. 获取要保留的最旧那条消息的ID
    const [rows] = await db.query(
      `SELECT id FROM ai_messages 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1 OFFSET ?`,
      [userId, keepCount]
    );

    if (rows.length === 0) {
      return 0; // 消息数量未超过 keepCount
    }

    const cutoffId = rows[0].id;

    // 2. 删除ID小于cutoffId的消息
    const [result] = await db.query(
      'DELETE FROM ai_messages WHERE user_id = ? AND id < ?',
      [userId, cutoffId]
    );
    
    return result.affectedRows;
  }
}

module.exports = AiMessage;
