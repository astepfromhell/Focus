describe('示例测试套件', () => {
    test('1 + 1 应该等于 2', () => {
        expect(1 + 1).toBe(2);
    });

    test('异步测试示例', async () => {
        const result = await Promise.resolve(42);
        expect(result).toBe(42);
    });
});