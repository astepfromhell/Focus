import { post, get, del, patch } from './client'

/**
 * AI 助手 API
 */

/**
 * AI 对话
 * @param {Object} data - 请求数据
 * @param {string} data.message - 用户消息
 * @param {string} [data.conversationId] - 会话ID（不传则创建新会话）
 * @param {Array<{role: string, content: string}>} [data.history] - 对话历史
 * @param {Object} [data.context] - 用户上下文
 * @param {Object} [data.userData] - 用户数据（用于总结）
 * @returns {Promise<{success: boolean, data: {reply: string, conversationId: string, intentType: string, actionData: Object|null, usage: Object|null}, message: string}>}
 */
export const chat = (data) => {
    return post('ai/chat', data)
}

/**
 * 获取会话列表
 * @param {number} [limit=20] - 返回数量限制
 * @returns {Promise<{success: boolean, data: Array<{id: string, title: string, messageCount: number, createdAt: string, updatedAt: string}>, message: string}>}
 */
export const getConversations = (limit = 20) => {
    return get('ai/conversations', { limit })
}

/**
 * 获取指定会话的消息列表
 * @param {string} conversationId - 会话ID
 * @param {number} [limit=50] - 返回数量限制
 * @returns {Promise<{success: boolean, data: Array<{id: number, role: string, content: string, intentType: string|null, actionType: string|null, actionSuccess: boolean|null, created_at: string}>, message: string}>}
 */
export const getConversationMessages = (conversationId, limit = 50) => {
    return get(`ai/conversations/${conversationId}/messages`, { limit })
}

/**
 * 获取最近消息（跨会话）
 * @param {number} [limit=20] - 返回数量限制
 * @returns {Promise<{success: boolean, data: Array<{id: number, role: string, content: string, intentType: string|null, actionType: string|null, actionSuccess: boolean|null, created_at: string}>, message: string}>}
 */
export const getRecentMessages = (limit = 20) => {
    return get('ai/messages/recent', { limit })
}

/**
 * 删除指定会话
 * @param {string} conversationId - 会话ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteConversation = (conversationId) => {
    return del(`ai/conversations/${conversationId}`)
}

/**
 * 清空所有会话
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const clearAllConversations = () => {
    return del('ai/conversations')
}

/**
 * 更新消息的操作结果
 * @param {number} messageId - 消息ID
 * @param {boolean} actionSuccess - 操作是否成功
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateMessageResult = (messageId, actionSuccess) => {
    return patch(`ai/messages/${messageId}/result`, { actionSuccess })
}