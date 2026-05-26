// backend/.eslintrc.js
module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:security/recommended'
    ],
    plugins: ['security', 'promise'],
    parserOptions: {
        ecmaVersion: 2021
    },
    rules: {
        // ===== 关闭格式相关规则（这些交给 Prettier 处理更好）=====
        'indent': 'off',              // 关闭缩进检查
        'quotes': 'off',              // 关闭引号检查
        'comma-dangle': 'off',        // 关闭尾逗号检查
        'curly': 'off',               // 关闭大括号检查
        'semi': 'off',                // 关闭分号检查

        // ===== 保留重要的代码质量规则 =====
        'no-unused-vars': ['error', {
            argsIgnorePattern: '^_',    // 允许 _next 这种命名
            varsIgnorePattern: '^_'
        }],
        'no-console': 'warn',         // console 只警告，不报错
        'no-var': 'error',
        'prefer-const': 'error',
        'require-await': 'off',       // 关闭 async 函数必须有 await 的检查

        // ===== 安全规则 =====
        'security/detect-unsafe-regex': 'off', // 关闭复杂正则表达式检查，避免误报
        'security/detect-eval-with-expression': 'error',
        'security/detect-non-literal-fs-filename': 'off',  // 这个太严格
        'security/detect-object-injection': 'off'          // 这个误报太多
    }
};