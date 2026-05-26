const db = require('../../../src/models/index');

// Mock the database pool
jest.mock('../../../src/config/database', () => {
    const mockQuery = jest.fn();
    return {
        query: mockQuery,
    };
});

describe('Database Index Module', () => {
    let mockPool;

    beforeEach(() => {
        // Get the mocked pool
        mockPool = require('../../../src/config/database');
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('query method', () => {
        it('should execute a query and return rows', async () => {
            const mockRows = [
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' },
            ];
            const mockResult = [mockRows, []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'SELECT * FROM test_table';
            const params = [];
            const [result] = await db.query(sql, params);

            expect(mockPool.query).toHaveBeenCalledWith(sql, params);
            expect(mockPool.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockRows);
        });

        it('should handle queries with parameters', async () => {
            const mockRows = [{ id: 1, name: 'Test 1' }];
            const mockResult = [mockRows, []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'SELECT * FROM test_table WHERE id = ?';
            const params = [1];
            const [result] = await db.query(sql, params);

            expect(mockPool.query).toHaveBeenCalledWith(sql, params);
            expect(result).toEqual(mockRows);
        });

        it('should handle empty result sets', async () => {
            const mockResult = [[], []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'SELECT * FROM test_table WHERE id = ?';
            const params = [999];
            const [result] = await db.query(sql, params);

            expect(result).toEqual([]);
        });

        it('should handle database errors', async () => {
            const mockError = new Error('Database connection failed');
            mockPool.query.mockRejectedValue(mockError);

            const sql = 'SELECT * FROM test_table';
            const params = [];

            await expect(db.query(sql, params)).rejects.toThrow('Database connection failed');
        });

        it('should handle queries with multiple parameters', async () => {
            const mockRows = [{ id: 1, name: 'Test', status: 'active' }];
            const mockResult = [mockRows, []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'SELECT * FROM test_table WHERE name = ? AND status = ?';
            const params = ['Test', 'active'];
            const [result] = await db.query(sql, params);

            expect(mockPool.query).toHaveBeenCalledWith(sql, params);
            expect(result).toEqual(mockRows);
        });

        it('should handle INSERT queries', async () => {
            const mockResult = [{ insertId: 123, affectedRows: 1 }, []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'INSERT INTO test_table (name) VALUES (?)';
            const params = ['New Item'];
            const [result] = await db.query(sql, params);

            expect(mockPool.query).toHaveBeenCalledWith(sql, params);
            expect(result).toEqual({ insertId: 123, affectedRows: 1 });
        });

        it('should handle UPDATE queries', async () => {
            const mockResult = [{ affectedRows: 1, changedRows: 1 }, []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'UPDATE test_table SET name = ? WHERE id = ?';
            const params = ['Updated Name', 1];
            const [result] = await db.query(sql, params);

            expect(mockPool.query).toHaveBeenCalledWith(sql, params);
            expect(result).toEqual({ affectedRows: 1, changedRows: 1 });
        });

        it('should handle DELETE queries', async () => {
            const mockResult = [{ affectedRows: 1 }, []];
            mockPool.query.mockResolvedValue(mockResult);

            const sql = 'DELETE FROM test_table WHERE id = ?';
            const params = [1];
            const [result] = await db.query(sql, params);

            expect(mockPool.query).toHaveBeenCalledWith(sql, params);
            expect(result).toEqual({ affectedRows: 1 });
        });
    });

    describe('pool export', () => {
        it('should export the pool object', () => {
            expect(db.pool).toBeDefined();
            expect(db.pool).toBe(mockPool);
        });
    });
});