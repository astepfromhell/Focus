const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const userService = require('../../../src/services/user.service');
const User = require('../../../src/models/User');
const UserSettings = require('../../../src/models/UserSettings');
const UserToken = require('../../../src/models/UserToken');
const { toUserDto } = require('../../../src/utils/user.util');

// Mock all dependencies
jest.mock('bcryptjs');
jest.mock('fs');
jest.mock('path');
jest.mock('../../../src/models/User');
jest.mock('../../../src/models/UserSettings');
jest.mock('../../../src/models/UserToken');
jest.mock('../../../src/utils/user.util');

describe('User Service', () => {
    // 在每个测试中重新定义 mock 数据，避免测试间污染
    const createMockUser = (overrides = {}) => ({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: '/uploads/avatar.jpg',
        password_hash: 'hashed_password_123',
        ...overrides
    });

    const createMockSettings = (overrides = {}) => ({
        id: 'settings-123',
        user_id: 'user-123',
        theme: 'light',
        notifications: true,
        language: 'en',
        ...overrides
    });

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock path module
        path.basename.mockImplementation((filePath) => {
            if (!filePath) return '';
            const parts = filePath.split('/');
            return parts[parts.length - 1];
        });

        path.resolve.mockImplementation((...args) => {
            return args.join('/');
        });

        // Mock fs module
        fs.promises = {
            unlink: jest.fn().mockResolvedValue(true)
        };

        // Mock process.env
        process.env.UPLOAD_DIR = 'uploads';
    });

    describe('getProfile', () => {
        it('should return user profile with settings when user exists', async () => {
            // 为这个测试创建独立的 mock 数据
            const mockUser = createMockUser();
            const mockSettings = createMockSettings();

            // 设置模拟返回
            User.findById.mockResolvedValue(mockUser);
            UserSettings.getByUserId.mockResolvedValue(mockSettings);

            // 模拟 toUserDto 返回
            toUserDto.mockReturnValue({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                avatar_url: mockUser.avatar_url
            });

            const result = await userService.getProfile('user-123');

            expect(User.findById).toHaveBeenCalledWith('user-123');
            expect(UserSettings.getByUserId).toHaveBeenCalledWith('user-123');
            expect(toUserDto).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual({
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    name: 'Test User', // 应该保持为原始值
                    avatar_url: '/uploads/avatar.jpg'
                },
                settings: mockSettings
            });
        });

        it('should create default settings if none exist', async () => {
            const mockUser = createMockUser();
            const mockSettings = createMockSettings();

            User.findById.mockResolvedValue(mockUser);
            UserSettings.getByUserId.mockResolvedValue(null);
            UserSettings.createDefault.mockResolvedValue(mockSettings);

            const result = await userService.getProfile('user-123');

            expect(UserSettings.createDefault).toHaveBeenCalledWith('user-123');
            expect(result.settings).toEqual(mockSettings);
        });

        it('should throw 404 error when user does not exist', async () => {
            User.findById.mockResolvedValue(null);

            await expect(userService.getProfile('non-existent'))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'User not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('updateProfile', () => {
        it('should update user profile successfully', async () => {
            const mockUser = createMockUser();
            // 创建更新后的用户，包含更新后的 email
            const updatedUser = {
                ...mockUser,
                name: 'Updated User',
                email: 'updated@example.com'
            };

            // 模拟不同方法的返回
            User.findByEmail.mockResolvedValue(null);
            User.updateById.mockResolvedValue(updatedUser);

            // 模拟 toUserDto 返回更新后的用户
            toUserDto.mockReturnValue({
                id: updatedUser.id,
                email: updatedUser.email,  // 应该返回更新后的 email
                name: updatedUser.name,
                avatar_url: updatedUser.avatar_url
            });

            const updateData = { name: 'Updated User', email: 'updated@example.com' };
            const result = await userService.updateProfile('user-123', updateData);

            expect(User.findByEmail).toHaveBeenCalledWith('updated@example.com');
            expect(User.updateById).toHaveBeenCalledWith('user-123', updateData);
            expect(result).toEqual({
                id: 'user-123',
                email: 'updated@example.com',  // 期望返回更新后的 email
                name: 'Updated User',
                avatar_url: '/uploads/avatar.jpg'
            });
        });

        it('should throw 400 error when email is already in use by another user', async () => {
            const mockUser = createMockUser();
            const anotherUser = { id: 'another-user', email: 'existing@example.com' };

            User.findByEmail.mockResolvedValue(anotherUser);

            await expect(userService.updateProfile('user-123', { email: 'existing@example.com' }))
                .rejects
                .toEqual({
                    status: 400,
                    message: 'Email already in use',
                    code: 'EMAIL_EXISTS'
                });
        });

        it('should allow updating email if it belongs to the same user', async () => {
            const mockUser = createMockUser();
            const sameUser = { id: 'user-123', email: 'same@example.com' };

            // 模拟更新后的用户
            const updatedUser = { ...mockUser, email: 'same@example.com' };

            User.findByEmail.mockResolvedValue(sameUser);
            User.updateById.mockResolvedValue(updatedUser);

            // 也需要模拟 toUserDto
            toUserDto.mockReturnValue({
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                avatar_url: updatedUser.avatar_url
            });

            await expect(userService.updateProfile('user-123', { email: 'same@example.com' }))
                .resolves.not.toThrow();

            // 可以添加更详细的断言
            expect(User.updateById).toHaveBeenCalledWith('user-123', { email: 'same@example.com' });
        });

        it('should throw 404 error when user does not exist', async () => {
            User.updateById.mockResolvedValue(null);

            await expect(userService.updateProfile('non-existent', { name: 'Updated' }))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'User not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const mockUser = createMockUser();

            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('new_hashed_password');
            User.updatePassword.mockResolvedValue(true);
            UserToken.revokeByUser.mockResolvedValue(true);

            await userService.changePassword('user-123', 'oldPassword', 'newPassword');

            expect(User.findWithPasswordById).toHaveBeenCalledWith('user-123');
            expect(bcrypt.compare).toHaveBeenCalledWith('oldPassword', 'hashed_password_123');
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
            expect(User.updatePassword).toHaveBeenCalledWith('user-123', 'new_hashed_password');
            expect(UserToken.revokeByUser).toHaveBeenCalledWith('user-123', 'refresh');
        });

        it('should throw 404 error when user does not exist', async () => {
            User.findWithPasswordById.mockResolvedValue(null);

            await expect(userService.changePassword('non-existent', 'old', 'new'))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'User not found',
                    code: 'NOT_FOUND'
                });
        });

        it('should throw 400 error when old password is incorrect', async () => {
            const mockUser = createMockUser();

            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(userService.changePassword('user-123', 'wrongPassword', 'newPassword'))
                .rejects
                .toEqual({
                    status: 400,
                    message: 'Old password incorrect',
                    code: 'INVALID_PASSWORD'
                });
        });
    });

    describe('deleteAccount', () => {
        it('should delete account successfully when password is correct', async () => {
            const mockUser = createMockUser();

            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            User.deleteById.mockResolvedValue(true);

            await userService.deleteAccount('user-123', 'correctPassword');

            expect(User.findWithPasswordById).toHaveBeenCalledWith('user-123');
            expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashed_password_123');
            expect(fs.promises.unlink).toHaveBeenCalled();
            expect(User.deleteById).toHaveBeenCalledWith('user-123');
        });

        it('should not attempt to delete avatar file if user has no avatar', async () => {
            const mockUser = createMockUser({ avatar_url: null });

            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            User.deleteById.mockResolvedValue(true);

            await userService.deleteAccount('user-123', 'correctPassword');

            expect(fs.promises.unlink).not.toHaveBeenCalled();
            expect(User.deleteById).toHaveBeenCalledWith('user-123');
        });

        it('should not delete avatar file if avatar_url does not start with /uploads/', async () => {
            const mockUser = createMockUser({ avatar_url: 'https://external.com/avatar.jpg' });

            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            User.deleteById.mockResolvedValue(true);

            await userService.deleteAccount('user-123', 'correctPassword');

            expect(fs.promises.unlink).not.toHaveBeenCalled();
            expect(User.deleteById).toHaveBeenCalledWith('user-123');
        });

        it('should throw 404 error when user does not exist', async () => {
            User.findWithPasswordById.mockResolvedValue(null);

            await expect(userService.deleteAccount('non-existent', 'password'))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'User not found',
                    code: 'NOT_FOUND'
                });
        });

        it('should throw 400 error when password is incorrect', async () => {
            const mockUser = createMockUser();

            User.findWithPasswordById.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            await expect(userService.deleteAccount('user-123', 'wrongPassword'))
                .rejects
                .toEqual({
                    status: 400,
                    message: 'Password incorrect',
                    code: 'INVALID_PASSWORD'
                });
        });
    });

    describe('uploadAvatar', () => {
        const mockFile = {
            path: '/tmp/uploads/avatar.jpg'
        };

        beforeEach(() => {
            path.basename.mockReturnValue('avatar.jpg');
        });

        it('should upload avatar successfully', async () => {
            const mockUser = createMockUser();
            const updatedUser = { ...mockUser, avatar_url: '/uploads/avatar.jpg' };

            User.findById.mockResolvedValue(mockUser);
            User.updateById.mockResolvedValue(updatedUser);

            toUserDto.mockReturnValue({
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                avatar_url: '/uploads/avatar.jpg'
            });

            const result = await userService.uploadAvatar('user-123', mockFile);

            expect(path.basename).toHaveBeenCalledWith(mockFile.path);
            expect(User.updateById).toHaveBeenCalledWith('user-123', { avatar_url: '/uploads/avatar.jpg' });
            expect(result).toEqual({
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                avatar_url: '/uploads/avatar.jpg'
            });
        });

        it('should delete old avatar file if it exists in uploads directory', async () => {
            const mockUser = createMockUser();

            User.findById.mockResolvedValue(mockUser);
            User.updateById.mockResolvedValue(mockUser);

            await userService.uploadAvatar('user-123', mockFile);

            expect(fs.promises.unlink).toHaveBeenCalled();
        });

        it('should not delete old avatar if it is the same as new file', async () => {
            const mockUser = createMockUser();

            User.findById.mockResolvedValue(mockUser);
            User.updateById.mockResolvedValue(mockUser);

            // Mock path.resolve to simulate same path
            path.resolve.mockReturnValue(mockFile.path);

            await userService.uploadAvatar('user-123', mockFile);

            expect(fs.promises.unlink).not.toHaveBeenCalled();
        });

        it('should throw 400 error when file is not provided', async () => {
            await expect(userService.uploadAvatar('user-123', null))
                .rejects
                .toEqual({
                    status: 400,
                    message: 'File is required',
                    code: 'NO_FILE'
                });
        });

        it('should throw 404 error when user does not exist', async () => {
            User.findById.mockResolvedValue(null);

            await expect(userService.uploadAvatar('non-existent', mockFile))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'User not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('getSettings', () => {
        it('should return user settings', async () => {
            const mockSettings = createMockSettings();

            UserSettings.getByUserId.mockResolvedValue(mockSettings);

            const result = await userService.getSettings('user-123');

            expect(UserSettings.getByUserId).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(mockSettings);
        });

        it('should create default settings if none exist', async () => {
            const mockSettings = createMockSettings();

            UserSettings.getByUserId.mockResolvedValue(null);
            UserSettings.createDefault.mockResolvedValue(mockSettings);

            await userService.getSettings('user-123');

            expect(UserSettings.createDefault).toHaveBeenCalledWith('user-123');
        });
    });

    describe('updateSettings', () => {
        it('should update user settings successfully', async () => {
            const mockSettings = createMockSettings();
            const updatedSettings = { ...mockSettings, theme: 'dark' };

            UserSettings.getByUserId.mockResolvedValue(mockSettings);
            UserSettings.updateByUserId.mockResolvedValue(updatedSettings);

            const updateData = { theme: 'dark', notifications: false };
            const result = await userService.updateSettings('user-123', updateData);

            expect(UserSettings.getByUserId).toHaveBeenCalledWith('user-123');
            expect(UserSettings.updateByUserId).toHaveBeenCalledWith('user-123', updateData);
            expect(result).toEqual(updatedSettings);
        });
    });

    describe('resetSettings', () => {
        it('should reset user settings to default', async () => {
            const mockSettings = createMockSettings();
            const resetSettings = { ...mockSettings, theme: 'light' };

            UserSettings.getByUserId.mockResolvedValue(mockSettings);
            UserSettings.resetToDefault.mockResolvedValue(resetSettings);

            const result = await userService.resetSettings('user-123');

            expect(UserSettings.getByUserId).toHaveBeenCalledWith('user-123');
            expect(UserSettings.resetToDefault).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(resetSettings);
        });
    });
});