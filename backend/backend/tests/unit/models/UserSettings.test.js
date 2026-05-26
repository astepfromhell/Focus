const UserSettings = require('../../../src/models/UserSettings');
const db = require('../../../src/models/index');

jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('UserSettings Model', () => {
    const mockUserId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('DEFAULT_SETTINGS', () => {
        it('should export default settings', () => {
            expect(UserSettings.DEFAULT_SETTINGS).toEqual({
                pomodoroDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                autoStartBreak: false,
                autoStartPomodoro: false,
                enableNotifications: true,
                notificationSound: true,
                soundVolume: 50,
                theme: 'light',
                primaryColor: '#FF6B6B',
                backgroundImageUrl: null,
                fontSize: 'medium',
                language: 'zh-CN',
                dataRetentionDays: 365,
            });
        });
    });

    describe('createDefault', () => {
        it('should create default settings for user', async () => {
            const mockSettings = {
                id: 1,
                pomodoroDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                autoStartBreak: false,
                autoStartPomodoro: false,
                enableNotifications: true,
                notificationSound: true,
                soundVolume: 50,
                theme: 'light',
                primaryColor: '#FF6B6B',
                backgroundImageUrl: null,
                fontSize: 'medium',
                language: 'zh-CN',
                dataRetentionDays: 365,
            };

            const mockDbRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ insertId: 1, affectedRows: 1 })
                .mockResolvedValueOnce([mockDbRow]);

            const result = await UserSettings.createDefault(mockUserId);

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO user_settings'),
                expect.arrayContaining([mockUserId])
            );
            expect(result).toEqual(mockSettings);
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(UserSettings.createDefault(mockUserId)).rejects.toThrow('Database error');
        });
    });

    describe('getByUserId', () => {
        it('should get settings by user id', async () => {
            const mockDbRow = {
                id: 1,
                pomodoro_duration: 30,
                short_break: 10,
                long_break: 20,
                auto_start_break: 1,
                auto_start_pomodoro: 1,
                enable_notifications: 1,
                notification_sound: 0,
                sound_volume: 75,
                theme: 'dark',
                primary_color: '#00FF00',
                background_image_url: 'https://example.com/bg.jpg',
                font_size: 'large',
                language: 'en-US',
                data_retention_days: 180,
            };

            db.query.mockResolvedValue([mockDbRow]);

            const result = await UserSettings.getByUserId(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM user_settings WHERE user_id = ? LIMIT 1',
                [mockUserId]
            );
            expect(result).toEqual({
                id: 1,
                pomodoroDuration: 30,
                shortBreak: 10,
                longBreak: 20,
                autoStartBreak: true,
                autoStartPomodoro: true,
                enableNotifications: true,
                notificationSound: false,
                soundVolume: 75,
                theme: 'dark',
                primaryColor: '#00FF00',
                backgroundImageUrl: 'https://example.com/bg.jpg',
                fontSize: 'large',
                language: 'en-US',
                dataRetentionDays: 180,
            });
        });

        it('should return null when settings not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await UserSettings.getByUserId(999);

            expect(result).toBeNull();
        });

        it('should convert boolean fields correctly', async () => {
            const mockDbRow = {
                id: 1,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 0,
                notification_sound: 0,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query.mockResolvedValue([mockDbRow]);

            const result = await UserSettings.getByUserId(mockUserId);

            expect(result.autoStartBreak).toBe(false);
            expect(result.autoStartPomodoro).toBe(false);
            expect(result.enableNotifications).toBe(false);
            expect(result.notificationSound).toBe(false);
        });
    });

    describe('updateByUserId', () => {
        it('should update single field', async () => {
            const mockUpdatedRow = {
                id: 1,
                pomodoro_duration: 30,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedRow]);

            const result = await UserSettings.updateByUserId(mockUserId, {
                pomodoroDuration: 30,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                'UPDATE user_settings SET pomodoro_duration = ? WHERE user_id = ?',
                [30, mockUserId]
            );
            expect(result.pomodoroDuration).toBe(30);
        });

        it('should update multiple fields', async () => {
            const mockUpdatedRow = {
                id: 1,
                pomodoro_duration: 30,
                short_break: 10,
                long_break: 20,
                auto_start_break: 1,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'dark',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedRow]);

            await UserSettings.updateByUserId(mockUserId, {
                pomodoroDuration: 30,
                shortBreak: 10,
                longBreak: 20,
                autoStartBreak: true,
                theme: 'dark',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringMatching(/UPDATE user_settings SET .* WHERE user_id = \?/),
                expect.arrayContaining([30, 10, 20, true, 'dark', mockUserId])
            );
        });

        it('should return current settings when no fields to update', async () => {
            const mockDbRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query.mockResolvedValueOnce([mockDbRow]);

            const result = await UserSettings.updateByUserId(mockUserId, {});

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM user_settings WHERE user_id = ? LIMIT 1',
                [mockUserId]
            );
            expect(result.pomodoroDuration).toBe(25);
        });

        it('should handle undefined payload', async () => {
            const mockDbRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query.mockResolvedValueOnce([mockDbRow]);

            const result = await UserSettings.updateByUserId(mockUserId);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });

        it('should update theme and colors', async () => {
            const mockUpdatedRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'dark',
                primary_color: '#0000FF',
                background_image_url: 'https://example.com/new-bg.jpg',
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedRow]);

            const result = await UserSettings.updateByUserId(mockUserId, {
                theme: 'dark',
                primaryColor: '#0000FF',
                backgroundImageUrl: 'https://example.com/new-bg.jpg',
            });

            expect(result.theme).toBe('dark');
            expect(result.primaryColor).toBe('#0000FF');
            expect(result.backgroundImageUrl).toBe('https://example.com/new-bg.jpg');
        });

        it('should update notification settings', async () => {
            const mockUpdatedRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 0,
                notification_sound: 0,
                sound_volume: 100,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedRow]);

            const result = await UserSettings.updateByUserId(mockUserId, {
                enableNotifications: false,
                notificationSound: false,
                soundVolume: 100,
            });

            expect(result.enableNotifications).toBe(false);
            expect(result.notificationSound).toBe(false);
            expect(result.soundVolume).toBe(100);
        });

        it('should update language and retention settings', async () => {
            const mockUpdatedRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'large',
                language: 'en-US',
                data_retention_days: 180,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedRow]);

            const result = await UserSettings.updateByUserId(mockUserId, {
                fontSize: 'large',
                language: 'en-US',
                dataRetentionDays: 180,
            });

            expect(result.fontSize).toBe('large');
            expect(result.language).toBe('en-US');
            expect(result.dataRetentionDays).toBe(180);
        });
    });

    describe('resetToDefault', () => {
        it('should reset settings to default values', async () => {
            const mockDefaultRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockDefaultRow]);

            const result = await UserSettings.resetToDefault(mockUserId);

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE user_settings SET'),
                expect.arrayContaining([mockUserId])
            );
            expect(result).toEqual({
                id: 1,
                pomodoroDuration: 25,
                shortBreak: 5,
                longBreak: 15,
                autoStartBreak: false,
                autoStartPomodoro: false,
                enableNotifications: true,
                notificationSound: true,
                soundVolume: 50,
                theme: 'light',
                primaryColor: '#FF6B6B',
                backgroundImageUrl: null,
                fontSize: 'medium',
                language: 'zh-CN',
                dataRetentionDays: 365,
            });
        });

        it('should reset all fields to default', async () => {
            const mockDefaultRow = {
                id: 1,
                pomodoro_duration: 25,
                short_break: 5,
                long_break: 15,
                auto_start_break: 0,
                auto_start_pomodoro: 0,
                enable_notifications: 1,
                notification_sound: 1,
                sound_volume: 50,
                theme: 'light',
                primary_color: '#FF6B6B',
                background_image_url: null,
                font_size: 'medium',
                language: 'zh-CN',
                data_retention_days: 365,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockDefaultRow]);

            await UserSettings.resetToDefault(mockUserId);

            const updateCall = db.query.mock.calls[0];
            expect(updateCall[0]).toContain('pomodoro_duration = ?');
            expect(updateCall[0]).toContain('short_break = ?');
            expect(updateCall[0]).toContain('long_break = ?');
            expect(updateCall[0]).toContain('theme = ?');
            expect(updateCall[1]).toContain(25);
            expect(updateCall[1]).toContain(5);
            expect(updateCall[1]).toContain(15);
        });
    });
});
