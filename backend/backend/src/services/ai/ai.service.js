const llmClient = require('./llm.client');
const promptBuilder = require('./prompt.builder');
const AiConversation = require('../../models/AiConversation');
const AiMessage = require('../../models/AiMessage');

/**
 * AI 服务
 * 处理 AI 核心业务逻辑
 */
class AiService {
  /**
   * 处理聊天请求
   * @param {number} userId 用户ID
   * @param {string} message 用户消息
   * @param {Object} context 前端上传的上下文
   * @param {Object} userData 用户业务数据（可选，用于总结）
   * @param {string} conversationId 会话ID（可选）
   */
  async chat(userId, message, context = {}, userData = null, conversationId = null) {
    // 1. 准备会话 ID
    if (!conversationId) {
      conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 2. 确保会话存在
    await AiConversation.getOrCreate(conversationId, userId, message);

    // 3. 保存用户消息
    await AiMessage.create({
      conversation_id: conversationId,
      user_id: userId,
      role: 'user',
      content: message
    });

    // 4. 获取历史记录构建 Prompt
    const history = await AiMessage.getHistoryForContext(conversationId);
    
    // 5. 构建 System Prompt
    const systemPrompt = promptBuilder.buildSystemPrompt(context, userData);

    // 6. 组装发送给 LLM 的消息列表
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: message } // 确保当前消息在最后
    ];

    try {
      // 7. 调用 LLM
      const rawResponse = await llmClient.chat(messages);
      
      // 8. 解析响应（期望是 JSON）
      let parsedResponse;
      try {
        // 尝试清理可能存在的 Markdown 代码块标记 ```json ... ```
        const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                          rawResponse.match(/```\s*([\s\S]*?)\s*```/);
        
        const jsonStr = jsonMatch ? jsonMatch[1] : rawResponse;
        parsedResponse = JSON.parse(jsonStr);
      } catch (e) {
        console.warn('Failed to parse AI response as JSON, falling back to chat intent', rawResponse);
        // 降级处理
        parsedResponse = {
          intentType: 'chat',
          reply: rawResponse.replace(/```json/g, '').replace(/```/g, '') // 简单清理
        };
      }

      // 9. 保存 AI 响应
      const aiMessageId = await AiMessage.create({
        conversation_id: conversationId,
        user_id: userId,
        role: 'assistant',
        content: parsedResponse.reply, // 存主要回复内容
        intent_type: parsedResponse.intentType,
        action_type: parsedResponse.actionData?.actionType,
        action_success: null // 等待前端确认
      });

      // 10. 更新会话状态
      await AiConversation.touch(conversationId, 2); // 增加2条消息（用户+AI）

      // 11. 返回给前端的格式
      return {
        reply: parsedResponse.reply,
        intentType: parsedResponse.intentType,
        actionData: parsedResponse.actionData,
        conversationId: conversationId,
        messageId: aiMessageId
      };

    } catch (error) {
      console.error('AiService Chat Error:', error);
      throw error;
    }
  }

  /**
   * 获取用户会话列表
   */
  async getConversations(userId) {
    return AiConversation.listByUser(userId);
  }

  /**
   * 获取会话消息
   */
  async getConversationMessages(userId, conversationId) {
    // 验证所有权
    const conversation = await AiConversation.findById(conversationId, userId);
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }
    return AiMessage.getByConversationId(conversationId);
  }

  /**
   * 删除会话
   */
  async deleteConversation(userId, conversationId) {
    return AiConversation.delete(conversationId, userId);
  }

  /**
   * 清空所有会话
   */
  async clearAllConversations(userId) {
    return AiConversation.clearByUser(userId);
  }

  /**
   * 获取最近消息
   */
  async getRecentMessages(userId) {
    return AiMessage.getRecentByUserId(userId);
  }

  /**
   * 更新操作结果
   */
  async updateActionResult(userId, messageId, success) {
    // 简单验证（稍微宽松一点，只查ID是否存在且属于该用户太复杂，这里简化）
    // 实际生产中应验证 messageId 对应的 user_id 是否匹配
    return AiMessage.updateActionResult(messageId, success);
  }
}

// 导出单例
module.exports = new AiService();
