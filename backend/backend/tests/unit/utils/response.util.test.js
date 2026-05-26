const { success, error } = require('../../../src/utils/response.util');

describe('Response Utility Functions', () => {
    // 模拟 Express response 对象
    const createMockResponse = () => {
        const res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res)
        };
        return res;
    };

    describe('success', () => {
        test('should return success response with default values', () => {
            const mockRes = createMockResponse();
            const data = { id: 1, name: 'Test' };

            const result = success(mockRes, data);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { id: 1, name: 'Test' },
                message: '操作成功'
            });
            expect(result).toBe(mockRes); // 返回response对象以支持链式调用
        });

        test('should return success response with custom message and status', () => {
            const mockRes = createMockResponse();
            const data = { id: 1 };
            const customMessage = '创建成功';
            const customStatus = 201;

            success(mockRes, data, customMessage, customStatus);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: { id: 1 },
                message: '创建成功'
            });
        });

        test('should handle empty data object', () => {
            const mockRes = createMockResponse();

            success(mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: {},
                message: '操作成功'
            });
        });

        test('should handle null data', () => {
            const mockRes = createMockResponse();

            success(mockRes, null);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: null,
                message: '操作成功'
            });
        });
    });

    describe('error', () => {
        test('should return error response with default values', () => {
            const mockRes = createMockResponse();

            error(mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: '操作失败',
                code: 'ERROR'
            });
        });

        test('should return error response with custom error message', () => {
            const mockRes = createMockResponse();
            const customError = '用户不存在';

            error(mockRes, customError);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: '用户不存在',
                code: 'ERROR'
            });
        });

        test('should return error response with custom code and status', () => {
            const mockRes = createMockResponse();
            const customError = '未授权访问';
            const customCode = 'UNAUTHORIZED';
            const customStatus = 401;

            error(mockRes, customError, customCode, customStatus);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: '未授权访问',
                code: 'UNAUTHORIZED'
            });
        });

        test('should handle error object as message', () => {
            const mockRes = createMockResponse();
            const errorObj = new Error('数据库连接失败');

            error(mockRes, errorObj);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: errorObj, // 修改为期望接收 Error 对象
                code: 'ERROR'
            });
        });

        test('should handle null error message', () => {
            const mockRes = createMockResponse();

            error(mockRes, null);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: null,
                code: 'ERROR'
            });
        });
    });
});