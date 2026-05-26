/**
 * AI 助手配置
 * 支持通义千问和 OpenAI 两种 LLM 提供商
 */
module.exports = {
  // 通义千问配置
  qwen: {
    apiKey: process.env.QWEN_API_KEY,
    model: process.env.QWEN_MODEL || 'qwen-turbo',
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
  },
  
  // OpenAI 兼容配置（备选）
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7,
  },
  
  // 当前使用的提供商
  provider: process.env.LLM_PROVIDER || 'qwen',
  
  // 对话历史限制
  maxHistoryLength: parseInt(process.env.AI_MAX_HISTORY_LENGTH) || 20,
  
  // 速率限制
  rateLimit: {
    maxRequestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 20,
    maxRequestsPerDay: parseInt(process.env.AI_RATE_LIMIT_PER_DAY) || 500,
  },

  // 数据保留
  dataRetentionDays: parseInt(process.env.AI_DATA_RETENTION_DAYS) || 30,
};
