const AiConversation = require('../models/AiConversation');
const AiMessage = require('../models/AiMessage');
const aiConfig = require('../config/ai.config');

/**
 * AI 数据清理工具
 * 定期清理过期的会话和消息，防止数据库膨胀
 */

/**
 * 清理过期的 AI 对话数据
 * @returns {Promise<Object>} 清理统计
 */
async function cleanupExpiredAiData() {
  const retentionDays = aiConfig.dataRetentionDays || 30;
  console.log(`[Cleanup] Starting AI data cleanup (retention: ${retentionDays} days)...`);
  
  try {
    const deletedCount = await AiConversation.deleteExpired(retentionDays);
    console.log(`[Cleanup] Deleted ${deletedCount} expired conversations.`);
    return {
      success: true,
      deletedConversations: deletedCount
    };
  } catch (error) {
    console.error('[Cleanup] Error deleting expired conversations:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 清理所有用户的超量消息
 * @param {number} maxMessagesPerUser 每个用户保留的最大消息数
 * @returns {Promise<number>} 总删除数
 */
async function cleanupExcessMessagesForAllUsers(maxMessagesPerUser = 200) {
  const db = require('../models/index');
  // 获取所有有过消息的 user_id
  const [users] = await db.query('SELECT DISTINCT user_id FROM ai_messages');
  
  let totalDeleted = 0;
  for (const user of users) {
    try {
      const deleted = await AiMessage.deleteOldestByUser(user.user_id, maxMessagesPerUser);
      totalDeleted += deleted;
    } catch (e) {
      console.error(`[Cleanup] Error cleaning messages for user ${user.user_id}:`, e);
    }
  }
  
  return totalDeleted;
}

/**
 * 获取 AI 数据统计
 */
async function getAiDataStats() {
  const db = require('../models/index');
  const [convRows] = await db.query('SELECT COUNT(*) as count FROM ai_conversations');
  const [msgRows] = await db.query('SELECT COUNT(*) as count FROM ai_messages');
  
  return {
    conversations: convRows[0].count,
    messages: msgRows[0].count
  };
}

module.exports = {
  cleanupExpiredAiData,
  cleanupExcessMessagesForAllUsers,
  getAiDataStats,
};
