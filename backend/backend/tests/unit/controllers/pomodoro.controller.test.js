const pomodoroController = require('../../../src/controllers/pomodoro.controller');
const pomodoroService = require('../../../src/services/pomodoro.service');
const response = require('../../../src/utils/response.util');

// Mock dependencies
jest.mock('../../../src/services/pomodoro.service');
jest.mock('../../../src/utils/response.util');

describe('Pomodoro Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request
        req = {
            body: {},
            query: {},
            params: {},
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

    describe('createSession', () => {
        it('should create a new pomodoro session successfully', async () => {
            const mockSession = {
                id: 'session-123',
                duration: 25,
                task: 'Task 1',
                userId: 'user-123'
            };

            req.body = { duration: 25, task: 'Task 1' };
            pomodoroService.createSession.mockResolvedValue(mockSession);

            await pomodoroController.createSession(req, res, next);

            expect(pomodoroService.createSession).toHaveBeenCalledWith(
                'user-123',
                { duration: 25, task: 'Task 1' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { session: mockSession },
                '会话已创建'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when session creation fails', async () => {
            req.body = { duration: 25, task: 'Task 1' };
            const error = new Error('Creation failed');
            pomodoroService.createSession.mockRejectedValue(error);

            await pomodoroController.createSession(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('listSessions', () => {
        it('should list pomodoro sessions successfully', async () => {
            const mockData = {
                items: [
                    { id: 'session-1', duration: 25, task: 'Task 1' },
                    { id: 'session-2', duration: 25, task: 'Task 2' }
                ],
                pagination: { page: 1, limit: 10, total: 2 }
            };

            req.query = { page: 1, limit: 10 };
            pomodoroService.listSessions.mockResolvedValue(mockData);

            await pomodoroController.listSessions(req, res, next);

            expect(pomodoroService.listSessions).toHaveBeenCalledWith(
                'user-123',
                { page: 1, limit: 10 }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '会话列表'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle empty query parameters', async () => {
            const mockData = { items: [], pagination: { page: 1, limit: 20, total: 0 } };
            pomodoroService.listSessions.mockResolvedValue(mockData);

            await pomodoroController.listSessions(req, res, next);

            expect(pomodoroService.listSessions).toHaveBeenCalledWith(
                'user-123',
                {}
            );
        });

        it('should call next with error when listing fails', async () => {
            const error = new Error('Listing failed');
            pomodoroService.listSessions.mockRejectedValue(error);

            await pomodoroController.listSessions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getSession', () => {
        it('should get a specific pomodoro session successfully', async () => {
            const mockSession = {
                id: 'session-123',
                duration: 25,
                task: 'Task 1',
                userId: 'user-123'
            };

            req.params = { id: 'session-123' };
            pomodoroService.getSession.mockResolvedValue(mockSession);

            await pomodoroController.getSession(req, res, next);

            expect(pomodoroService.getSession).toHaveBeenCalledWith(
                'user-123',
                'session-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { session: mockSession },
                '会话详情'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when session not found', async () => {
            req.params = { id: 'non-existent' };
            const error = { status: 404, message: 'Session not found' };
            pomodoroService.getSession.mockRejectedValue(error);

            await pomodoroController.getSession(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateSession', () => {
        it('should update a pomodoro session successfully', async () => {
            const mockUpdatedSession = {
                id: 'session-123',
                duration: 30,
                task: 'Updated Task',
                userId: 'user-123'
            };

            req.params = { id: 'session-123' };
            req.body = { duration: 30, task: 'Updated Task' };
            pomodoroService.updateSession.mockResolvedValue(mockUpdatedSession);

            await pomodoroController.updateSession(req, res, next);

            expect(pomodoroService.updateSession).toHaveBeenCalledWith(
                'user-123',
                'session-123',
                { duration: 30, task: 'Updated Task' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { session: mockUpdatedSession },
                '会话已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when update fails', async () => {
            req.params = { id: 'session-123' };
            req.body = { duration: 30 };
            const error = new Error('Update failed');
            pomodoroService.updateSession.mockRejectedValue(error);

            await pomodoroController.updateSession(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('deleteSession', () => {
        it('should delete a pomodoro session successfully', async () => {
            req.params = { id: 'session-123' };
            pomodoroService.deleteSession.mockResolvedValue(true);

            await pomodoroController.deleteSession(req, res, next);

            expect(pomodoroService.deleteSession).toHaveBeenCalledWith(
                'user-123',
                'session-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { deleted: true },
                '会话已删除'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when deletion fails', async () => {
            req.params = { id: 'session-123' };
            const error = new Error('Deletion failed');
            pomodoroService.deleteSession.mockRejectedValue(error);

            await pomodoroController.deleteSession(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('interruptSession', () => {
        it('should interrupt a pomodoro session successfully', async () => {
            const mockInterruptedSession = {
                id: 'session-123',
                duration: 25,
                task: 'Task 1',
                status: 'interrupted',
                interruptions: 1
            };

            req.params = { id: 'session-123' };
            pomodoroService.interruptSession.mockResolvedValue(mockInterruptedSession);

            await pomodoroController.interruptSession(req, res, next);

            expect(pomodoroService.interruptSession).toHaveBeenCalledWith(
                'user-123',
                'session-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { session: mockInterruptedSession },
                '中断已记录'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when interruption fails', async () => {
            req.params = { id: 'session-123' };
            const error = new Error('Interruption failed');
            pomodoroService.interruptSession.mockRejectedValue(error);

            await pomodoroController.interruptSession(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getTags', () => {
        it('should get pomodoro tags successfully', async () => {
            const mockTags = ['work', 'study', 'personal'];
            pomodoroService.getTags.mockResolvedValue(mockTags);

            await pomodoroController.getTags(req, res, next);

            expect(pomodoroService.getTags).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                { tags: mockTags },
                '标签列表'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should return empty array when no tags exist', async () => {
            const mockTags = [];
            pomodoroService.getTags.mockResolvedValue(mockTags);

            await pomodoroController.getTags(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                { tags: [] },
                '标签列表'
            );
        });

        it('should call next with error when fetching tags fails', async () => {
            const error = new Error('Fetch tags failed');
            pomodoroService.getTags.mockRejectedValue(error);

            await pomodoroController.getTags(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });
});