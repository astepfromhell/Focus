const statisticsService = require('../../../src/services/statistics.service');
const db = require('../../../src/models');

jest.mock('../../../src/models');

describe('Statistics Service', () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPomodoroSummary', () => {
        test('should get pomodoro summary without filters', async () => {
            // Use mockImplementation to handle multiple queries
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: 50, completedSessions: 45, totalFocusMinutes: 1250 }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{ minDate: '2024-01-01', maxDate: '2024-01-10' }]);
                }
                if (sql.includes('tag AS tag')) {
                    return Promise.resolve([
                        { tag: 'work', count: 30, minutes: 750 },
                        { tag: 'study', count: 15, minutes: 375 },
                    ]);
                }
                if (sql.includes('DATE(start_time) AS day')) {
                    return Promise.resolve([
                        { day: '2024-01-10', completed: 5 },
                        { day: '2024-01-09', completed: 4 },
                    ]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(db.query).toHaveBeenCalledTimes(4);
            expect(result.totalSessions).toBe(50);
            expect(result.completedSessions).toBe(45);
            expect(result.totalFocusMinutes).toBe(1250);
            expect(result.completionRate).toBe(90);
            expect(result.dailyAverage).toBe(5);
        });

        test('should get pomodoro summary with date filters', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: 10, completedSessions: 8, totalFocusMinutes: 250 }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{ minDate: '2024-01-01', maxDate: '2024-01-05' }]);
                }
                return Promise.resolve([]);
            });

            const filters = {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            };

            await statisticsService.getPomodoroSummary(userId, filters);

            expect(db.query).toHaveBeenCalledTimes(4);
            const firstCall = db.query.mock.calls[0];
            expect(firstCall[0]).toContain('DATE(start_time) >= ?');
            expect(firstCall[0]).toContain('DATE(start_time) <= ?');
            expect(firstCall[1]).toEqual([userId, '2024-01-01', '2024-01-31']);
        });

        test('should calculate completion rate correctly', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: 50, completedSessions: 45, totalFocusMinutes: 1250 }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{ minDate: '2024-01-01', maxDate: '2024-01-10' }]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.completionRate).toBe(90);
        });

        test('should handle zero sessions', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: 0, completedSessions: 0, totalFocusMinutes: 0 }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{}]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.totalSessions).toBe(0);
            expect(result.completedSessions).toBe(0);
            expect(result.completionRate).toBe(0);
            expect(result.dailyAverage).toBe(0);
        });

        test('should handle empty summary result', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{}]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.totalSessions).toBe(0);
            expect(result.completedSessions).toBe(0);
            expect(result.totalFocusMinutes).toBe(0);
        });

        test('should compute current streak correctly', async () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(today.getDate() - 2);

            const streakData = [
                { day: today.toISOString().slice(0, 10), completed: 5 },
                { day: yesterday.toISOString().slice(0, 10), completed: 3 },
                { day: twoDaysAgo.toISOString().slice(0, 10), completed: 2 },
            ];

            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: 15, completedSessions: 12, totalFocusMinutes: 375 }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{
                        minDate: twoDaysAgo.toISOString().slice(0, 10),
                        maxDate: today.toISOString().slice(0, 10)
                    }]);
                }
                if (sql.includes('DATE(start_time) AS day')) {
                    return Promise.resolve(streakData);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.currentStreak).toBe(3);
        });

        test('should handle broken streak', async () => {
            const today = new Date();
            const threeDaysAgo = new Date(today);
            threeDaysAgo.setDate(today.getDate() - 3);

            const streakData = [
                { day: threeDaysAgo.toISOString().slice(0, 10), completed: 5 },
            ];

            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: 5, completedSessions: 5, totalFocusMinutes: 125 }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{
                        minDate: threeDaysAgo.toISOString().slice(0, 10),
                        maxDate: threeDaysAgo.toISOString().slice(0, 10)
                    }]);
                }
                if (sql.includes('DATE(start_time) AS day')) {
                    return Promise.resolve(streakData);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.currentStreak).toBe(0);
        });
    });

    describe('getPomodoroDaily', () => {
        const mockDailyData = [
            { date: '2024-01-01', totalSessions: 5, completedSessions: 4, totalMinutes: 125 },
            { date: '2024-01-02', totalSessions: 6, completedSessions: 5, totalMinutes: 150 },
        ];

        test('should get daily pomodoro data', async () => {
            db.query.mockResolvedValue(mockDailyData);

            const result = await statisticsService.getPomodoroDaily(userId, {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result.items).toEqual(mockDailyData);
        });

        test('should include date filters in query', async () => {
            db.query.mockResolvedValue([]);

            await statisticsService.getPomodoroDaily(userId, {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('DATE(start_time) >= ?');
            expect(call[0]).toContain('DATE(start_time) <= ?');
            expect(call[1]).toEqual([userId, '2024-01-01', '2024-01-31']);
        });

        test('should handle empty results', async () => {
            db.query.mockResolvedValue([]);

            const result = await statisticsService.getPomodoroDaily(userId, {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });

            expect(result.items).toEqual([]);
        });
    });

    describe('getPomodoroTags', () => {
        const mockTagsData = [
            { tag: 'work', count: 30, minutes: 750 },
            { tag: 'study', count: 15, minutes: 375 },
            { tag: 'personal', count: 5, minutes: 125 },
        ];

        test('should get pomodoro tags without filters', async () => {
            db.query.mockResolvedValue(mockTagsData);

            const result = await statisticsService.getPomodoroTags(userId);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result.items).toEqual(mockTagsData);
        });

        test('should get pomodoro tags with date filters', async () => {
            db.query.mockResolvedValue(mockTagsData);

            await statisticsService.getPomodoroTags(userId, {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('DATE(start_time) >= ?');
            expect(call[0]).toContain('DATE(start_time) <= ?');
        });

        test('should handle empty tags', async () => {
            db.query.mockResolvedValue([]);

            const result = await statisticsService.getPomodoroTags(userId);

            expect(result.items).toEqual([]);
        });

        test('should order by count and minutes', async () => {
            db.query.mockResolvedValue(mockTagsData);

            await statisticsService.getPomodoroTags(userId);

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('ORDER BY count DESC, minutes DESC');
        });
    });

    describe('getPomodoroTrends', () => {
        const mockTrendsData = [
            {
                period: '2024-W01',
                totalSessions: 25,
                completedSessions: 20,
                totalMinutes: 625,
                firstDate: '2024-01-01',
            },
            {
                period: '2024-W02',
                totalSessions: 30,
                completedSessions: 25,
                totalMinutes: 750,
                firstDate: '2024-01-08',
            },
        ];

        test('should get weekly trends', async () => {
            db.query.mockResolvedValue(mockTrendsData);

            const result = await statisticsService.getPomodoroTrends(userId, { period: 'week' });

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result.items).toEqual(mockTrendsData);

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain("DATE_FORMAT(start_time, '%x-W%v')");
            expect(call[0]).toContain('INTERVAL 12 WEEK');
        });

        test('should get monthly trends', async () => {
            db.query.mockResolvedValue(mockTrendsData);

            const result = await statisticsService.getPomodoroTrends(userId, { period: 'month' });

            expect(result.items).toEqual(mockTrendsData);

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain("DATE_FORMAT(start_time, '%Y-%m')");
            expect(call[0]).toContain('INTERVAL 12 MONTH');
        });

        test('should get yearly trends', async () => {
            db.query.mockResolvedValue(mockTrendsData);

            const result = await statisticsService.getPomodoroTrends(userId, { period: 'year' });

            expect(result.items).toEqual(mockTrendsData);

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain("DATE_FORMAT(start_time, '%Y')");
            expect(call[0]).toContain('INTERVAL 5 YEAR');
        });

        test('should default to weekly trends', async () => {
            db.query.mockResolvedValue([]);

            await statisticsService.getPomodoroTrends(userId, {});

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('INTERVAL 12 WEEK');
        });
    });

    describe('getTaskSummary', () => {
        test('should get task summary without filters', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalTasks')) {
                    return Promise.resolve([{
                        totalTasks: 100,
                        completedTasks: 60,
                        inProgressTasks: 20,
                        pendingTasks: 15,
                        overdueTasks: 5,
                    }]);
                }
                if (sql.includes('SELECT priority')) {
                    return Promise.resolve([
                        { priority: 'high', count: 30 },
                        { priority: 'medium', count: 50 },
                        { priority: 'low', count: 20 },
                    ]);
                }
                if (sql.includes('SELECT status')) {
                    return Promise.resolve([
                        { status: 'completed', count: 60 },
                        { status: 'in_progress', count: 20 },
                        { status: 'pending', count: 15 },
                    ]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getTaskSummary(userId);

            expect(db.query).toHaveBeenCalledTimes(3);
            expect(result.totalTasks).toBe(100);
            expect(result.completedTasks).toBe(60);
            expect(result.inProgressTasks).toBe(20);
            expect(result.pendingTasks).toBe(15);
            expect(result.overdueTasks).toBe(5);
            expect(result.completionRate).toBe(60);
        });

        test('should get task summary with date filters', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalTasks')) {
                    return Promise.resolve([{
                        totalTasks: 50,
                        completedTasks: 30,
                        inProgressTasks: 10,
                        pendingTasks: 8,
                        overdueTasks: 2,
                    }]);
                }
                return Promise.resolve([]);
            });

            const filters = {
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            };

            await statisticsService.getTaskSummary(userId, filters);

            expect(db.query).toHaveBeenCalledTimes(3);
            const firstCall = db.query.mock.calls[0];
            expect(firstCall[0]).toContain('COALESCE(end_date, start_date) >= ?'); // 修正这里
            expect(firstCall[0]).toContain('COALESCE(start_date, end_date) <= ?'); // 保持这个
            expect(firstCall[1]).toEqual([userId, '2024-01-01', '2024-01-31']);
        });

        test('should calculate completion rate correctly', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalTasks')) {
                    return Promise.resolve([{
                        totalTasks: 100,
                        completedTasks: 60,
                        inProgressTasks: 20,
                        pendingTasks: 15,
                        overdueTasks: 5,
                    }]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getTaskSummary(userId);

            expect(result.completionRate).toBe(60);
        });

        test('should handle zero tasks', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalTasks')) {
                    return Promise.resolve([{
                        totalTasks: 0,
                        completedTasks: 0,
                        inProgressTasks: 0,
                        pendingTasks: 0,
                        overdueTasks: 0,
                    }]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getTaskSummary(userId);

            expect(result.totalTasks).toBe(0);
            expect(result.completedTasks).toBe(0);
            expect(result.completionRate).toBe(0);
        });

        test('should handle empty summary result', async () => {
            db.query.mockResolvedValue([]);

            const result = await statisticsService.getTaskSummary(userId);

            expect(result.totalTasks).toBe(0);
            expect(result.completedTasks).toBe(0);
            expect(result.completionRate).toBe(0);
        });
    });

    describe('getTaskCompletion', () => {
        const mockCompletionData = [
            {
                period: '2024-W01',
                completedTasks: 15,
                totalTasks: 20,
                firstDate: '2024-01-01',
            },
            {
                period: '2024-W02',
                completedTasks: 18,
                totalTasks: 25,
                firstDate: '2024-01-08',
            },
        ];

        test('should get weekly task completion', async () => {
            db.query.mockResolvedValue(mockCompletionData);

            const result = await statisticsService.getTaskCompletion(userId, { period: 'week' });

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result.items).toHaveLength(2);
            expect(result.items[0].period).toBe('2024-W01');
            expect(result.items[0].completedTasks).toBe(15);
            expect(result.items[0].totalTasks).toBe(20);
            expect(result.items[0].completionRate).toBe(75);

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain("DATE_FORMAT(created_at, '%x-W%v')");
            expect(call[0]).toContain('INTERVAL 12 WEEK');
        });

        test('should get monthly task completion', async () => {
            db.query.mockResolvedValue(mockCompletionData);

            const result = await statisticsService.getTaskCompletion(userId, { period: 'month' });

            expect(result.items).toHaveLength(2);

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain("DATE_FORMAT(created_at, '%Y-%m')");
            expect(call[0]).toContain('INTERVAL 12 MONTH');
        });

        test('should calculate completion rate for each period', async () => {
            db.query.mockResolvedValue(mockCompletionData);

            const result = await statisticsService.getTaskCompletion(userId, { period: 'week' });

            expect(result.items[0].completionRate).toBe(75);
            expect(result.items[1].completionRate).toBe(72);
        });

        test('should handle zero tasks in period', async () => {
            db.query.mockResolvedValue([
                {
                    period: '2024-W01',
                    completedTasks: 0,
                    totalTasks: 0,
                    firstDate: '2024-01-01',
                },
            ]);

            const result = await statisticsService.getTaskCompletion(userId, { period: 'week' });

            expect(result.items[0].completionRate).toBe(0);
        });

        test('should default to weekly period', async () => {
            db.query.mockResolvedValue([]);

            await statisticsService.getTaskCompletion(userId, {});

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('INTERVAL 12 WEEK');
        });
    });

    describe('Helper functions - buildPomodoroWhere', () => {
        test('should build WHERE clause with startDate only', async () => {
            db.query.mockResolvedValue([]);

            await statisticsService.getPomodoroDaily(userId, {
                startDate: '2024-01-01',
            });

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('DATE(start_time) >= ?');
            expect(call[1]).toEqual([userId, '2024-01-01']);
        });

        test('should build WHERE clause with endDate only', async () => {
            db.query.mockResolvedValue([]);

            await statisticsService.getPomodoroDaily(userId, {
                endDate: '2024-01-31',
            });

            const call = db.query.mock.calls[0];
            expect(call[0]).toContain('DATE(start_time) <= ?');
            expect(call[1]).toEqual([userId, '2024-01-31']);
        });
    });

    describe('Edge cases', () => {
        test('should handle database query errors gracefully', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(statisticsService.getPomodoroDaily(userId, {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            })).rejects.toThrow('Database error');
        });

        test('should handle null values in database results', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{ totalSessions: null, completedSessions: null, totalFocusMinutes: null }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{ minDate: null, maxDate: null }]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.totalSessions).toBe(0);
            expect(result.completedSessions).toBe(0);
            expect(result.totalFocusMinutes).toBe(0);
        });

        test('should handle very large numbers', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{
                        totalSessions: 999999,
                        completedSessions: 999998,
                        totalFocusMinutes: 9999999,
                    }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{ minDate: '2020-01-01', maxDate: '2024-12-31' }]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.totalSessions).toBe(999999);
            expect(result.completedSessions).toBe(999998);
            expect(result.completionRate).toBeCloseTo(100, 2);
        });

        test('should handle completion rate rounding', async () => {
            db.query.mockImplementation((sql) => {
                if (sql.includes('COUNT(*) AS totalSessions')) {
                    return Promise.resolve([{
                        totalSessions: 3,
                        completedSessions: 1,
                        totalFocusMinutes: 75,
                    }]);
                }
                if (sql.includes('MIN(DATE(start_time))')) {
                    return Promise.resolve([{ minDate: '2024-01-01', maxDate: '2024-01-03' }]);
                }
                return Promise.resolve([]);
            });

            const result = await statisticsService.getPomodoroSummary(userId);

            expect(result.completionRate).toBe(33.33);
        });
    });
});