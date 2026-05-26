const {
    updateProfileSchema,
    changePasswordSchema,
    deleteAccountSchema,
    updateSettingsSchema,
    updateThemeSchema,
    updatePomodoroSchema,
    updateNotificationSchema
} = require('../../../src/validators/user.validator');

describe('User Validators', () => {
    describe('updateProfileSchema', () => {
        test('should validate correct profile update data', () => {
            const validData = {
                username: 'newusername',
                email: 'newemail@example.com'
            };

            const { error } = updateProfileSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should accept partial update', () => {
            const validData = {
                username: 'newusername'
            };

            const { error } = updateProfileSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject empty update object', () => {
            const invalidData = {};

            const { error } = updateProfileSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('object.min');
        });

        test('should reject invalid email', () => {
            const invalidData = {
                email: 'invalid-email'
            };

            const { error } = updateProfileSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['email']);
        });
    });

    describe('changePasswordSchema', () => {
        test('should validate correct password change data', () => {
            const validData = {
                oldPassword: 'oldPassword123',
                newPassword: 'newPassword456'
            };

            const { error } = changePasswordSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject when newPassword is same as oldPassword', () => {
            const invalidData = {
                oldPassword: 'samepassword',
                newPassword: 'samepassword'
            };

            const { error } = changePasswordSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['newPassword']);
        });

        test('should reject without oldPassword', () => {
            const invalidData = {
                newPassword: 'newPassword456'
            };

            const { error } = changePasswordSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('deleteAccountSchema', () => {
        test('should validate correct delete account data', () => {
            const validData = {
                password: 'password123'
            };

            const { error } = deleteAccountSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject with short password', () => {
            const invalidData = {
                password: '123' // Too short
            };

            const { error } = deleteAccountSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('updateSettingsSchema', () => {
        test('should validate correct settings update data', () => {
            const validData = {
                pomodoroDuration: 30,
                shortBreak: 5,
                longBreak: 15,
                autoStartBreak: true,
                enableNotifications: false,
                theme: 'dark',
                primaryColor: '#4CAF50',
                fontSize: 'large',
                language: 'en-US'
            };

            const { error } = updateSettingsSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject empty update object', () => {
            const invalidData = {};

            const { error } = updateSettingsSchema.validate(invalidData);

            expect(error).toBeDefined();
        });

        test('should reject with invalid hex color', () => {
            const invalidData = {
                primaryColor: 'invalid-color'
            };

            const { error } = updateSettingsSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.message).toContain('hex color');
        });

        test('should reject with pomodoroDuration out of range', () => {
            const invalidData = {
                pomodoroDuration: 181 // Max is 180
            };

            const { error } = updateSettingsSchema.validate(invalidData);

            expect(error).toBeDefined();
        });

        test('should accept valid theme values', () => {
            const themes = ['light', 'dark', 'system', 'custom'];
            themes.forEach(theme => {
                const validData = { theme };
                const { error } = updateSettingsSchema.validate(validData);
                expect(error).toBeUndefined();
            });
        });
    });

    describe('updateThemeSchema', () => {
        test('should validate correct theme update data', () => {
            const validData = {
                theme: 'custom',
                primaryColor: '#FF6B6B',
                backgroundImageUrl: 'https://example.com/bg.jpg'
            };

            const { error } = updateThemeSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject without required fields', () => {
            const invalidData = {
                theme: 'dark'
                // Missing primaryColor
            };

            const { error } = updateThemeSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['primaryColor']);
        });
    });

    describe('updatePomodoroSchema', () => {
        test('should validate correct pomodoro settings update data', () => {
            const validData = {
                pomodoroDuration: 45,
                shortBreak: 10,
                longBreak: 30
            };

            const { error } = updatePomodoroSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject without required fields', () => {
            const invalidData = {
                pomodoroDuration: 25,
                shortBreak: 5
                // Missing longBreak
            };

            const { error } = updatePomodoroSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('updateNotificationSchema', () => {
        test('should validate correct notification settings update data', () => {
            const validData = {
                enableNotifications: true,
                notificationSound: false,
                soundVolume: 75
            };

            const { error } = updateNotificationSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject with soundVolume out of range', () => {
            const invalidData = {
                enableNotifications: true,
                notificationSound: true,
                soundVolume: 101 // Max is 100
            };

            const { error } = updateNotificationSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });
});