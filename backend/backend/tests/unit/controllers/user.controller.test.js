const userController = require('../../../src/controllers/user.controller');
const userService = require('../../../src/services/user.service');
const response = require('../../../src/utils/response.util');

// Mock dependencies
jest.mock('../../../src/services/user.service');
jest.mock('../../../src/utils/response.util');

describe('User Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request
        req = {
            body: {},
            query: {},
            params: {},
            userId: 'user-123',
            file: null
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
    });

    describe('me', () => {
        it('should get current user profile successfully', async () => {
            const mockProfile = {
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    name: 'Test User',
                    avatar_url: '/uploads/avatar.jpg'
                },
                settings: {
                    theme: 'light',
                    notifications: true
                }
            };

            userService.getProfile.mockResolvedValue(mockProfile);

            await userController.me(req, res, next);

            expect(userService.getProfile).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockProfile,
                '获取当前用户'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when profile retrieval fails', async () => {
            const error = new Error('Profile retrieval failed');
            userService.getProfile.mockRejectedValue(error);

            await userController.me(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'updated@example.com',
                name: 'Updated User',
                avatar_url: '/uploads/avatar.jpg'
            };

            req.body = { name: 'Updated User', email: 'updated@example.com' };
            userService.updateProfile.mockResolvedValue(mockUser);

            await userController.updateProfile(req, res, next);

            expect(userService.updateProfile).toHaveBeenCalledWith(
                'user-123',
                { name: 'Updated User', email: 'updated@example.com' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { user: mockUser },
                '用户信息已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when update fails', async () => {
            req.body = { name: 'Updated User' };
            const error = new Error('Update failed');
            userService.updateProfile.mockRejectedValue(error);

            await userController.updateProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            req.body = {
                oldPassword: 'oldPassword123',
                newPassword: 'newPassword123'
            };
            userService.changePassword.mockResolvedValue(true);

            await userController.changePassword(req, res, next);

            expect(userService.changePassword).toHaveBeenCalledWith(
                'user-123',
                'oldPassword123',
                'newPassword123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { changed: true },
                '密码已修改'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when password change fails', async () => {
            req.body = {
                oldPassword: 'oldPassword123',
                newPassword: 'newPassword123'
            };
            const error = new Error('Password change failed');
            userService.changePassword.mockRejectedValue(error);

            await userController.changePassword(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('deleteAccount', () => {
        it('should delete account successfully', async () => {
            req.body = { password: 'correctPassword123' };
            userService.deleteAccount.mockResolvedValue(true);

            await userController.deleteAccount(req, res, next);

            expect(userService.deleteAccount).toHaveBeenCalledWith(
                'user-123',
                'correctPassword123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { deleted: true },
                '账户已删除'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when account deletion fails', async () => {
            req.body = { password: 'wrongPassword' };
            const error = new Error('Account deletion failed');
            userService.deleteAccount.mockRejectedValue(error);

            await userController.deleteAccount(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('uploadAvatar', () => {
        it('should upload avatar successfully', async () => {
            const mockFile = {
                path: '/tmp/uploads/avatar.jpg',
                filename: 'avatar.jpg'
            };

            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                avatar_url: '/uploads/avatar.jpg'
            };

            req.file = mockFile;
            userService.uploadAvatar.mockResolvedValue(mockUser);

            await userController.uploadAvatar(req, res, next);

            expect(userService.uploadAvatar).toHaveBeenCalledWith(
                'user-123',
                mockFile
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { user: mockUser },
                '头像已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when avatar upload fails', async () => {
            req.file = { path: '/tmp/uploads/avatar.jpg' };
            const error = new Error('Avatar upload failed');
            userService.uploadAvatar.mockRejectedValue(error);

            await userController.uploadAvatar(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });

        it('should handle null file gracefully', async () => {
            req.file = null;
            userService.uploadAvatar.mockRejectedValue(new Error('File is required'));

            await userController.uploadAvatar(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('getSettings', () => {
        it('should get user settings successfully', async () => {
            const mockSettings = {
                theme: 'dark',
                notifications: true,
                language: 'en',
                pomodoroDuration: 25,
                shortBreakDuration: 5
            };

            userService.getSettings.mockResolvedValue(mockSettings);

            await userController.getSettings(req, res, next);

            expect(userService.getSettings).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                { settings: mockSettings },
                '用户设置'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when settings retrieval fails', async () => {
            const error = new Error('Settings retrieval failed');
            userService.getSettings.mockRejectedValue(error);

            await userController.getSettings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateSettings', () => {
        it('should update user settings successfully', async () => {
            const mockUpdatedSettings = {
                theme: 'dark',
                notifications: false,
                language: 'en'
            };

            req.body = { theme: 'dark', notifications: false };
            userService.updateSettings.mockResolvedValue(mockUpdatedSettings);

            await userController.updateSettings(req, res, next);

            expect(userService.updateSettings).toHaveBeenCalledWith(
                'user-123',
                { theme: 'dark', notifications: false }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { settings: mockUpdatedSettings },
                '设置已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when settings update fails', async () => {
            req.body = { theme: 'dark' };
            const error = new Error('Settings update failed');
            userService.updateSettings.mockRejectedValue(error);

            await userController.updateSettings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateThemeSettings', () => {
        it('should update theme settings successfully', async () => {
            const mockUpdatedSettings = {
                theme: 'dark',
                primaryColor: '#3b82f6',
                fontSize: 'medium'
            };

            req.body = { theme: 'dark', primaryColor: '#3b82f6' };
            userService.updateSettings.mockResolvedValue(mockUpdatedSettings);

            await userController.updateThemeSettings(req, res, next);

            expect(userService.updateSettings).toHaveBeenCalledWith(
                'user-123',
                { theme: 'dark', primaryColor: '#3b82f6' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { settings: mockUpdatedSettings },
                '主题已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when theme settings update fails', async () => {
            req.body = { theme: 'dark' };
            const error = new Error('Theme settings update failed');
            userService.updateSettings.mockRejectedValue(error);

            await userController.updateThemeSettings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updatePomodoroSettings', () => {
        it('should update pomodoro settings successfully', async () => {
            const mockUpdatedSettings = {
                pomodoroDuration: 30,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                autoStartBreaks: true
            };

            req.body = { pomodoroDuration: 30, autoStartBreaks: true };
            userService.updateSettings.mockResolvedValue(mockUpdatedSettings);

            await userController.updatePomodoroSettings(req, res, next);

            expect(userService.updateSettings).toHaveBeenCalledWith(
                'user-123',
                { pomodoroDuration: 30, autoStartBreaks: true }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { settings: mockUpdatedSettings },
                '番茄钟设置已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when pomodoro settings update fails', async () => {
            req.body = { pomodoroDuration: 30 };
            const error = new Error('Pomodoro settings update failed');
            userService.updateSettings.mockRejectedValue(error);

            await userController.updatePomodoroSettings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateNotificationSettings', () => {
        it('should update notification settings successfully', async () => {
            const mockUpdatedSettings = {
                notifications: true,
                emailNotifications: false,
                pushNotifications: true,
                soundEnabled: true
            };

            req.body = { notifications: true, emailNotifications: false };
            userService.updateSettings.mockResolvedValue(mockUpdatedSettings);

            await userController.updateNotificationSettings(req, res, next);

            expect(userService.updateSettings).toHaveBeenCalledWith(
                'user-123',
                { notifications: true, emailNotifications: false }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { settings: mockUpdatedSettings },
                '通知设置已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when notification settings update fails', async () => {
            req.body = { notifications: true };
            const error = new Error('Notification settings update failed');
            userService.updateSettings.mockRejectedValue(error);

            await userController.updateNotificationSettings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('resetSettings', () => {
        it('should reset user settings successfully', async () => {
            const mockResetSettings = {
                theme: 'light',
                notifications: true,
                language: 'en',
                pomodoroDuration: 25,
                shortBreakDuration: 5
            };

            userService.resetSettings.mockResolvedValue(mockResetSettings);

            await userController.resetSettings(req, res, next);

            expect(userService.resetSettings).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                { settings: mockResetSettings },
                '设置已重置'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when resetting settings fails', async () => {
            const error = new Error('Reset settings failed');
            userService.resetSettings.mockRejectedValue(error);

            await userController.resetSettings(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('consistency between update settings methods', () => {
        it('should all call userService.updateSettings with the same pattern', async () => {
            const mockSettings = { theme: 'dark' };
            userService.updateSettings.mockResolvedValue(mockSettings);

            // Test updateSettings
            req.body = { theme: 'dark' };
            await userController.updateSettings(req, res, next);
            expect(userService.updateSettings).toHaveBeenCalledWith('user-123', { theme: 'dark' });

            // Reset mock
            userService.updateSettings.mockClear();

            // Test updateThemeSettings
            req.body = { theme: 'dark' };
            await userController.updateThemeSettings(req, res, next);
            expect(userService.updateSettings).toHaveBeenCalledWith('user-123', { theme: 'dark' });

            // Reset mock
            userService.updateSettings.mockClear();

            // Test updatePomodoroSettings
            req.body = { pomodoroDuration: 30 };
            await userController.updatePomodoroSettings(req, res, next);
            expect(userService.updateSettings).toHaveBeenCalledWith('user-123', { pomodoroDuration: 30 });

            // Reset mock
            userService.updateSettings.mockClear();

            // Test updateNotificationSettings
            req.body = { notifications: true };
            await userController.updateNotificationSettings(req, res, next);
            expect(userService.updateSettings).toHaveBeenCalledWith('user-123', { notifications: true });
        });
    });
});