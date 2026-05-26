const {
    registerSchema,
    loginSchema,
    logoutSchema,
    refreshSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema
} = require('../../../src/validators/auth.validator');

describe('Auth Validators', () => {
    describe('registerSchema', () => {
        test('should validate correct registration data', () => {
            const validData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };

            const { error, value } = registerSchema.validate(validData);

            expect(error).toBeUndefined();
            expect(value).toEqual({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });
        });

        test('should reject registration without username', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const { error } = registerSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['username']);
            expect(error.details[0].type).toBe('any.required');
        });

        test('should reject registration with invalid email', () => {
            const invalidData = {
                username: 'testuser',
                email: 'invalid-email',
                password: 'password123'
            };

            const { error } = registerSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['email']);
            expect(error.details[0].type).toBe('string.email');
        });

        test('should reject registration with short password', () => {
            const invalidData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123' // Too short
            };

            const { error } = registerSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['password']);
        });

        test('should reject registration with too long username', () => {
            const invalidData = {
                username: 'a'.repeat(51), // 51 characters, max is 50
                email: 'test@example.com',
                password: 'password123'
            };

            const { error } = registerSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['username']);
        });
    });

    describe('loginSchema', () => {
        test('should validate correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const { error } = loginSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject login without email', () => {
            const invalidData = {
                password: 'password123'
            };

            const { error } = loginSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['email']);
        });

        test('should reject login without password', () => {
            const invalidData = {
                email: 'test@example.com'
            };

            const { error } = loginSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['password']);
        });

        test('should reject login with invalid email format', () => {
            const invalidData = {
                email: 'invalid-email',
                password: 'password123'
            };

            const { error } = loginSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['email']);
        });
    });

    describe('logoutSchema', () => {
        test('should validate correct logout data', () => {
            const validData = {
                refreshToken: 'refresh_token_here_at_least_10_chars'
            };

            const { error } = logoutSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject logout with short refresh token', () => {
            const invalidData = {
                refreshToken: 'short' // Less than 10 characters
            };

            const { error } = logoutSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['refreshToken']);
        });
    });

    describe('refreshSchema', () => {
        test('should validate correct refresh token data', () => {
            const validData = {
                refreshToken: 'refresh_token_here_at_least_10_chars'
            };

            const { error } = refreshSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('forgotPasswordSchema', () => {
        test('should validate correct forgot password data', () => {
            const validData = {
                email: 'test@example.com'
            };

            const { error } = forgotPasswordSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('resetPasswordSchema', () => {
        test('should validate correct reset password data', () => {
            const validData = {
                token: 'reset_token_here_at_least_10_chars',
                newPassword: 'newPassword123'
            };

            const { error } = resetPasswordSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject when newPassword is too short', () => {
            const invalidData = {
                token: 'reset_token_here_at_least_10_chars',
                newPassword: '123' // Too short
            };

            const { error } = resetPasswordSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['newPassword']);
        });
    });

    describe('verifyEmailSchema', () => {
        test('should validate correct verify email data', () => {
            const validData = {
                token: 'verify_token_here_at_least_10_chars'
            };

            const { error } = verifyEmailSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });
});