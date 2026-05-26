const statisticsControllerTest = require('../../../src/controllers/statistics.controller');
const statisticsService = require('../../../src/services/statistics.service');
const response = require('../../../src/utils/response.util');

// Mock dependencies
jest.mock('../../../src/services/statistics.service');
jest.mock('../../../src/utils/response.util');

describe('Statistics Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request
        req = {
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
    });

    describe('getPomodoroSummary', () => {
        it('should get pomodoro summary successfully', async () => {
            const mockSummary = {
                totalSessions: 50,
                totalDuration: 1250,
                avgSessionsPerDay: 2.5,
                mostProductiveDay: 'Monday'
            };

            req.query = { period: 'week' };
            statisticsService.getPomodoroSummary.mockResolvedValue(mockSummary);

            await statisticsControllerTest.getPomodoroSummary(req, res, next);

            expect(statisticsService.getPomodoroSummary).toHaveBeenCalledWith(
                'user-123',
                { period: 'week' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockSummary,
                '番茄钟总览'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle empty query parameters', async () => {
            const mockSummary = {
                totalSessions: 50,
                totalDuration: 1250,
                avgSessionsPerDay: 2.5
            };

            statisticsService.getPomodoroSummary.mockResolvedValue(mockSummary);

            await statisticsControllerTest.getPomodoroSummary(req, res, next);

            expect(statisticsService.getPomodoroSummary).toHaveBeenCalledWith(
                'user-123',
                {}
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockSummary,
                '番茄钟总览'
            );
        });

        it('should call next with error when summary retrieval fails', async () => {
            const error = new Error('Summary retrieval failed');
            statisticsService.getPomodoroSummary.mockRejectedValue(error);

            await statisticsControllerTest.getPomodoroSummary(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getPomodoroDaily', () => {
        it('should get daily pomodoro statistics successfully', async () => {
            const mockDailyStats = {
                data: [
                    { date: '2024-01-01', sessions: 3, duration: 75 },
                    { date: '2024-01-02', sessions: 4, duration: 100 }
                ],
                period: 'week',
                total: {
                    sessions: 25,
                    duration: 625
                }
            };

            req.query = { period: 'week', groupBy: 'day' };
            statisticsService.getPomodoroDaily.mockResolvedValue(mockDailyStats);

            await statisticsControllerTest.getPomodoroDaily(req, res, next);

            expect(statisticsService.getPomodoroDaily).toHaveBeenCalledWith(
                'user-123',
                { period: 'week', groupBy: 'day' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockDailyStats,
                '每日统计'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle default daily statistics', async () => {
            const mockDailyStats = {
                data: [],
                period: 'month',
                total: { sessions: 0, duration: 0 }
            };

            statisticsService.getPomodoroDaily.mockResolvedValue(mockDailyStats);

            await statisticsControllerTest.getPomodoroDaily(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                mockDailyStats,
                '每日统计'
            );
        });

        it('should call next with error when daily statistics retrieval fails', async () => {
            const error = new Error('Daily statistics retrieval failed');
            statisticsService.getPomodoroDaily.mockRejectedValue(error);

            await statisticsControllerTest.getPomodoroDaily(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getPomodoroTags', () => {
        it('should get pomodoro tag statistics successfully', async () => {
            const mockTagStats = {
                tags: [
                    { tag: 'work', sessions: 20, duration: 500, percentage: 40 },
                    { tag: 'study', sessions: 15, duration: 375, percentage: 30 },
                    { tag: 'personal', sessions: 10, duration: 250, percentage: 20 }
                ],
                totalSessions: 45,
                totalDuration: 1125
            };

            req.query = { period: 'month', limit: 5 };
            statisticsService.getPomodoroTags.mockResolvedValue(mockTagStats);

            await statisticsControllerTest.getPomodoroTags(req, res, next);

            expect(statisticsService.getPomodoroTags).toHaveBeenCalledWith(
                'user-123',
                { period: 'month', limit: 5 }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockTagStats,
                '标签统计'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return empty tag statistics when no tags exist', async () => {
            const mockTagStats = {
                tags: [],
                totalSessions: 0,
                totalDuration: 0
            };

            statisticsService.getPomodoroTags.mockResolvedValue(mockTagStats);

            await statisticsControllerTest.getPomodoroTags(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                mockTagStats,
                '标签统计'
            );
        });

        it('should call next with error when tag statistics retrieval fails', async () => {
            const error = new Error('Tag statistics retrieval failed');
            statisticsService.getPomodoroTags.mockRejectedValue(error);

            await statisticsControllerTest.getPomodoroTags(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getPomodoroTrends', () => {
        it('should get pomodoro trends successfully', async () => {
            const mockTrends = {
                weeklyTrend: [
                    { week: '2024-W01', sessions: 25, duration: 625 },
                    { week: '2024-W02', sessions: 28, duration: 700 }
                ],
                monthlyTrend: [
                    { month: '2024-01', sessions: 100, duration: 2500 },
                    { month: '2024-02', sessions: 95, duration: 2375 }
                ],
                comparisons: {
                    weekOverWeek: 12,
                    monthOverMonth: -5
                }
            };

            req.query = { trendType: 'weekly', compare: true };
            statisticsService.getPomodoroTrends.mockResolvedValue(mockTrends);

            await statisticsControllerTest.getPomodoroTrends(req, res, next);

            expect(statisticsService.getPomodoroTrends).toHaveBeenCalledWith(
                'user-123',
                { trendType: 'weekly', compare: true }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockTrends,
                '趋势分析'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle different trend types', async () => {
            const mockTrends = {
                dailyTrend: [
                    { date: '2024-01-01', sessions: 3, duration: 75 }
                ]
            };

            req.query = { trendType: 'daily' };
            statisticsService.getPomodoroTrends.mockResolvedValue(mockTrends);

            await statisticsControllerTest.getPomodoroTrends(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                mockTrends,
                '趋势分析'
            );
        });

        it('should call next with error when trends retrieval fails', async () => {
            const error = new Error('Trends retrieval failed');
            statisticsService.getPomodoroTrends.mockRejectedValue(error);

            await statisticsControllerTest.getPomodoroTrends(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getTaskSummary', () => {
        it('should get task summary successfully', async () => {
            const mockTaskSummary = {
                totalTasks: 50,
                completedTasks: 35,
                inProgressTasks: 10,
                pendingTasks: 5,
                completionRate: 70,
                avgCompletionTime: '2.5 days'
            };

            req.query = { period: 'month', includeArchived: 'false' };
            statisticsService.getTaskSummary.mockResolvedValue(mockTaskSummary);

            await statisticsControllerTest.getTaskSummary(req, res, next);

            expect(statisticsService.getTaskSummary).toHaveBeenCalledWith(
                'user-123',
                { period: 'month', includeArchived: 'false' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockTaskSummary,
                '任务总览'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle task summary with archived tasks included', async () => {
            const mockTaskSummary = {
                totalTasks: 60,
                completedTasks: 40,
                inProgressTasks: 10,
                pendingTasks: 5,
                archivedTasks: 5,
                completionRate: 66.67
            };

            req.query = { includeArchived: 'true' };
            statisticsService.getTaskSummary.mockResolvedValue(mockTaskSummary);

            await statisticsControllerTest.getTaskSummary(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                mockTaskSummary,
                '任务总览'
            );
        });

        it('should call next with error when task summary retrieval fails', async () => {
            const error = new Error('Task summary retrieval failed');
            statisticsService.getTaskSummary.mockRejectedValue(error);

            await statisticsControllerTest.getTaskSummary(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getTaskCompletion', () => {
        it('should get task completion analysis successfully', async () => {
            const mockCompletionAnalysis = {
                dailyCompletion: [
                    { date: '2024-01-01', completed: 5, total: 8, rate: 62.5 },
                    { date: '2024-01-02', completed: 7, total: 10, rate: 70 }
                ],
                weeklyTrend: {
                    week: '2024-W01',
                    averageCompletionRate: 68.5,
                    bestDay: 'Tuesday',
                    worstDay: 'Sunday'
                },
                metrics: {
                    overallCompletionRate: 70,
                    streak: 5,
                    consistencyScore: 85
                }
            };

            req.query = { period: 'week', granularity: 'daily' };
            statisticsService.getTaskCompletion.mockResolvedValue(mockCompletionAnalysis);

            await statisticsControllerTest.getTaskCompletion(req, res, next);

            expect(statisticsService.getTaskCompletion).toHaveBeenCalledWith(
                'user-123',
                { period: 'week', granularity: 'daily' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockCompletionAnalysis,
                '完成率分析'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle monthly task completion analysis', async () => {
            const mockCompletionAnalysis = {
                monthlyCompletion: [
                    { month: '2024-01', completed: 50, total: 80, rate: 62.5 },
                    { month: '2024-02', completed: 55, total: 85, rate: 64.7 }
                ],
                metrics: {
                    overallCompletionRate: 63.6,
                    bestMonth: 'February',
                    improvement: 2.2
                }
            };

            req.query = { period: 'year', granularity: 'monthly' };
            statisticsService.getTaskCompletion.mockResolvedValue(mockCompletionAnalysis);

            await statisticsControllerTest.getTaskCompletion(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                mockCompletionAnalysis,
                '完成率分析'
            );
        });

        it('should call next with error when completion analysis retrieval fails', async () => {
            const error = new Error('Completion analysis retrieval failed');
            statisticsService.getTaskCompletion.mockRejectedValue(error);

            await statisticsControllerTest.getTaskCompletion(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });
});