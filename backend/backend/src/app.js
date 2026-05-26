const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ========== Prometheus 监控配置 ==========
const promBundle = require('express-prom-bundle');
const client = require('prom-client');

// 收集默认指标（CPU、内存、事件循环等）
client.collectDefaultMetrics({ prefix: 'focus_' });

// 自定义业务指标（可选，按需使用）
const dbQueryDuration = new client.Histogram({
  name: 'focus_db_query_duration_seconds',
  help: '数据库查询耗时',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

const activeUsers = new client.Gauge({
  name: 'focus_active_users',
  help: '当前活跃用户数'
});

// Prometheus 中间件配置
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { app: 'focus-backend' },
  promClient: { collectDefaultMetrics: {} }
});
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(helmet());
app.use(metricsMiddleware);  // Prometheus 监控中间件（放在最前面以捕获所有请求）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
};
app.use(cors(corsOptions));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
app.use('/uploads', express.static(uploadDir));

app.use('/api', routes);

// health
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Focus backend OK' });
});

app.use(errorMiddleware);

module.exports = app;

// 导出自定义指标供其他模块使用（可选）
module.exports.metrics = { dbQueryDuration, activeUsers };