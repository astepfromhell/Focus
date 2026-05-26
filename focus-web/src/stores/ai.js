import { defineStore } from 'pinia'
import { chat, getConversations, getConversationMessages, deleteConversation, clearAllConversations, updateMessageResult } from '@/api/ai'

export const useAiStore = defineStore('ai', {
    state: () => ({
        // 对话数据
        messages: [],
        isLoading: false,
        error: null,
        conversationId: null,
        inputText: '',

        // 历史会话
        conversations: [],
        isLoadingHistory: false,
        showHistorySheet: false,

        // 网络状态
        isOffline: false,
        lastFailedMessage: null,

        // 语音输入状态
        voiceState: 'idle' // idle | listening | recognizing | result | error
    }),

    getters: {
        /**
         * 是否有消息
         */
        hasMessages: (state) => state.messages.length > 0,

        /**
         * 是否可以发送消息
         */
        canSend: (state) => {
            return state.inputText.trim().length > 0 && !state.isLoading && !state.isOffline
        },

        /**
         * 当前会话标题
         */
        currentConversationTitle: (state) => {
            if (!state.conversationId) return null
            const conv = state.conversations.find(c => c.id === state.conversationId)
            return conv?.title || '新对话'
        }
    },

    actions: {
        /**
         * 更新输入文本
         * @param {string} text - 输入文本
         */
        updateInputText(text) {
            this.inputText = text
            if (this.error === '发送失败') this.clearError()
        },

        /**
         * 发送消息
         * @param {string} content - 消息内容（可选，默认使用 inputText）
         */
        async sendMessage(content = null) {
            const messageContent = content || this.inputText.trim()
            if (!messageContent) return
            if (this.isLoading) return
            if (this.isOffline) {
                this.error = '当前无网络连接，请检查后重试'
                return
            }

            // 添加用户消息
            const userMessage = this.createUserMessage(messageContent)
            this.messages.push(userMessage)
            this.inputText = ''
            this.isLoading = true
            this.error = null
            this.lastFailedMessage = null

            // 滚动到底部（由组件处理）

            try {
                // 构建请求
                const requestData = {
                    message: messageContent,
                    conversationId: this.conversationId,
                    history: this.buildHistory()
                }

                const response = await chat(requestData)

                if (response.success && response.data) {
                    const aiResponse = response.data
                    // 更新会话ID
                    if (aiResponse.conversationId) {
                        this.conversationId = aiResponse.conversationId
                    }
                    // 添加AI回复
                    this.addAssistantMessage(aiResponse)
                    // 更新历史会话列表
                    await this.loadConversations()
                } else {
                    this.handleSendFailure(response.message || '请求失败，请稍后重试', messageContent)
                }
            } catch (error) {
                this.handleSendFailure(error.message || '发生未知错误', messageContent)
            } finally {
                this.isLoading = false
            }
        },

        /**
         * 重试最后一条失败的消息
         */
        async retryLastMessage() {
            if (!this.lastFailedMessage) return
            if (this.isLoading) return
            if (this.isOffline) {
                this.error = '当前无网络连接，请检查后重试'
                return
            }

            // 移除最后一条失败的消息（用户消息）
            if (this.messages.length > 0 && this.messages[this.messages.length - 1].role === 'user') {
                this.messages.pop()
            }

            await this.sendMessage(this.lastFailedMessage)
        },

        /**
         * 创建用户消息对象
         * @param {string} content - 消息内容
         */
        createUserMessage(content) {
            return {
                id: Date.now(),
                role: 'user',
                content: content,
                timestamp: Date.now(),
                conversationId: this.conversationId
            }
        },

        /**
         * 添加AI回复消息
         * @param {Object} aiResponse - AI响应数据
         */
        addAssistantMessage(aiResponse) {
            const message = {
                id: Date.now(),
                role: 'assistant',
                content: aiResponse.reply,
                timestamp: Date.now(),
                conversationId: aiResponse.conversationId,
                intentType: aiResponse.intentType,
                actionData: aiResponse.actionData,
                actionSuccess: aiResponse.actionData?.success
            }
            this.messages.push(message)
        },

        /**
         * 处理发送失败
         * @param {string} errorMsg - 错误信息
         * @param {string} originalContent - 原始消息内容
         */
        handleSendFailure(errorMsg, originalContent) {
            this.error = errorMsg
            this.lastFailedMessage = originalContent
        },

        /**
         * 构建对话历史（用于API请求）
         */
        buildHistory() {
            // 取最近10条消息（不包括当前正在发送的）
            return this.messages.slice(-10).map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        },

        /**
         * 清空当前对话
         */
        async clearConversation() {
            if (this.conversationId) {
                try {
                    await deleteConversation(this.conversationId)
                } catch (error) {
                    console.warn('删除会话失败:', error.message)
                }
            }
            this.messages = []
            this.conversationId = null
            this.error = null
            this.lastFailedMessage = null
            await this.loadConversations()
        },

        /**
         * 开始新对话
         */
        startNewConversation() {
            this.messages = []
            this.conversationId = null
            this.error = null
            this.lastFailedMessage = null
            this.inputText = ''
        },

        /**
         * 加载历史会话列表
         */
        async loadConversations() {
            this.isLoadingHistory = true
            try {
                const response = await getConversations(20)
                if (response.success && response.data) {
                    this.conversations = response.data
                    return { success: true, conversations: this.conversations }
                }
                return { success: false, message: response.message }
            } catch (error) {
                console.warn('加载会话列表失败:', error.message)
                return { success: false, message: error.message }
            } finally {
                this.isLoadingHistory = false
            }
        },

        /**
         * 恢复历史会话
         * @param {string} conversationId - 会话ID
         */
        async restoreConversation(conversationId) {
            this.isLoadingHistory = true
            this.showHistorySheet = false

            try {
                const response = await getConversationMessages(conversationId, 50)
                if (response.success && response.data) {
                    const messages = response.data.map(msg => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now(),
                        conversationId: conversationId,
                        intentType: msg.intentType,
                        actionSuccess: msg.actionSuccess
                    }))
                    this.messages = messages
                    this.conversationId = conversationId
                    this.error = null
                    return { success: true }
                }
                return { success: false, message: response.message }
            } catch (error) {
                console.warn('恢复会话失败:', error.message)
                return { success: false, message: error.message }
            } finally {
                this.isLoadingHistory = false
            }
        },

        /**
         * 删除历史会话
         * @param {string} conversationId - 会话ID
         */
        async deleteConversation(conversationId) {
            try {
                const response = await deleteConversation(conversationId)
                if (response.success) {
                    this.conversations = this.conversations.filter(c => c.id !== conversationId)
                    if (this.conversationId === conversationId) {
                        this.startNewConversation()
                    }
                    return { success: true }
                }
                return { success: false, message: response.message }
            } catch (error) {
                console.warn('删除会话失败:', error.message)
                return { success: false, message: error.message }
            }
        },

        /**
         * 打开历史会话面板
         */
        openHistorySheet() {
            this.showHistorySheet = true
            this.loadConversations()
        },

        /**
         * 关闭历史会话面板
         */
        closeHistorySheet() {
            this.showHistorySheet = false
        },

        /**
         * 更新消息操作结果
         * @param {number} messageId - 消息ID
         * @param {boolean} actionSuccess - 操作是否成功
         */
        async updateMessageActionResult(messageId, actionSuccess) {
            try {
                await updateMessageResult(messageId, actionSuccess)
            } catch (error) {
                console.warn('更新消息结果失败:', error.message)
            }
        },

        /**
         * 清除错误信息
         */
        clearError() {
            this.error = null
            this.lastFailedMessage = null
        },

        /**
         * 设置网络状态
         * @param {boolean} isOffline - 是否离线
         */
        setOfflineStatus(isOffline) {
            this.isOffline = isOffline
        },

        /**
         * 设置语音状态
         * @param {string} state - 语音状态
         */
        setVoiceState(state) {
            this.voiceState = state
        },

        /**
         * 处理语音识别结果
         * @param {string} text - 识别出的文本
         */
        onVoiceResult(text) {
            this.inputText = text
            this.voiceState = 'idle'
        },

        /**
         * 处理语音错误
         * @param {string} message - 错误信息
         */
        onVoiceError(message) {
            this.error = message
            this.voiceState = 'idle'
        },

        /**
         * 清空所有AI数据（登出时调用）
         */
        clearAll() {
            this.messages = []
            this.conversations = []
            this.conversationId = null
            this.error = null
            this.showHistorySheet = false
            this.isOffline = false
            this.lastFailedMessage = null
            this.inputText = ''
            this.voiceState = 'idle'
        }
    }
})