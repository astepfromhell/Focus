const axios = require('axios');
const aiConfig = require('../../config/ai.config');

/**
 * LLM 客户端
 * 封装对通义千问或 OpenAI API 的调用
 */
class LLMClient {
  constructor() {
    this.provider = aiConfig.provider;
    this.config = aiConfig[this.provider];
    
    // API 端点映射
    this.endpoints = {
      qwen: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      openai: 'https://api.openai.com/v1/chat/completions'
    };
  }

  /**
   * 发送聊天请求
   * @param {Array} messages 消息历史 [{role: 'user', content: '...'}, ...]
   * @param {Object} options 额外选项
   * @returns {Promise<string>} AI 响应文本
   */
  async chat(messages, options = {}) {
    if (this.provider === 'qwen') {
      return this._chatQwen(messages, options);
    } else {
      return this._chatOpenAI(messages, options);
    }
  }

  /**
   * 调用通义千问 API
   * 文档: https://help.aliyun.com/zh/dashscope/developer-reference/api-details
   */
  async _chatQwen(messages, options) {
    try {
      // 转换消息格式为 Qwen 格式（其实也是 role/content）
      // 注意：System prompt 在 Qwen 中通常作为第一条 system 消息
      
      const response = await axios.post(
        this.endpoints.qwen,
        {
          model: this.config.model,
          input: {
            messages: messages
          },
          parameters: {
            result_format: 'message',
            temperature: options.temperature || this.config.temperature,
            // Qwen 特有参数
            enable_search: false
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      if (response.data.output && response.data.output.choices) {
        return response.data.output.choices[0].message.content;
      } else if (response.data.code) {
        throw new Error(`Qwen API Error: ${response.data.code} - ${response.data.message}`);
      }
      
      throw new Error('Invalid response from Qwen API');
    } catch (error) {
      console.error('LLM Call Error (Qwen):', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 调用 OpenAI API
   */
  async _chatOpenAI(messages, options) {
    try {
      const response = await axios.post(
        this.endpoints.openai,
        {
          model: this.config.model,
          messages: messages,
          temperature: options.temperature || this.config.temperature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LLM Call Error (OpenAI):', error.response?.data || error.message);
      throw error;
    }
  }
}

// 导出单例
module.exports = new LLMClient();
