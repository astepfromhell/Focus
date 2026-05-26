const { toUserDto } = require('../../../src/utils/user.util');

describe('User Utility Functions', () => {
    describe('toUserDto', () => {
        test('should convert user object to DTO with all fields', () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                avatar_url: 'https://example.com/avatar.jpg',
                email_verified: 1, // 数据库中可能是 1/0
                created_at: '2024-01-01T00:00:00.000Z',
                updated_at: '2024-01-02T00:00:00.000Z',
                last_login_at: '2024-01-03T00:00:00.000Z'
            };

            const result = toUserDto(mockUser);

            expect(result).toEqual({
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                avatarUrl: 'https://example.com/avatar.jpg',
                emailVerified: true, // 应该转换为布尔值
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z',
                lastLoginAt: '2024-01-03T00:00:00.000Z'
            });
        });

        test('should handle null email_verified gracefully', () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                email_verified: null
            };

            const result = toUserDto(mockUser);

            expect(result.emailVerified).toBe(false);
        });

        test('should handle undefined email_verified gracefully', () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com'
                // email_verified is undefined
            };

            const result = toUserDto(mockUser);

            expect(result.emailVerified).toBe(false);
        });

        test('should handle empty user object gracefully', () => {
            const result = toUserDto();

            expect(result).toEqual({
                id: undefined,
                username: undefined,
                email: undefined,
                avatarUrl: undefined,
                emailVerified: false, // !!undefined = false
                createdAt: undefined,
                updatedAt: undefined,
                lastLoginAt: undefined
            });
        });

        test('should convert database 0/1 to boolean', () => {
            const userWithZero = { email_verified: 0 };
            const userWithOne = { email_verified: 1 };
            const userWithTrue = { email_verified: true };
            const userWithFalse = { email_verified: false };

            expect(toUserDto(userWithZero).emailVerified).toBe(false);
            expect(toUserDto(userWithOne).emailVerified).toBe(true);
            expect(toUserDto(userWithTrue).emailVerified).toBe(true);
            expect(toUserDto(userWithFalse).emailVerified).toBe(false);
        });

        test('should handle partial user data', () => {
            const partialUser = {
                id: 1,
                username: 'testuser'
                // missing other fields
            };

            const result = toUserDto(partialUser);

            expect(result.id).toBe(1);
            expect(result.username).toBe('testuser');
            expect(result.email).toBeUndefined();
            expect(result.emailVerified).toBe(false);
        });
    });
});