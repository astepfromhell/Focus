# Backend (Focus) - 快速开始

位置: `backend`

快速步骤:

1. 复制环境示例并修改: `cp .env.example .env`（Windows: 复制 `.env.example` 到 `.env` 并填入值）
2. 安装依赖: `npm install`
3. 初始化数据库: 使用 `backend/database/init.sql` 在 MySQL 中创建数据库与表在 PowerShell 或 CMD 中运行（会提示输入密码，地址改成对应地址）：

   ```
   mysql -u root -p -e "SOURCE d:/init.sql"
   ```
4. 本地开发: `npm run dev`

API 基本路由:

- `POST /api/auth/register` 注册
- `POST /api/auth/login` 登录
- `GET /api/users/me` 获取当前用户（需要 Authorization: Bearer `<token>`）

测试认证模块验证邮箱/重置密码时，使用的token是register/forget-password返回的形如

```
"devVerificationToken": "91fc7f99f45f3757e9beee7f2d13cf1f6d98e74bbc11013f8213094d324a9c67"
```

的一次性token。

## 本次修改概要（新增 AI 助手）

已在后端新增一套 AI 助手模块，用于接收前端的消息、通过 LLM 进行意图分类并返回结构化响应；后续由前端根据 intentType / actionData 执行具体业务操作。主要改动包括：

- 新增数据库迁移：`database/migrations/007_create_ai_tables.sql`（创建 `ai_conversations` 与 `ai_messages` 表）。
- 新增配置：`src/config/ai.config.js`（读取 LLM 提供商与限额配置）。
- 新增模型：`src/models/AiConversation.js`、`src/models/AiMessage.js`（会话与消息存储）。
- 新增服务：`src/services/ai/llm.client.js`（封装 Qwen/OpenAI 调用）、`src/services/ai/prompt.builder.js`（构建 system prompt）、`src/services/ai/ai.service.js`（对话主逻辑）。
- 新增控制器/路由：`src/controllers/ai.controller.js`、`src/routes/ai.routes.js`（对外 API），已在 `src/routes/index.js` 中挂载为 `/api/ai`。
- 新增工具：`src/utils/cleanup.js`（AI 数据清理脚本）。

核心新增接口（均需认证）：

- `POST /api/ai/chat` — AI 对话，接受 `{ message, context?, userData?, conversationId? }`，返回结构化 `intentType` / `reply` / `actionData`。
- `GET /api/ai/conversations` — 获取当前用户会话列表。
- `GET /api/ai/conversations/:id/messages` — 获取某个会话的消息列表。
- `GET /api/ai/messages/recent` — 跨会话获取最近消息（支持 `?limit=`）。
- `PATCH /api/ai/messages/:id/result` — 更新消息的操作结果（前端执行完 action 后回传 `{ success: true }`）。
- `DELETE /api/ai/conversations/:id` — 删除指定会话（级联删除消息）。
- `DELETE /api/ai/conversations` — 清空当前用户所有会话。

环境变量（在 `.env` 中新增，或参照 `.env.example`）：

- `LLM_PROVIDER`=qwen | openai
- `QWEN_API_KEY`, `QWEN_MODEL`
- `OPENAI_API_KEY`, `OPENAI_MODEL`（可选）
- `AI_MAX_TOKENS`, `AI_TEMPERATURE`, `AI_MAX_HISTORY_LENGTH`
- `AI_RATE_LIMIT_PER_MINUTE`, `AI_RATE_LIMIT_PER_DAY`
- `AI_DATA_RETENTION_DAYS`

运行与迁移说明：

1. 安装依赖（已包含 `axios` 用于调用 LLM）：

```bash
cd backend
npm install
```

2. 执行数据库迁移（新增表）：

```bash
# 将迁移脚本导入到目标数据库
mysql -u <user> -p <database_name> < database/migrations/007_create_ai_tables.sql
```

3. 配置 `.env` 中的 LLM Key（如 `QWEN_API_KEY` 或 `OPENAI_API_KEY`），启动服务：

```bash
npm run dev
```

测试命令（我已经在本地运行并保存过示例响应，临时文件位于项目根的 `backend/` 下）：

- 请求示例（使用文件方式发送可避免 PowerShell 引号问题）：

```bash
curl -X POST "http://localhost:3000/api/ai/chat" \
   -H "Authorization: Bearer <TOKEN>" \
   -H "Content-Type: application/json" \
   -d @backend/tmp_ai_chat_request.json
```

- 其他接口同理，示例文件与响应保存在：

```
backend/ai_tests/tmp_ai_chat_request.json
backend/ai_tests/tmp_ai_chat_response.json
backend/ai_tests/tmp_ai_conversations.json
backend/ai_tests/tmp_ai_conv_messages.json
backend/ai_tests/tmp_ai_recent2.json
backend/ai_tests/tmp_ai_patch.json
backend/ai_tests/tmp_ai_patch_result.json
backend/ai_tests/tmp_ai_delete_conv.json
backend/ai_tests/tmp_ai_delete_all.json
```

调试与兼容性说明：

- 我在开发过程中临时修改了 `src/middlewares/error.middleware.js` 以在 `development` 环境打印完整错误堆栈，便于排查（建议仅保留在开发环境）。
- 修复了 `src/models/index.js` 的 `query` 导出，使其返回与 `mysql2` 相同的 `[rows, fields]`，以避免现有模型层对解构结果的假设出错。

建议：

- 将 AI 相关迁移文件纳入正常迁移流程（或使用迁移工具），并确保密钥不提交到仓库。
- 可以把上述 curl 调试命令整理成可运行的脚本（例如 `scripts/test-ai-api.sh` 或 PowerShell 脚本），便于回放测试。
