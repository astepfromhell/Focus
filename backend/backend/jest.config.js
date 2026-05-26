// jest.config.js
module.exports = {
    // 测试环境
    testEnvironment: 'node',

    // 测试文件的位置 - 指向 unit 目录
    roots: ['<rootDir>/tests/unit'],

    // 匹配测试文件 - 只匹配 .test.js 文件
    testMatch: ['**/*.test.js'],

    // 收集覆盖率信息
    collectCoverage: true,
    coverageDirectory: 'coverage',  // 修正：使用相对于根目录的路径

    // 覆盖率报告格式
    coverageReporters: ['text', 'lcov', 'html', 'json', 'cobertura','json-summary'],

    // 指定要收集覆盖率的文件（相对于项目根目录）
    // 修正：移除 ../ 前缀，直接使用相对于 rootDir 的路径
    collectCoverageFrom: [
        'src/**/*.js',              // 收集 src 目录下的所有 JS 文件
        '!src/server.js',           // 排除启动文件
        '!src/app.js',              // 排除应用入口文件（如果有的话）
        '!src/**/*.test.js',        // 排除测试文件
        '!src/**/__tests__/**',     // 排除测试目录
        '!src/**/__mocks__/**',     // 排除模拟文件目录
        '!**/node_modules/**',      // 排除 node_modules
        '!**/coverage/**'           // 排除覆盖率目录
    ],

    // 模块名称映射（用于处理模块导入）
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'  // 修正：移除 ../ 前缀
    },

    // 模块目录设置，确保 Jest 能找到模块
    moduleDirectories: ['node_modules', '<rootDir>/src'],

    // 测试报告器（用于GitLab CI）
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'coverage',
            outputName: 'junit.xml',
            suiteName: 'Backend Unit Tests',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: true,
            addFileAttribute: true
        }]
    ],

    // 忽略的测试路径
    testPathIgnorePatterns: [
        '/node_modules/',
        '/__snapshots__/',
        '/fixtures/'
    ],

    // 设置测试超时时间（毫秒）
    testTimeout: 30000,

    // 在每次测试前执行的代码
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // 测试运行前清除所有 mock
    clearMocks: true,

    // 在每个测试前重置所有 mock
    resetMocks: true,

    // 恢复所有 mock 到原始状态
    restoreMocks: false,

    // 覆盖率阈值配置（可选）
    // 修正：移除 ../ 前缀，使用相对于 rootDir 的路径
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        },
        // 可以按目录设置不同的阈值
        // 注意：这里的路径应该匹配 collectCoverageFrom 中的路径格式
        './src/controllers/': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        },
        './src/services/': {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75
        }
    }
};