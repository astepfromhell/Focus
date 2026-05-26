// tests/setup.js
// Jest 测试环境设置文件

// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.UPLOAD_DIR = 'test-uploads';

// 设置测试超时时间
jest.setTimeout(30000);

// 全局 beforeEach 钩子（如果需要）
beforeEach(() => {
    // 在每个测试前重置所有模拟
    jest.clearAllMocks();
});

// 全局 afterEach 钩子（如果需要）
afterEach(() => {
    // 在每个测试后清理
});

// 全局 afterAll 钩子（如果需要）
afterAll(() => {
    // 在所有测试后清理
});