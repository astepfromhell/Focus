const {
    createSessionSchema,
    updateSessionSchema,
    listSessionSchema
} = require('../../../src/validators/pomodoro.validator');
const { STATUS_VALUES } = require('../../../src/models/PomodoroSession');

describe('Pomodoro Validators', () => {
    describe('createSessionSchema', () => {
        test('should validate correct session creation data', () => {
            const validData = {
                plannedDuration: 25,
                startTime: '2024-01-01T10:00:00.000Z',
                tag: 'work',
                notes: 'Focus on project'
            };

            const { error } = createSessionSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should validate with minimal required fields', () => {
            const validData = {
                plannedDuration: 25
            };

            const { error } = createSessionSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject without plannedDuration', () => {
            const invalidData = {
                startTime: '2024-01-01T10:00:00.000Z'
            };

            const { error } = createSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['plannedDuration']);
        });

        test('should reject with too short plannedDuration', () => {
            const invalidData = {
                plannedDuration: 0 // Min is 1
            };

            const { error } = createSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['plannedDuration']);
        });

        test('should reject with too long plannedDuration', () => {
            const invalidData = {
                plannedDuration: 241 // Max is 240
            };

            const { error } = createSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['plannedDuration']);
        });

        test('should reject with invalid startTime format', () => {
            const invalidData = {
                plannedDuration: 25,
                startTime: 'invalid-date'
            };

            const { error } = createSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['startTime']);
        });

        test('should accept empty tag and notes', () => {
            const validData = {
                plannedDuration: 25,
                tag: null,
                notes: ''
            };

            const { error } = createSessionSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('updateSessionSchema', () => {
        test('should validate correct session update data', () => {
            const validData = {
                endTime: '2024-01-01T10:25:00.000Z',
                actualDuration: 25,
                status: 'completed',
                notes: 'Session completed successfully'
            };

            const { error } = updateSessionSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject empty update object', () => {
            const invalidData = {};

            const { error } = updateSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('object.min');
        });

        test('should reject with invalid status', () => {
            const invalidData = {
                status: 'invalid_status'
            };

            const { error } = updateSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['status']);
        });

        test('should accept all valid status values', () => {
            STATUS_VALUES.forEach(status => {
                const validData = { status };
                const { error } = updateSessionSchema.validate(validData);
                expect(error).toBeUndefined();
            });
        });

        test('should reject with too long actualDuration', () => {
            const invalidData = {
                actualDuration: 601 // Max is 600
            };

            const { error } = updateSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['actualDuration']);
        });
    });

    describe('listSessionSchema', () => {
        test('should validate correct list filters', () => {
            const validData = {
                page: 1,
                limit: 20,
                startDate: '2024-01-01',
                endDate: '2024-01-31',
                tag: 'work',
                status: 'completed'
            };

            const { error, value } = listSessionSchema.validate(validData);

            expect(error).toBeUndefined();
            expect(value.page).toBe(1);
            expect(value.limit).toBe(20);
        });

        test('should apply default values', () => {
            const data = {};

            const { value } = listSessionSchema.validate(data);

            expect(value.page).toBe(1);
            expect(value.limit).toBe(20);
        });

        test('should reject with invalid page number', () => {
            const invalidData = {
                page: 0 // Min is 1
            };

            const { error } = listSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['page']);
        });

        test('should reject with too large limit', () => {
            const invalidData = {
                limit: 101 // Max is 100
            };

            const { error } = listSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['limit']);
        });

        test('should reject unknown fields', () => {
            const invalidData = {
                page: 1,
                extraField: 'should not be here'
            };

            const { error } = listSessionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('object.unknown');
        });

        test('should accept raw date strings', () => {
            const validData = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const { error } = listSessionSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });
});