const {
    pomodoroSummarySchema,
    pomodoroDailySchema,
    pomodoroTagsSchema,
    pomodoroTrendsSchema,
    taskSummarySchema,
    taskCompletionSchema
} = require('../../../src/validators/statistics.validator');

describe('Statistics Validators', () => {
    describe('pomodoroSummarySchema', () => {
        test('should validate correct pomodoro summary data', () => {
            const validData = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const { error } = pomodoroSummarySchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should accept empty object', () => {
            const data = {};

            const { error } = pomodoroSummarySchema.validate(data);

            expect(error).toBeUndefined();
        });

        test('should reject unknown fields', () => {
            const invalidData = {
                startDate: '2024-01-01',
                extraField: 'should not be here'
            };

            const { error } = pomodoroSummarySchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('pomodoroDailySchema', () => {
        test('should validate correct pomodoro daily data', () => {
            const validData = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const { error } = pomodoroDailySchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject without startDate', () => {
            const invalidData = {
                endDate: '2024-01-31'
            };

            const { error } = pomodoroDailySchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['startDate']);
        });

        test('should reject without endDate', () => {
            const invalidData = {
                startDate: '2024-01-01'
            };

            const { error } = pomodoroDailySchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('pomodoroTagsSchema', () => {
        test('should validate correct pomodoro tags data', () => {
            const validData = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const { error } = pomodoroTagsSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('pomodoroTrendsSchema', () => {
        test('should validate correct pomodoro trends data', () => {
            const validData = {
                period: 'month'
            };

            const { error, value } = pomodoroTrendsSchema.validate(validData);

            expect(error).toBeUndefined();
            expect(value.period).toBe('month');
        });

        test('should apply default value for period', () => {
            const data = {};

            const { value } = pomodoroTrendsSchema.validate(data);

            expect(value.period).toBe('week');
        });

        test('should reject invalid period', () => {
            const invalidData = {
                period: 'invalid_period'
            };

            const { error } = pomodoroTrendsSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });

    describe('taskSummarySchema', () => {
        test('should validate correct task summary data', () => {
            const validData = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const { error } = taskSummarySchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('taskCompletionSchema', () => {
        test('should validate correct task completion data', () => {
            const validData = {
                period: 'month'
            };

            const { error } = taskCompletionSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should apply default value for period', () => {
            const data = {};

            const { value } = taskCompletionSchema.validate(data);

            expect(value.period).toBe('week');
        });

        test('should reject invalid period', () => {
            const invalidData = {
                period: 'year' // Only 'week' or 'month' are valid
            };

            const { error } = taskCompletionSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });
});