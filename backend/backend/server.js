require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
});

// 加上这句！！！防止进程退出
server.keepAliveTimeout = 0;
server.headersTimeout = 0;
