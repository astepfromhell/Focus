# ── Stage 1: 依赖安装 ──────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# 构建上下文为项目根目录，package 文件在 backend/ 下
COPY backend/package*.json ./

RUN npm ci --omit=dev

# ── Stage 2: 运行镜像 ──────────────────────────────────────────────────────────
FROM node:18-alpine AS runner

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

# 复制 backend 目录下的应用源码
COPY backend/ .

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]