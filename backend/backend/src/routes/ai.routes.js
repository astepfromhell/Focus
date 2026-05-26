const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * AI 路由
 * 所有接口需要认证
 */

// 应用认证中间件
router.use(authMiddleware);

// ==================== 对话接口 ====================

/**
 * AI 对话
 * POST /api/ai/chat
 */
router.post('/chat', aiController.chat);

// ==================== 会话管理 ====================

/**
 * 获取会话列表
 * GET /api/ai/conversations
 */
router.get('/conversations', aiController.getConversations);

/**
 * 获取指定会话的消息
 * GET /api/ai/conversations/:id/messages
 */
router.get('/conversations/:id/messages', aiController.getConversationMessages);

/**
 * 删除指定会话
 * DELETE /api/ai/conversations/:id
 */
router.delete('/conversations/:id', aiController.deleteConversation);

/**
 * 清空所有会话
 * DELETE /api/ai/conversations
 */
router.delete('/conversations', aiController.clearAllConversations);

// ==================== 消息管理 ====================

/**
 * 获取最近消息（跨会话）
 * GET /api/ai/messages/recent
 */
router.get('/messages/recent', aiController.getRecentMessages);

/**
 * 更新消息的操作结果
 * PATCH /api/ai/messages/:id/result
 */
router.patch('/messages/:id/result', aiController.updateMessageResult);

module.exports = router;
