const {
    pomodoroExportSchema,
    simpleExportSchema,
    allExportSchema
} = require('../../../src/validators/export.validator');

describe('Export Validators', () => {
    describe('pomodoroExportSchema', () => {
        test('should validate correct pomodoro export data', () => {
            const validData = {
                format: 'csv',
                startDate: '2024-01-01',
                endDate: '2024-01-31',
                download: 'true'
            };

            const { error, value } = pomodoroExportSchema.validate(validData);

            expect(error).toBeUndefined();
            expect(value.format).toBe('csv');
            expect(value.download).toBe('true');
        });

        test('should apply default values', () => {
            const data = {};

            const { value } = pomodoroExportSchema.validate(data);

            expect(value.format).toBe('json');
            expect(value.download).toBe('false');
        });

        test('should accept only json or csv format', () => {
            const invalidData = {
                format: 'pdf' // Invalid format
            };

            const { error } = pomodoroExportSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['format']);
        });

        test('should accept only true/false string for download', () => {
            const invalidData = {
                download: 'yes' // Invalid value
            };

            const { error } = pomodoroExportSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['download']);
        });

        test('should reject unknown fields', () => {
            const invalidData = {
                format: 'json',
                extraField: 'should not be here'
            };

            const { error } = pomodoroExportSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('simpleExportSchema', () => {
        test('should validate correct simple export data', () => {
            const validData = {
                format: 'csv',
                download: 'false'
            };

            const { error } = simpleExportSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should apply default values', () => {
            const data = {};

            const { value } = simpleExportSchema.validate(data);

            expect(value.format).toBe('json');
            expect(value.download).toBe('false');
        });
    });

    describe('allExportSchema', () => {
        test('should validate correct all export data', () => {
            const validData = {
                format: 'zip',
                download: 'true'
            };

            const { error } = allExportSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should accept only json or zip format', () => {
            const invalidData = {
                format: 'csv' // Invalid for allExport
            };

            const { error } = allExportSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });
});