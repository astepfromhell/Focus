const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const authService = require('../../../src/services/auth.service');
const jwtUtil = require('../../../src/utils/jwt.util');
const { toUserDto } = require('../../../src/utils/user.util');
const User = require('../../../src/models/User');
const UserSettings = require('../../../src/models/UserSettings');
const UserToken = require('../../../src/models/UserToken');

// Mock all dependencies
jest.mock('crypto');
jest.mock('bcryptjs');
jest.mock('../../../src/utils/jwt.util');
jest.mock('../../../src/utils/user.util');
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/UserSettings');
jest.mock('../../../src/models/UserToken');

describe('Auth Service', () => {
    let originalEnv;

    beforeEach(() => {
        jest.clearAllMocks();
        originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    describe('registerUser', () => {
        const mockUserData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        };

        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            email_verified: false,
        };

        const mockTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        const mockUserDto = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        };

        beforeEach(() => {
            User.findByEmail.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed-password');
            User.create.mockResolvedValue({ id: 1 });
            UserSettings.createDefault.mockResolvedValue({});
            User.findById.mockResolvedValue(mockUser);
            jwtUtil.generateAccessToken.mockReturnValue(mockTokens.accessToken);
            jwtUtil.generateRefreshToken.mockReturnValue(mockTokens.refreshToken);
            jwtUtil.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
            UserToken.create.mockResolvedValue({});
            crypto.randomBytes.mockReturnValue({ toString: () => 'mock-verify-token' });
            toUserDto.mockReturnValue(mockUserDto);
        });

        test('should register a new user successfully', async () => {
            const result = await authService.registerUser(mockUserData);

            expect(User.findByEmail).toHaveBeenCalledWith(mockUserData.email);
            expect(bcrypt.hash).toHaveBeenCalledWith(mockUserData.password, 10);
            expect(User.create).toHaveBeenCalledWith({
                username: mockUserData.username,
                email: mockUserData.email,
                password_hash: 'hashed-password',
            });
            expect(UserSettings.createDefault).toHaveBeenCalledWith(1);
            expect(result).toEqual({
                token: mockTokens.accessToken,
                refreshToken: mockTokens.refreshToken,
                user: mockUserDto,
                devVerificationToken: 'mock-verify-token',
            });
        });

        test('should throw error if email already exists', async () => {
            User.findByEmail.mockResolvedValue(mockUser);

            await expect(authService.registerUser(mockUserData)).rejects.toEqual({
                status: 400,
                message: 'Email already registered',
                code: 'EMAIL_EXISTS',
            });

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(User.create).not.toHaveBeenCalled();
        });

        test('should not include devVerificationToken in production', async () => {
            process.env.NODE_ENV = 'production';

            const result = await authService.registerUser(mockUserData);

            expect(result.devVerificationToken).toBeUndefined();
        });

        test('should create tokens and verification token', async () => {
            await authService.registerUser(mockUserData);

            expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith({
                id: mockUser.id,
                email: mockUser.email,
            });
            expect(jwtUtil.generateRefreshToken).toHaveBeenCalledWith({ id: mockUser.id });
            expect(UserToken.create).toHaveBeenCalledTimes(2); // refresh token + verify token
        });
    });

    describe('loginUser', () => {
        const loginData = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            password_hash: 'hashed-password',
        };

        const mockTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
        };

        const mockUserDto = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        };

        beforeEach(() => {
            User.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            User.updateLastLogin.mockResolvedValue({});
            jwtUtil.generateAccessToken.mockReturnValue(mockTokens.accessToken);
            jwtUtil.generateRefreshToken.mockReturnValue(mockTokens.refreshToken);
            jwtUtil.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
            UserToken.create.mockResolvedValue({});
            toUserDto.mockReturnValue(mockUserDto);
        });

        test('should login user successfully', async () => {
            const result = await authService.loginUser(loginData);

            expect(User.findByEmail).toHaveBeenCalledWith(loginData.email);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password_hash);
            expect(User.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual({
                token: mockTokens.accessToken,
                refreshToken: mockTokens.refreshToken,
                user: mockUserDto,
            });
        });

        test('should throw error if user not found', async () => {
            User.findByEmail.mockResolvedValue(null);

            await expect(authService.loginUser(loginData)).rejects.toEqual({
                status: 400,
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS',
            });

            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        test('should throw error if password is incorrect', async () => {
            bcrypt.compare.mockResolvedValue(false);

            await expect(authService.loginUser(loginData)).rejects.toEqual({
                status: 400,
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS',
            });

            expect(User.updateLastLogin).not.toHaveBeenCalled();
        });
    });

    describe('logoutUser', () => {
        const userId = 1;
        const refreshToken = 'mock-refresh-token';

        test('should logout user successfully', async () => {
            const mockTokenRecord = {
                id: 1,
                user_id: userId,
                token: refreshToken,
            };

            UserToken.findValid.mockResolvedValue(mockTokenRecord);
            UserToken.consume.mockResolvedValue({});

            await authService.logoutUser(userId, refreshToken);

            expect(UserToken.findValid).toHaveBeenCalledWith(refreshToken, 'refresh');
            expect(UserToken.consume).toHaveBeenCalledWith(mockTokenRecord.id);
        });

        test('should throw error if token not found', async () => {
            UserToken.findValid.mockResolvedValue(null);

            await expect(authService.logoutUser(userId, refreshToken)).rejects.toEqual({
                status: 400,
                message: 'Refresh token invalid',
                code: 'INVALID_REFRESH',
            });

            expect(UserToken.consume).not.toHaveBeenCalled();
        });

        test('should throw error if token belongs to different user', async () => {
            const mockTokenRecord = {
                id: 1,
                user_id: 2, // different user
                token: refreshToken,
            };

            UserToken.findValid.mockResolvedValue(mockTokenRecord);

            await expect(authService.logoutUser(userId, refreshToken)).rejects.toEqual({
                status: 400,
                message: 'Refresh token invalid',
                code: 'INVALID_REFRESH',
            });

            expect(UserToken.consume).not.toHaveBeenCalled();
        });
    });

    describe('refreshTokens', () => {
        const refreshToken = 'mock-refresh-token';
        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        };

        const mockTokenRecord = {
            id: 1,
            user_id: 1,
            token: refreshToken,
        };

        const mockNewTokens = {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
        };

        const mockUserDto = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
        };

        beforeEach(() => {
            jwtUtil.verifyRefreshToken.mockReturnValue({ id: 1 });
            UserToken.findValid.mockResolvedValue(mockTokenRecord);
            User.findById.mockResolvedValue(mockUser);
            UserToken.consume.mockResolvedValue({});
            jwtUtil.generateAccessToken.mockReturnValue(mockNewTokens.accessToken);
            jwtUtil.generateRefreshToken.mockReturnValue(mockNewTokens.refreshToken);
            jwtUtil.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
            UserToken.create.mockResolvedValue({});
            toUserDto.mockReturnValue(mockUserDto);
        });

        test('should refresh tokens successfully', async () => {
            const result = await authService.refreshTokens(refreshToken);

            expect(jwtUtil.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
            expect(UserToken.findValid).toHaveBeenCalledWith(refreshToken, 'refresh');
            expect(User.findById).toHaveBeenCalledWith(1);
            expect(UserToken.consume).toHaveBeenCalledWith(mockTokenRecord.id);
            expect(result).toEqual({
                token: mockNewTokens.accessToken,
                refreshToken: mockNewTokens.refreshToken,
                user: mockUserDto,
            });
        });

        test('should throw error if token verification fails', async () => {
            jwtUtil.verifyRefreshToken.mockReturnValue(null);

            await expect(authService.refreshTokens(refreshToken)).rejects.toEqual({
                status: 401,
                message: 'Invalid refresh token',
                code: 'INVALID_REFRESH',
            });

            expect(UserToken.findValid).not.toHaveBeenCalled();
        });

        test('should throw error if token record not found', async () => {
            UserToken.findValid.mockResolvedValue(null);

            await expect(authService.refreshTokens(refreshToken)).rejects.toEqual({
                status: 401,
                message: 'Refresh token expired or revoked',
                code: 'INVALID_REFRESH',
            });

            expect(User.findById).not.toHaveBeenCalled();
        });

        test('should throw error if user not found', async () => {
            User.findById.mockResolvedValue(null);

            await expect(authService.refreshTokens(refreshToken)).rejects.toEqual({
                status: 404,
                message: 'User not found',
                code: 'NOT_FOUND',
            });

            expect(UserToken.consume).not.toHaveBeenCalled();
        });

        test('should throw error if token belongs to different user', async () => {
            const mockTokenRecord = {
                id: 1,
                user_id: 2, // different user
                token: refreshToken,
            };

            UserToken.findValid.mockResolvedValue(mockTokenRecord);

            await expect(authService.refreshTokens(refreshToken)).rejects.toEqual({
                status: 401,
                message: 'Refresh token invalid',
                code: 'INVALID_REFRESH',
            });

            expect(UserToken.consume).not.toHaveBeenCalled();
        });
    });

    describe('forgotPassword', () => {
        const email = 'test@example.com';

        beforeEach(() => {
            crypto.randomBytes.mockReturnValue({ toString: () => 'mock-reset-token' });
            UserToken.create.mockResolvedValue({});
        });

        test('should send password reset for existing user', async () => {
            const mockUser = { id: 1, email };
            User.findByEmail.mockResolvedValue(mockUser);

            const result = await authService.forgotPassword(email);

            expect(User.findByEmail).toHaveBeenCalledWith(email);
            expect(UserToken.create).toHaveBeenCalled();
            expect(result).toEqual({
                delivered: true,
                devResetToken: 'mock-reset-token',
            });
        });

        test('should return delivered true even if user not found', async () => {
            User.findByEmail.mockResolvedValue(null);

            const result = await authService.forgotPassword(email);

            expect(result).toEqual({ delivered: true });
            expect(UserToken.create).not.toHaveBeenCalled();
        });

        test('should not include devResetToken in production', async () => {
            process.env.NODE_ENV = 'production';
            const mockUser = { id: 1, email };
            User.findByEmail.mockResolvedValue(mockUser);

            const result = await authService.forgotPassword(email);

            expect(result.devResetToken).toBeUndefined();
        });
    });

    describe('resetPassword', () => {
        const token = 'mock-reset-token';
        const newPassword = 'newpassword123';

        const mockTokenRecord = {
            id: 1,
            user_id: 1,
            token,
            type: 'password_reset',
        };

        const mockUser = {
            id: 1,
            email: 'test@example.com',
        };

        beforeEach(() => {
            UserToken.findValid.mockResolvedValue(mockTokenRecord);
            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue('new-hashed-password');
            User.updatePassword.mockResolvedValue({});
            UserToken.consume.mockResolvedValue({});
            UserToken.revokeByUser.mockResolvedValue({});
        });

        test('should reset password successfully', async () => {
            await authService.resetPassword(token, newPassword);

            expect(UserToken.findValid).toHaveBeenCalledWith(token, 'password_reset');
            expect(User.findWithPasswordById).toHaveBeenCalledWith(mockTokenRecord.user_id);
            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(User.updatePassword).toHaveBeenCalledWith(mockUser.id, 'new-hashed-password');
            expect(UserToken.consume).toHaveBeenCalledWith(mockTokenRecord.id);
            expect(UserToken.revokeByUser).toHaveBeenCalledWith(mockUser.id, 'refresh');
        });

        test('should throw error if token not found or expired', async () => {
            UserToken.findValid.mockResolvedValue(null);

            await expect(authService.resetPassword(token, newPassword)).rejects.toEqual({
                status: 400,
                message: 'Token invalid or expired',
                code: 'INVALID_TOKEN',
            });

            expect(User.findWithPasswordById).not.toHaveBeenCalled();
        });

        test('should throw error if user not found', async () => {
            User.findWithPasswordById.mockResolvedValue(null);

            await expect(authService.resetPassword(token, newPassword)).rejects.toEqual({
                status: 404,
                message: 'User not found',
                code: 'NOT_FOUND',
            });

            expect(User.updatePassword).not.toHaveBeenCalled();
        });
    });

    describe('verifyEmail', () => {
        const token = 'mock-verify-token';

        const mockTokenRecord = {
            id: 1,
            user_id: 1,
            token,
            type: 'verify_email',
        };

        const mockUser = {
            id: 1,
            email: 'test@example.com',
            email_verified: true,
        };

        const mockUserDto = {
            id: 1,
            email: 'test@example.com',
        };

        beforeEach(() => {
            UserToken.findValid.mockResolvedValue(mockTokenRecord);
            User.setEmailVerified.mockResolvedValue({});
            UserToken.consume.mockResolvedValue({});
            User.findById.mockResolvedValue(mockUser);
            toUserDto.mockReturnValue(mockUserDto);
        });

        test('should verify email successfully', async () => {
            const result = await authService.verifyEmail(token);

            expect(UserToken.findValid).toHaveBeenCalledWith(token, 'verify_email');
            expect(User.setEmailVerified).toHaveBeenCalledWith(mockTokenRecord.user_id);
            expect(UserToken.consume).toHaveBeenCalledWith(mockTokenRecord.id);
            expect(User.findById).toHaveBeenCalledWith(mockTokenRecord.user_id);
            expect(result).toEqual(mockUserDto);
        });

        test('should throw error if token not found or expired', async () => {
            UserToken.findValid.mockResolvedValue(null);

            await expect(authService.verifyEmail(token)).rejects.toEqual({
                status: 400,
                message: 'Verification link invalid',
                code: 'INVALID_TOKEN',
            });

            expect(User.setEmailVerified).not.toHaveBeenCalled();
        });
    });

    describe('checkUsernameExists', () => {
        const username = 'testuser';

        test('should return true if username exists', async () => {
            User.findByUsername.mockResolvedValue({ id: 1, username });

            const result = await authService.checkUsernameExists(username);

            expect(User.findByUsername).toHaveBeenCalledWith(username);
            expect(result).toBe(true);
        });

        test('should return false if username does not exist', async () => {
            User.findByUsername.mockResolvedValue(null);

            const result = await authService.checkUsernameExists(username);

            expect(User.findByUsername).toHaveBeenCalledWith(username);
            expect(result).toBe(false);
        });
    });

    describe('checkEmailExists', () => {
        const email = 'test@example.com';

        test('should return true if email exists', async () => {
            User.findByEmail.mockResolvedValue({ id: 1, email });

            const result = await authService.checkEmailExists(email);

            expect(User.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(true);
        });

        test('should return false if email does not exist', async () => {
            User.findByEmail.mockResolvedValue(null);

            const result = await authService.checkEmailExists(email);

            expect(User.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toBe(false);
        });
    });
});
