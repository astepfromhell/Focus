const UserToken = require('../../../src/models/UserToken');
const db = require('../../../src/models/index');
const crypto = require('crypto');

jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('UserToken Model', () => {
    const mockUserId = 1;
    const mockToken = 'test-token-12345';
    const mockTokenHash = crypto.createHash('sha256').update(mockToken).digest('hex');
    const mockTokenId = 100;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hashToken', () => {
        it('should hash token using SHA256', () => {
            const token = 'my-secret-token';
            const hash = UserToken.hashToken(token);

            expect(hash).toBe(crypto.createHash('sha256').update(token).digest('hex'));
            expect(hash).toHaveLength(64);
        });

        it('should produce different hashes for different tokens', () => {
            const token1 = 'token-1';
            const token2 = 'token-2';

            const hash1 = UserToken.hashToken(token1);
            const hash2 = UserToken.hashToken(token2);

            expect(hash1).not.toBe(hash2);
        });

        it('should produce same hash for same token', () => {
            const token = 'consistent-token';

            const hash1 = UserToken.hashToken(token);
            const hash2 = UserToken.hashToken(token);

            expect(hash1).toBe(hash2);
        });
    });

    describe('create', () => {
        it('should create token with all parameters', async () => {
            const expiresAt = '2024-12-31 23:59:59';
            const metadata = { ip: '192.168.1.1', userAgent: 'Mozilla' };

            db.query.mockResolvedValue({ insertId: mockTokenId, affectedRows: 1 });

            const result = await UserToken.create({
                userId: mockUserId,
                token: mockToken,
                type: 'reset_password',
                expiresAt,
                metadata,
            });

            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO user_tokens (user_id, token_hash, type, expires_at, metadata) VALUES (?, ?, ?, ?, ?)',
                [mockUserId, mockTokenHash, 'reset_password', expiresAt, JSON.stringify(metadata)]
            );
            expect(result).toBe(mockToken);
        });

        it('should create token without optional parameters', async () => {
            db.query.mockResolvedValue({ insertId: mockTokenId, affectedRows: 1 });

            const result = await UserToken.create({
                userId: mockUserId,
                token: mockToken,
                type: 'email_verification',
            });

            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO user_tokens (user_id, token_hash, type, expires_at, metadata) VALUES (?, ?, ?, ?, ?)',
                [mockUserId, mockTokenHash, 'email_verification', null, null]
            );
            expect(result).toBe(mockToken);
        });

        it('should hash token before storing', async () => {
            db.query.mockResolvedValue({ insertId: mockTokenId, affectedRows: 1 });

            await UserToken.create({
                userId: mockUserId,
                token: mockToken,
                type: 'api_key',
            });

            const callArgs = db.query.mock.calls[0][1];
            expect(callArgs[1]).toBe(mockTokenHash);
            expect(callArgs[1]).not.toBe(mockToken);
        });

        it('should stringify metadata object', async () => {
            const metadata = { source: 'mobile', version: '1.0' };

            db.query.mockResolvedValue({ insertId: mockTokenId, affectedRows: 1 });

            await UserToken.create({
                userId: mockUserId,
                token: mockToken,
                type: 'session',
                metadata,
            });

            const callArgs = db.query.mock.calls[0][1];
            expect(callArgs[4]).toBe(JSON.stringify(metadata));
        });

        it('should handle null metadata', async () => {
            db.query.mockResolvedValue({ insertId: mockTokenId, affectedRows: 1 });

            await UserToken.create({
                userId: mockUserId,
                token: mockToken,
                type: 'session',
                metadata: null,
            });

            const callArgs = db.query.mock.calls[0][1];
            expect(callArgs[4]).toBeNull();
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                UserToken.create({
                    userId: mockUserId,
                    token: mockToken,
                    type: 'reset_password',
                })
            ).rejects.toThrow('Database error');
        });
    });

    describe('findValid', () => {
        it('should find valid token', async () => {
            const mockTokenRow = {
                id: mockTokenId,
                user_id: mockUserId,
                token_hash: mockTokenHash,
                type: 'reset_password',
                consumed: 0,
                expires_at: '2025-12-31 23:59:59',
                metadata: JSON.stringify({ ip: '192.168.1.1' }),
                created_at: '2024-01-01 00:00:00',
            };

            db.query.mockResolvedValue([mockTokenRow]);

            const result = await UserToken.findValid(mockToken, 'reset_password');

            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM user_tokens WHERE token_hash = ? AND type = ? AND consumed = 0 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1',
                [mockTokenHash, 'reset_password']
            );
            expect(result).toEqual(mockTokenRow);
        });

        it('should return null when token not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await UserToken.findValid('invalid-token', 'reset_password');

            expect(result).toBeNull();
        });

        it('should not find consumed token', async () => {
            db.query.mockResolvedValue([]);

            const result = await UserToken.findValid(mockToken, 'reset_password');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('consumed = 0'),
                expect.any(Array)
            );
            expect(result).toBeNull();
        });

        it('should not find expired token', async () => {
            db.query.mockResolvedValue([]);

            const result = await UserToken.findValid(mockToken, 'reset_password');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('expires_at IS NULL OR expires_at > NOW()'),
                expect.any(Array)
            );
            expect(result).toBeNull();
        });

        it('should match token type', async () => {
            db.query.mockResolvedValue([]);

            await UserToken.findValid(mockToken, 'email_verification');

            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [mockTokenHash, 'email_verification']
            );
        });

        it('should find token without expiration', async () => {
            const mockTokenRow = {
                id: mockTokenId,
                user_id: mockUserId,
                token_hash: mockTokenHash,
                type: 'api_key',
                consumed: 0,
                expires_at: null,
                metadata: null,
                created_at: '2024-01-01 00:00:00',
            };

            db.query.mockResolvedValue([mockTokenRow]);

            const result = await UserToken.findValid(mockToken, 'api_key');

            expect(result).toEqual(mockTokenRow);
        });
    });

    describe('consume', () => {
        it('should mark token as consumed', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            await UserToken.consume(mockTokenId);

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE user_tokens SET consumed = 1 WHERE id = ?',
                [mockTokenId]
            );
        });

        it('should handle non-existent token id', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            await UserToken.consume(999);

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE user_tokens SET consumed = 1 WHERE id = ?',
                [999]
            );
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(UserToken.consume(mockTokenId)).rejects.toThrow('Database error');
        });
    });

    describe('consumeByToken', () => {
        it('should find and consume valid token', async () => {
            const mockTokenRow = {
                id: mockTokenId,
                user_id: mockUserId,
                token_hash: mockTokenHash,
                type: 'reset_password',
                consumed: 0,
                expires_at: '2025-12-31 23:59:59',
            };

            db.query
                .mockResolvedValueOnce([mockTokenRow])
                .mockResolvedValueOnce({ affectedRows: 1 });

            const result = await UserToken.consumeByToken(mockToken, 'reset_password');

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT * FROM user_tokens'),
                [mockTokenHash, 'reset_password']
            );
            expect(db.query).toHaveBeenNthCalledWith(
                2,
                'UPDATE user_tokens SET consumed = 1 WHERE id = ?',
                [mockTokenId]
            );
            expect(result).toEqual(mockTokenRow);
        });

        it('should return null when token is invalid', async () => {
            db.query.mockResolvedValueOnce([]);

            const result = await UserToken.consumeByToken('invalid-token', 'reset_password');

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toBeNull();
        });

        it('should not consume if token not found', async () => {
            db.query.mockResolvedValueOnce([]);

            await UserToken.consumeByToken(mockToken, 'reset_password');

            expect(db.query).toHaveBeenCalledTimes(1);
        });

        it('should handle different token types', async () => {
            const mockTokenRow = {
                id: mockTokenId,
                user_id: mockUserId,
                type: 'email_verification',
            };

            db.query
                .mockResolvedValueOnce([mockTokenRow])
                .mockResolvedValueOnce({ affectedRows: 1 });

            const result = await UserToken.consumeByToken(mockToken, 'email_verification');

            expect(result).toEqual(mockTokenRow);
        });

        it('should return original token record', async () => {
            const mockTokenRow = {
                id: mockTokenId,
                user_id: mockUserId,
                token_hash: mockTokenHash,
                type: 'reset_password',
                consumed: 0,
                expires_at: null,
                metadata: JSON.stringify({ data: 'test' }),
            };

            db.query
                .mockResolvedValueOnce([mockTokenRow])
                .mockResolvedValueOnce({ affectedRows: 1 });

            const result = await UserToken.consumeByToken(mockToken, 'reset_password');

            expect(result).toEqual(mockTokenRow);
            expect(result.metadata).toBe(JSON.stringify({ data: 'test' }));
        });
    });

    describe('revokeByUser', () => {
        it('should revoke all tokens for user and type', async () => {
            db.query.mockResolvedValue({ affectedRows: 3 });

            await UserToken.revokeByUser(mockUserId, 'session');

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE user_tokens SET consumed = 1 WHERE user_id = ? AND type = ?',
                [mockUserId, 'session']
            );
        });

        it('should handle different token types', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            await UserToken.revokeByUser(mockUserId, 'api_key');

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE user_tokens SET consumed = 1 WHERE user_id = ? AND type = ?',
                [mockUserId, 'api_key']
            );
        });

        it('should handle no tokens to revoke', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            await UserToken.revokeByUser(999, 'reset_password');

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE user_tokens SET consumed = 1 WHERE user_id = ? AND type = ?',
                [999, 'reset_password']
            );
        });

        it('should revoke multiple tokens', async () => {
            db.query.mockResolvedValue({ affectedRows: 5 });

            await UserToken.revokeByUser(mockUserId, 'session');

            expect(db.query).toHaveBeenCalledTimes(1);
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                UserToken.revokeByUser(mockUserId, 'session')
            ).rejects.toThrow('Database error');
        });
    });

    describe('Token lifecycle', () => {
        it('should create, find, and consume token', async () => {
            const newToken = 'lifecycle-token';
            const newTokenHash = UserToken.hashToken(newToken);
            const mockRecord = {
                id: 200,
                user_id: mockUserId,
                token_hash: newTokenHash,
                type: 'reset_password',
                consumed: 0,
                expires_at: null,
            };

            db.query
                .mockResolvedValueOnce({ insertId: 200 })
                .mockResolvedValueOnce([mockRecord])
                .mockResolvedValueOnce({ affectedRows: 1 });

            await UserToken.create({
                userId: mockUserId,
                token: newToken,
                type: 'reset_password',
            });

            const found = await UserToken.findValid(newToken, 'reset_password');
            expect(found).toEqual(mockRecord);

            await UserToken.consume(found.id);

            expect(db.query).toHaveBeenCalledTimes(3);
        });

        it('should prevent reuse of consumed token', async () => {
            db.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce([]);

            const result1 = await UserToken.findValid(mockToken, 'reset_password');
            const result2 = await UserToken.findValid(mockToken, 'reset_password');

            expect(result1).toBeNull();
            expect(result2).toBeNull();
        });
    });
});
