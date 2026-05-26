const authController = require('../../../src/controllers/auth.controller');
const authService = require('../../../src/services/auth.service');
const response = require('../../../src/utils/response.util');
const { verifyEmailSchema } = require('../../../src/validators/auth.validator');

// Mock dependencies
jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/utils/response.util');
jest.mock('../../../src/validators/auth.validator');

describe('Auth Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request
        req = {
            body: {},
            query: {},
            userId: 'user-123'
        };

        // Setup mock response
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        // Setup mock next function
        next = jest.fn();

        // Mock response.util methods
        response.success = jest.fn().mockReturnValue({
            status: 200,
            data: {},
            message: 'Success'
        });

        response.error = jest.fn().mockReturnValue({
            status: 400,
            message: 'Error',
            code: 'ERROR'
        });
    });

    describe('register', () => {
        it('should register user successfully', async () => {
            const mockData = {
                user: { id: 'user-123', email: 'test@example.com' },
                tokens: { access: 'access-token', refresh: 'refresh-token' }
            };
            authService.registerUser.mockResolvedValue(mockData);

            await authController.register(req, res, next);

            expect(authService.registerUser).toHaveBeenCalledWith(req.body);
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '注册成功'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when registration fails', async () => {
            const error = new Error('Registration failed');
            authService.registerUser.mockRejectedValue(error);

            await authController.register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should login user successfully', async () => {
            const mockData = {
                user: { id: 'user-123', email: 'test@example.com' },
                tokens: { access: 'access-token', refresh: 'refresh-token' }
            };
            authService.loginUser.mockResolvedValue(mockData);

            await authController.login(req, res, next);

            expect(authService.loginUser).toHaveBeenCalledWith(req.body);
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '登录成功'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when login fails', async () => {
            const error = new Error('Login failed');
            authService.loginUser.mockRejectedValue(error);

            await authController.login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should logout user successfully', async () => {
            req.body = { refreshToken: 'refresh-token-123' };
            authService.logoutUser.mockResolvedValue(true);

            await authController.logout(req, res, next);

            expect(authService.logoutUser).toHaveBeenCalledWith(
                'user-123',
                'refresh-token-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { loggedOut: true },
                '退出成功'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when logout fails', async () => {
            req.body = { refreshToken: 'refresh-token-123' };
            const error = new Error('Logout failed');
            authService.logoutUser.mockRejectedValue(error);

            await authController.logout(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('refreshToken', () => {
        it('should refresh tokens successfully', async () => {
            req.body = { refreshToken: 'refresh-token-123' };
            const mockData = {
                access: 'new-access-token',
                refresh: 'new-refresh-token'
            };
            authService.refreshTokens.mockResolvedValue(mockData);

            await authController.refreshToken(req, res, next);

            expect(authService.refreshTokens).toHaveBeenCalledWith(
                'refresh-token-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '刷新成功'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when refresh fails', async () => {
            req.body = { refreshToken: 'refresh-token-123' };
            const error = new Error('Refresh failed');
            authService.refreshTokens.mockRejectedValue(error);

            await authController.refreshToken(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('forgotPassword', () => {
        it('should send reset password link successfully', async () => {
            req.body = { email: 'test@example.com' };
            const mockResult = { sent: true };
            authService.forgotPassword.mockResolvedValue(mockResult);

            await authController.forgotPassword(req, res, next);

            expect(authService.forgotPassword).toHaveBeenCalledWith(
                'test@example.com'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockResult,
                '如果邮箱存在，我们已发送重置链接'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when forgot password fails', async () => {
            req.body = { email: 'test@example.com' };
            const error = new Error('Forgot password failed');
            authService.forgotPassword.mockRejectedValue(error);

            await authController.forgotPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            req.body = {
                token: 'reset-token-123',
                newPassword: 'newPassword123'
            };
            authService.resetPassword.mockResolvedValue(true);

            await authController.resetPassword(req, res, next);

            expect(authService.resetPassword).toHaveBeenCalledWith(
                'reset-token-123',
                'newPassword123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { reset: true },
                '密码已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when reset password fails', async () => {
            req.body = {
                token: 'reset-token-123',
                newPassword: 'newPassword123'
            };
            const error = new Error('Reset password failed');
            authService.resetPassword.mockRejectedValue(error);

            await authController.resetPassword(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('verifyEmail', () => {
        it('should verify email successfully with valid token', async () => {
            req.query = { token: 'email-verification-token' };
            const mockUser = { id: 'user-123', email: 'test@example.com' };

            // Mock validator
            verifyEmailSchema.validate.mockReturnValue({
                error: null,
                value: { token: 'email-verification-token' }
            });

            // Mock service
            authService.verifyEmail.mockResolvedValue(mockUser);

            await authController.verifyEmail(req, res, next);

            expect(verifyEmailSchema.validate).toHaveBeenCalledWith(req.query);
            expect(authService.verifyEmail).toHaveBeenCalledWith(
                'email-verification-token'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { user: mockUser },
                '邮箱验证成功'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return validation error when token is invalid', async () => {
            req.query = { token: '' };

            // Mock validator to return error
            verifyEmailSchema.validate.mockReturnValue({
                error: { message: 'Token is required' },
                value: null
            });

            await authController.verifyEmail(req, res, next);

            expect(verifyEmailSchema.validate).toHaveBeenCalledWith(req.query);
            expect(response.error).toHaveBeenCalledWith(
                res,
                'Token is required',
                'VALIDATION_ERROR',
                400
            );
            expect(authService.verifyEmail).not.toHaveBeenCalled();
        });

        it('should call next with error when verification fails', async () => {
            req.query = { token: 'email-verification-token' };

            // Mock validator
            verifyEmailSchema.validate.mockReturnValue({
                error: null,
                value: { token: 'email-verification-token' }
            });

            // Mock service to throw error
            const error = new Error('Verification failed');
            authService.verifyEmail.mockRejectedValue(error);

            await authController.verifyEmail(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('checkUsername', () => {
        it('should return success when username is available', async () => {
            req.query = { username: 'newuser123' };
            authService.checkUsernameExists.mockResolvedValue(false);

            await authController.checkUsername(req, res, next);

            expect(authService.checkUsernameExists).toHaveBeenCalledWith(
                'newuser123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { available: true, username: 'newuser123' },
                '用户名可用'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return success when username is not available', async () => {
            req.query = { username: 'existinguser' };
            authService.checkUsernameExists.mockResolvedValue(true);

            await authController.checkUsername(req, res, next);

            expect(authService.checkUsernameExists).toHaveBeenCalledWith(
                'existinguser'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { available: false, username: 'existinguser' },
                '该用户名已被占用'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return validation error when username is too short', async () => {
            req.query = { username: 'abc' };

            await authController.checkUsername(req, res, next);

            expect(response.error).toHaveBeenCalledWith(
                res,
                '用户名至少需要4个字符',
                'VALIDATION_ERROR',
                400
            );
            expect(authService.checkUsernameExists).not.toHaveBeenCalled();
        });

        it('should return validation error when username is too long', async () => {
            req.query = { username: 'thisisaverylongusernameexceedinglimit' };

            await authController.checkUsername(req, res, next);

            expect(response.error).toHaveBeenCalledWith(
                res,
                '用户名不能超过20个字符',
                'VALIDATION_ERROR',
                400
            );
            expect(authService.checkUsernameExists).not.toHaveBeenCalled();
        });

        it('should trim username before checking', async () => {
            req.query = { username: '  testuser  ' };
            authService.checkUsernameExists.mockResolvedValue(false);

            await authController.checkUsername(req, res, next);

            expect(authService.checkUsernameExists).toHaveBeenCalledWith(
                'testuser'
            );
        });

        it('should call next with error when service fails', async () => {
            req.query = { username: 'testuser' };
            const error = new Error('Service failed');
            authService.checkUsernameExists.mockRejectedValue(error);

            await authController.checkUsername(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('checkEmail', () => {
        it('should return success when email is available', async () => {
            req.query = { email: 'newuser@example.com' };
            authService.checkEmailExists.mockResolvedValue(false);

            await authController.checkEmail(req, res, next);

            expect(authService.checkEmailExists).toHaveBeenCalledWith(
                'newuser@example.com'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { available: true, email: 'newuser@example.com' },
                '邮箱可用'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return success when email is not available', async () => {
            req.query = { email: 'existing@example.com' };
            authService.checkEmailExists.mockResolvedValue(true);

            await authController.checkEmail(req, res, next);

            expect(authService.checkEmailExists).toHaveBeenCalledWith(
                'existing@example.com'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { available: false, email: 'existing@example.com' },
                '该邮箱已被注册'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return validation error when email is invalid', async () => {
            req.query = { email: 'invalid-email' };

            await authController.checkEmail(req, res, next);

            expect(response.error).toHaveBeenCalledWith(
                res,
                '请输入有效的邮箱地址',
                'VALIDATION_ERROR',
                400
            );
            expect(authService.checkEmailExists).not.toHaveBeenCalled();
        });

        it('should trim and lowercase email before checking', async () => {
            req.query = { email: '  TestUser@Example.com  ' };
            authService.checkEmailExists.mockResolvedValue(false);

            await authController.checkEmail(req, res, next);

            expect(authService.checkEmailExists).toHaveBeenCalledWith(
                'testuser@example.com'
            );
        });

        it('should call next with error when service fails', async () => {
            req.query = { email: 'test@example.com' };
            const error = new Error('Service failed');
            authService.checkEmailExists.mockRejectedValue(error);

            await authController.checkEmail(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});