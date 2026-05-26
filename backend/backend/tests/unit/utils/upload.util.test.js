const path = require('path');
const fs = require('fs');

// 关键：在任何模块导入之前 mock process.cwd
const originalCwd = process.cwd;
process.cwd = jest.fn(() => path.resolve(__dirname, '../../..'));

// 保存原始环境变量
const originalEnv = { ...process.env };

// 设置测试环境变量（在导入模块之前）
process.env.UPLOAD_DIR = 'test-uploads';
process.env.MAX_FILE_SIZE = '2097152'; // 2MB

describe('Upload Utility Functions', () => {
    let uploadUtil;

    beforeAll(() => {
        // 清除模块缓存
        jest.resetModules();

        // 现在导入模块
        uploadUtil = require('../../../src/utils/upload.util');
    });

    afterAll(() => {
        // 恢复原始环境变量和函数
        process.env = originalEnv;
        process.cwd = originalCwd;

        // 清理测试上传目录
        const testUploadPath = path.join(path.resolve(__dirname, '../../..'), 'test-uploads');
        if (fs.existsSync(testUploadPath)) {
            try {
                fs.rmSync(testUploadPath, { recursive: true, force: true });
            } catch (err) {
                // 忽略清理错误
            }
        }

        // 清除模块缓存
        jest.resetModules();
    });

    test('should export multer instance', () => {
        expect(uploadUtil).toBeDefined();
        expect(typeof uploadUtil).toBe('object');
        expect(uploadUtil).toHaveProperty('storage');
        expect(uploadUtil).toHaveProperty('fileFilter');
        expect(uploadUtil).toHaveProperty('limits');
        expect(typeof uploadUtil.any).toBe('function');
        expect(typeof uploadUtil.single).toBe('function');
        expect(typeof uploadUtil.array).toBe('function');
        expect(typeof uploadUtil.fields).toBe('function');
        expect(typeof uploadUtil.none).toBe('function');
    });

    test('should have correct storage configuration', () => {
        expect(uploadUtil.storage).toBeDefined();
        expect(typeof uploadUtil.storage.getDestination).toBe('function');
        expect(typeof uploadUtil.storage.getFilename).toBe('function');
    });

    test('should have file filter that accepts only images', () => {
        const fileFilter = uploadUtil.fileFilter;
        const mockCb = jest.fn();

        // 测试图片文件
        const imageFile = { mimetype: 'image/jpeg' };
        fileFilter(null, imageFile, mockCb);
        expect(mockCb).toHaveBeenCalledWith(null, true);

        // 测试非图片文件
        mockCb.mockClear();
        const nonImageFile = { mimetype: 'application/pdf' };
        fileFilter(null, nonImageFile, mockCb);
        expect(mockCb).toHaveBeenCalledWith(expect.any(Error));

        const error = mockCb.mock.calls[0][0];
        expect(error.message).toBe('Only image uploads are allowed');
        expect(error.status).toBe(400);
    });

    test('should have correct file size limit', () => {
        expect(uploadUtil.limits).toBeDefined();
        expect(uploadUtil.limits.fileSize).toBe(2097152); // 2MB
    });

    test('should create upload directory if not exists', () => {
        // Mock fs.mkdirSync
        const mkdirSyncSpy = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

        // 重新加载模块以触发初始化代码
        jest.resetModules();

        // 重新设置 process.cwd mock
        process.cwd = jest.fn(() => path.resolve(__dirname, '../../..'));

        require('../../../src/utils/upload.util');

        expect(mkdirSyncSpy).toHaveBeenCalledWith(
            expect.stringContaining('test-uploads'),
            { recursive: true }
        );

        mkdirSyncSpy.mockRestore();

        // 恢复 uploadUtil 引用
        jest.resetModules();
        uploadUtil = require('../../../src/utils/upload.util');
    });

    test('should generate safe filename with timestamp and random number', () => {
        const storage = uploadUtil.storage;
        const mockCb = jest.fn();
        const mockFile = { originalname: 'test image.jpg' };

        const originalDateNow = Date.now;
        const originalMathRandom = Math.random;

        Date.now = jest.fn(() => 1234567890123);
        Math.random = jest.fn(() => 0.123456789);

        storage.getFilename(null, mockFile, mockCb);

        expect(mockCb).toHaveBeenCalledWith(null, '1234567890123-123456789.jpg');

        Date.now = originalDateNow;
        Math.random = originalMathRandom;
    });

    test('should handle files without extension', () => {
        const storage = uploadUtil.storage;
        const mockCb = jest.fn();
        const mockFile = { originalname: 'testfile' };

        storage.getFilename(null, mockFile, mockCb);

        expect(mockCb).toHaveBeenCalledWith(null, expect.stringMatching(/^\d+-\d+$/));
    });

    test('should be able to use as middleware function', () => {
        expect(typeof uploadUtil.single).toBe('function');

        const middleware = uploadUtil.single('avatar');
        expect(typeof middleware).toBe('function');

        const arrayMiddleware = uploadUtil.array('photos', 3);
        expect(typeof arrayMiddleware).toBe('function');
    });
});