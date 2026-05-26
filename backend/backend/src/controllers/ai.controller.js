const aiService = require('../services/ai/ai.service');
const AiConversation = require('../models/AiConversation');
const AiMessage = require('../models/AiMessage');

/**
 * AI 控制器
 * 处理 HTTP 请求
 */
class AiController {
  /**
   * 聊天接口
   * POST /api/ai/chat
   */
  async chat(req, res, next) {
    try {
      const { message, context, userData, conversationId } = req.body;
      const userId = req.user.id; // 假设 auth 中间件已注入 user

      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      const result = await aiService.chat(
        userId, 
        message, 
        context || {}, 
        userData || null, 
        conversationId
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取会话列表
   * GET /api/ai/conversations
   */
  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const conversations = await aiService.getConversations(userId);
      res.json({
        success: true,
        data: conversations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取会话消息
   * GET /api/ai/conversations/:id/messages
   */
  async getConversationMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      const messages = await aiService.getConversationMessages(userId, conversationId);
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除会话
   * DELETE /api/ai/conversations/:id
   */
  async deleteConversation(req, res, next) {
    try {
      const userId = req.user.id;
      const conversationId = req.params.id;
      await aiService.deleteConversation(userId, conversationId);
      res.json({
        success: true,
        message: 'Conversation deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 清空所有会话
   * DELETE /api/ai/conversations
   */
  async clearAllConversations(req, res, next) {
    try {
      const userId = req.user.id;
      await aiService.clearAllConversations(userId);
      res.json({
        success: true,
        message: 'All conversations cleared'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取最近消息
   * GET /api/ai/messages/recent
   */
  async getRecentMessages(req, res, next) {
    try {
      const userId = req.user.id;
      const messages = await aiService.getRecentMessages(userId);
      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新消息操作结果
   * PATCH /api/ai/messages/:id/result
   */
  async updateMessageResult(req, res, next) {
    try {
      const userId = req.user.id;
      const messageId = req.params.id;
      const { success } = req.body;
      
      await aiService.updateActionResult(userId, messageId, success);
      res.json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AiController();
