const tasksController = require('../../../src/controllers/tasks.controller');
const tasksService = require('../../../src/services/tasks.service');
const response = require('../../../src/utils/response.util');

// Mock dependencies
jest.mock('../../../src/services/tasks.service');
jest.mock('../../../src/utils/response.util');

describe('Tasks Controller', () => {
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

    describe('createTask', () => {
        it('should create a new task successfully', async () => {
            const mockTask = {
                id: 'task-123',
                title: 'Test Task',
                description: 'Task description',
                userId: 'user-123'
            };

            req.body = { title: 'Test Task', description: 'Task description' };
            tasksService.createTask.mockResolvedValue(mockTask);

            await tasksController.createTask(req, res, next);

            expect(tasksService.createTask).toHaveBeenCalledWith(
                'user-123',
                { title: 'Test Task', description: 'Task description' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { task: mockTask },
                '任务已创建'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when task creation fails', async () => {
            req.body = { title: 'Test Task' };
            const error = new Error('Task creation failed');
            tasksService.createTask.mockRejectedValue(error);

            await tasksController.createTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('listTasks', () => {
        it('should list tasks successfully', async () => {
            const mockData = {
                items: [
                    { id: 'task-1', title: 'Task 1', completed: false },
                    { id: 'task-2', title: 'Task 2', completed: true }
                ],
                pagination: { page: 1, limit: 10, total: 2 }
            };

            req.query = { page: 1, limit: 10, completed: 'false' };
            tasksService.listTasks.mockResolvedValue(mockData);

            await tasksController.listTasks(req, res, next);

            expect(tasksService.listTasks).toHaveBeenCalledWith(
                'user-123',
                { page: 1, limit: 10, completed: 'false' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '任务列表'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle empty query parameters', async () => {
            const mockData = { items: [], pagination: { page: 1, limit: 20, total: 0 } };
            tasksService.listTasks.mockResolvedValue(mockData);

            await tasksController.listTasks(req, res, next);

            expect(tasksService.listTasks).toHaveBeenCalledWith(
                'user-123',
                {}
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '任务列表'
            );
        });

        it('should call next with error when listing fails', async () => {
            const error = new Error('Listing failed');
            tasksService.listTasks.mockRejectedValue(error);

            await tasksController.listTasks(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('listToday', () => {
        it('should list today\'s tasks successfully', async () => {
            const mockData = {
                today: [
                    { id: 'task-1', title: 'Morning Task', dueDate: '2024-01-01' },
                    { id: 'task-2', title: 'Afternoon Task', dueDate: '2024-01-01' }
                ],
                upcoming: [
                    { id: 'task-3', title: 'Tomorrow Task', dueDate: '2024-01-02' }
                ],
                overdue: []
            };

            tasksService.listToday.mockResolvedValue(mockData);

            await tasksController.listToday(req, res, next);

            expect(tasksService.listToday).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '今日任务'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle empty today tasks', async () => {
            const mockData = { today: [], upcoming: [], overdue: [] };
            tasksService.listToday.mockResolvedValue(mockData);

            await tasksController.listToday(req, res, next);

            expect(response.success).toHaveBeenCalledWith(
                res,
                mockData,
                '今日任务'
            );
        });

        it('should call next with error when listing today tasks fails', async () => {
            const error = new Error('Today listing failed');
            tasksService.listToday.mockRejectedValue(error);

            await tasksController.listToday(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('calendarView', () => {
        it('should get calendar view successfully', async () => {
            const mockCalendarData = {
                month: '2024-01',
                tasksByDate: {
                    '2024-01-01': [
                        { id: 'task-1', title: 'New Year Task', dueTime: '10:00' }
                    ],
                    '2024-01-15': [
                        { id: 'task-2', title: 'Mid-month Task', dueTime: '14:00' }
                    ]
                },
                totalTasks: 2
            };

            req.query = { month: '2024-01', year: '2024' };
            tasksService.getCalendarView.mockResolvedValue(mockCalendarData);

            await tasksController.calendarView(req, res, next);

            expect(tasksService.getCalendarView).toHaveBeenCalledWith(
                'user-123',
                { month: '2024-01', year: '2024' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockCalendarData,
                '日历视图'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle default calendar view', async () => {
            const mockCalendarData = {
                month: '2024-01',
                tasksByDate: {},
                totalTasks: 0
            };

            tasksService.getCalendarView.mockResolvedValue(mockCalendarData);

            await tasksController.calendarView(req, res, next);

            expect(tasksService.getCalendarView).toHaveBeenCalledWith(
                'user-123',
                {}
            );
        });

        it('should call next with error when calendar view fails', async () => {
            const error = new Error('Calendar view failed');
            tasksService.getCalendarView.mockRejectedValue(error);

            await tasksController.calendarView(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getTask', () => {
        it('should get a specific task successfully', async () => {
            const mockTask = {
                id: 'task-123',
                title: 'Test Task',
                description: 'Task details',
                userId: 'user-123'
            };

            req.params = { id: 'task-123' };
            tasksService.getTask.mockResolvedValue(mockTask);

            await tasksController.getTask(req, res, next);

            expect(tasksService.getTask).toHaveBeenCalledWith(
                'user-123',
                'task-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { task: mockTask },
                '任务详情'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when task not found', async () => {
            req.params = { id: 'non-existent' };
            const error = { status: 404, message: 'Task not found' };
            tasksService.getTask.mockRejectedValue(error);

            await tasksController.getTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateTask', () => {
        it('should update a task successfully', async () => {
            const mockUpdatedTask = {
                id: 'task-123',
                title: 'Updated Task',
                description: 'Updated description',
                userId: 'user-123'
            };

            req.params = { id: 'task-123' };
            req.body = { title: 'Updated Task', description: 'Updated description' };
            tasksService.updateTask.mockResolvedValue(mockUpdatedTask);

            await tasksController.updateTask(req, res, next);

            expect(tasksService.updateTask).toHaveBeenCalledWith(
                'user-123',
                'task-123',
                { title: 'Updated Task', description: 'Updated description' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { task: mockUpdatedTask },
                '任务已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when update fails', async () => {
            req.params = { id: 'task-123' };
            req.body = { title: 'Updated Task' };
            const error = new Error('Update failed');
            tasksService.updateTask.mockRejectedValue(error);

            await tasksController.updateTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('completeTask', () => {
        it('should complete a task successfully', async () => {
            const mockCompletedTask = {
                id: 'task-123',
                title: 'Test Task',
                completed: true,
                completedAt: '2024-01-01T10:00:00Z',
                userId: 'user-123'
            };

            req.params = { id: 'task-123' };
            tasksService.completeTask.mockResolvedValue(mockCompletedTask);

            await tasksController.completeTask(req, res, next);

            expect(tasksService.completeTask).toHaveBeenCalledWith(
                'user-123',
                'task-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { task: mockCompletedTask },
                '任务已完成'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when completion fails', async () => {
            req.params = { id: 'task-123' };
            const error = new Error('Completion failed');
            tasksService.completeTask.mockRejectedValue(error);

            await tasksController.completeTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('reorderTask', () => {
        it('should reorder a task successfully', async () => {
            const mockReorderedTask = {
                id: 'task-123',
                title: 'Test Task',
                sortOrder: 5,
                userId: 'user-123'
            };

            req.params = { id: 'task-123' };
            req.body = { sortOrder: 5 };
            tasksService.reorderTask.mockResolvedValue(mockReorderedTask);

            await tasksController.reorderTask(req, res, next);

            expect(tasksService.reorderTask).toHaveBeenCalledWith(
                'user-123',
                'task-123',
                5
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { task: mockReorderedTask },
                '排序已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when reorder fails', async () => {
            req.params = { id: 'task-123' };
            req.body = { sortOrder: 5 };
            const error = new Error('Reorder failed');
            tasksService.reorderTask.mockRejectedValue(error);

            await tasksController.reorderTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('deleteTask', () => {
        it('should delete a task successfully', async () => {
            req.params = { id: 'task-123' };
            tasksService.deleteTask.mockResolvedValue(true);

            await tasksController.deleteTask(req, res, next);

            expect(tasksService.deleteTask).toHaveBeenCalledWith(
                'user-123',
                'task-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { deleted: true },
                '任务已删除'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when deletion fails', async () => {
            req.params = { id: 'task-123' };
            const error = new Error('Deletion failed');
            tasksService.deleteTask.mockRejectedValue(error);

            await tasksController.deleteTask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('createSubtask', () => {
        it('should create a subtask successfully', async () => {
            const mockSubtask = {
                id: 'subtask-123',
                title: 'Test Subtask',
                parentTaskId: 'task-123',
                userId: 'user-123'
            };

            req.params = { id: 'task-123' };
            req.body = { title: 'Test Subtask' };
            tasksService.createSubtask.mockResolvedValue(mockSubtask);

            await tasksController.createSubtask(req, res, next);

            expect(tasksService.createSubtask).toHaveBeenCalledWith(
                'user-123',
                'task-123',
                { title: 'Test Subtask' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { task: mockSubtask },
                '子任务已创建'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when subtask creation fails', async () => {
            req.params = { id: 'task-123' };
            req.body = { title: 'Test Subtask' };
            const error = new Error('Subtask creation failed');
            tasksService.createSubtask.mockRejectedValue(error);

            await tasksController.createSubtask(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });
});