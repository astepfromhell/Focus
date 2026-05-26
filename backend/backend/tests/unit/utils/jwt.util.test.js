// 模拟 jsonwebtoken 和 crypto 模块
jest.mock('jsonwebtoken');
jest.mock('crypto');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    decode
} = require('../../../src/utils/jwt.util');

// 模拟配置
jest.mock('../../../src/config/jwt', () => ({
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    jwtRefreshSecret: 'test-refresh-secret',
    jwtRefreshExpiresIn: '7d'
}));

describe('JWT Utility Functions', () => {
    const mockPayload = { userId: 1, email: 'test@example.com' };
    const mockToken = 'mock.jwt.token';
    const mockDecoded = { userId: 1, email: 'test@example.com', iat: 1234567890, exp: 1234567890 + 3600 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAccessToken', () => {
        test('should call jwt.sign with correct parameters', () => {
            jwt.sign.mockReturnValue(mockToken);

            const result = generateAccessToken(mockPayload);

            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                'test-secret',
                { expiresIn: '1h' }
            );
            expect(result).toBe(mockToken);
        });

        test('should handle empty payload', () => {
            jwt.sign.mockReturnValue('empty.payload.token');

            const result = generateAccessToken({});

            expect(result).toBe('empty.payload.token');
        });
    });

    describe('verifyAccessToken', () => {
        test('should return decoded payload for valid token', () => {
            jwt.verify.mockReturnValue(mockDecoded);

            const result = verifyAccessToken(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
            expect(result).toEqual(mockDecoded);
        });

        test('should return null for invalid token', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const result = verifyAccessToken('invalid.token');

            expect(jwt.verify).toHaveBeenCalledWith('invalid.token', 'test-secret');
            expect(result).toBeNull();
        });

        test('should return null for expired token', () => {
            jwt.verify.mockImplementation(() => {
                const error = new Error('Token expired');
                error.name = 'TokenExpiredError';
                throw error;
            });

            const result = verifyAccessToken('expired.token');

            expect(result).toBeNull();
        });
    });

    describe('generateRefreshToken', () => {
        test('should generate refresh token with jwtid', () => {
            const mockJwtId = '123e4567-e89b-12d3-a456-426614174000';
            crypto.randomUUID.mockReturnValue(mockJwtId);
            jwt.sign.mockReturnValue('refresh.token');

            const result = generateRefreshToken(mockPayload);

            expect(crypto.randomUUID).toHaveBeenCalled();
            expect(jwt.sign).toHaveBeenCalledWith(
                mockPayload,
                'test-refresh-secret',
                { expiresIn: '7d', jwtid: mockJwtId }
            );
            expect(result).toBe('refresh.token');
        });

        test('should generate refresh token with empty payload', () => {
            crypto.randomUUID.mockReturnValue('uuid');
            jwt.sign.mockReturnValue('refresh.token');

            const result = generateRefreshToken();

            expect(jwt.sign).toHaveBeenCalledWith(
                {},
                'test-refresh-secret',
                { expiresIn: '7d', jwtid: 'uuid' }
            );
        });
    });

    describe('verifyRefreshToken', () => {
        test('should verify refresh token with correct secret', () => {
            jwt.verify.mockReturnValue(mockDecoded);

            const result = verifyRefreshToken(mockToken);

            expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-refresh-secret');
            expect(result).toEqual(mockDecoded);
        });

        test('should return null for invalid refresh token', () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid refresh token');
            });

            const result = verifyRefreshToken('invalid.refresh.token');

            expect(result).toBeNull();
        });
    });

    describe('decode', () => {
        test('should decode token without verification', () => {
            jwt.decode.mockReturnValue(mockDecoded);

            const result = decode(mockToken);

            expect(jwt.decode).toHaveBeenCalledWith(mockToken);
            expect(result).toEqual(mockDecoded);
        });

        test('should return null for malformed token', () => {
            jwt.decode.mockReturnValue(null);

            const result = decode('malformed.token');

            expect(result).toBeNull();
        });
    });
});