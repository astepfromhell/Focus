const Task = require('../../../src/models/Task');
const db = require('../../../src/models/index');

jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('Task Model', () => {
    const mockUserId = 1;
    const mockTaskId = 100;

    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.log in tests
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe('Constants', () => {
        it('should export STATUS_VALUES', () => {
            expect(Task.STATUS_VALUES).toEqual(['pending', 'in_progress', 'completed', 'cancelled']);
        });

        it('should export TYPE_VALUES', () => {
            expect(Task.TYPE_VALUES).toEqual(['short', 'long']);
        });

        it('should export PRIORITY_VALUES', () => {
            expect(Task.PRIORITY_VALUES).toEqual(['low', 'medium', 'high']);
        });
    });

    describe('create', () => {
        it('should create a task with all parameters', async () => {
            const mockInsertResult = { insertId: mockTaskId, affectedRows: 1 };
            const mockTask = {
                id: mockTaskId,
                user_id: mockUserId,
                title: 'Test Task',
                description: 'Description',
                type: 'short',
                start_date: '2024-01-15',
                start_time: '10:00:00',
                end_date: '2024-01-15',
                due_time: '11:00:00',
                priority: 'high',
                status: 'pending',
                tags: 'work,urgent',
                remind_at: '2024-01-15T09:45:00Z',
                sort_order: 5,
                parent_task_id: null,
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockTask]);

            const result = await Task.create({
                userId: mockUserId,
                title: 'Test Task',
                description: 'Description',
                type: 'short',
                startDate: '2024-01-15',
                startTime: '10:00:00',
                endDate: '2024-01-15',
                dueTime: '11:00:00',
                priority: 'high',
                status: 'pending',
                tags: 'work,urgent',
                remindAt: '2024-01-15T09:45:00Z',
                sortOrder: 5,
            });

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO tasks'),
                [mockUserId, null, 'Test Task', 'Description', 'short', '2024-01-15', '10:00:00', '2024-01-15', '11:00:00', 'high', 'pending', 'work,urgent', '2024-01-15T09:45:00Z', 5]
            );
            expect(result).toEqual(mockTask);
        });

        it('should create a task with default values', async () => {
            const mockInsertResult = { insertId: mockTaskId, affectedRows: 1 };
            const mockTask = {
                id: mockTaskId,
                title: 'Simple Task',
                type: 'short',
                priority: 'medium',
                status: 'pending',
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockTask]);

            const result = await Task.create({
                userId: mockUserId,
                title: 'Simple Task',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO tasks'),
                [mockUserId, null, 'Simple Task', null, 'short', null, null, null, null, 'medium', 'pending', null, null, 0]
            );
            expect(result).toEqual(mockTask);
        });

        it('should set completed_at when status is completed', async () => {
            const mockInsertResult = { insertId: mockTaskId, affectedRows: 1 };
            const mockTask = {
                id: mockTaskId,
                title: 'Completed Task',
                status: 'completed',
                completed_at: new Date(),
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockTask]);

            const result = await Task.create({
                userId: mockUserId,
                title: 'Completed Task',
                status: 'completed',
            });

            expect(db.query).toHaveBeenCalledTimes(3);
            expect(db.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('UPDATE tasks SET completed_at = CURRENT_TIMESTAMP'),
                [mockTaskId]
            );
            expect(result).toEqual(mockTask);
        });

        it('should create a subtask with parent_task_id', async () => {
            const mockInsertResult = { insertId: mockTaskId, affectedRows: 1 };
            const mockTask = {
                id: mockTaskId,
                parent_task_id: 50,
                title: 'Subtask',
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockTask]);

            const result = await Task.create({
                userId: mockUserId,
                title: 'Subtask',
                parentTaskId: 50,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO tasks'),
                expect.arrayContaining([50])
            );
            expect(result.parent_task_id).toBe(50);
        });

        it('should handle creation errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                Task.create({
                    userId: mockUserId,
                    title: 'Test Task',
                })
            ).rejects.toThrow('Database error');
        });
    });

    describe('findByIdForUser', () => {
        it('should find a task by id and user id', async () => {
            const mockTask = {
                id: mockTaskId,
                user_id: mockUserId,
                title: 'Test Task',
                status: 'pending',
            };

            db.query.mockResolvedValue([mockTask]);

            const result = await Task.findByIdForUser(mockTaskId, mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockTaskId, mockUserId]
            );
            expect(result).toEqual(mockTask);
        });

        it('should return null when task is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await Task.findByIdForUser(999, mockUserId);

            expect(result).toBeNull();
        });

        it('should return null when task belongs to different user', async () => {
            db.query.mockResolvedValue([]);

            const result = await Task.findByIdForUser(mockTaskId, 999);

            expect(result).toBeNull();
        });
    });

    describe('listByFilters', () => {
        it('should list tasks with default pagination', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1' },
                { id: 2, title: 'Task 2' },
            ];

            db.query.mockResolvedValue(mockTasks);

            const result = await Task.listByFilters({ userId: mockUserId });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUserId, 20, 0]
            );
            expect(result).toEqual(mockTasks);
        });

        it('should filter by type', async () => {
            const mockTasks = [{ id: 1, type: 'long' }];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                type: 'long',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('type = ?'),
                [mockUserId, 'long', 20, 0]
            );
        });

        it('should filter by status', async () => {
            const mockTasks = [{ id: 1, status: 'completed' }];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                status: 'completed',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('status = ?'),
                [mockUserId, 'completed', 20, 0]
            );
        });

        it('should filter by priority', async () => {
            const mockTasks = [{ id: 1, priority: 'high' }];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                priority: 'high',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('priority = ?'),
                [mockUserId, 'high', 20, 0]
            );
        });

        it('should filter by date range', async () => {
            const mockTasks = [{ id: 1 }];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('COALESCE'),
                [mockUserId, '2024-01-01', '2024-01-31', 20, 0]
            );
        });

        it('should support custom pagination', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                limit: 50,
                page: 3,
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.anything(),
                [mockUserId, 50, 100]
            );
        });

        it('should ignore invalid filter values', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                type: 'invalid',
                status: 'invalid',
                priority: 'invalid',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.anything(),
                [mockUserId, 20, 0]
            );
        });

        it('should combine multiple filters', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByFilters({
                userId: mockUserId,
                type: 'short',
                status: 'pending',
                priority: 'high',
                startDate: '2024-01-01',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('user_id = ?'),
                [mockUserId, 'short', 'pending', 'high', '2024-01-01', 20, 0]
            );
        });
    });

    describe('countByFilters', () => {
        it('should count tasks for a user', async () => {
            db.query.mockResolvedValue([{ total: 42 }]);

            const result = await Task.countByFilters({ userId: mockUserId });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*)'),
                [mockUserId]
            );
            expect(result).toBe(42);
        });

        it('should count with filters', async () => {
            db.query.mockResolvedValue([{ total: 10 }]);

            const result = await Task.countByFilters({
                userId: mockUserId,
                status: 'completed',
                type: 'short',
            });

            expect(result).toBe(10);
        });

        it('should return 0 when no tasks found', async () => {
            db.query.mockResolvedValue([{ total: 0 }]);

            const result = await Task.countByFilters({ userId: mockUserId });

            expect(result).toBe(0);
        });

        it('should handle empty result', async () => {
            db.query.mockResolvedValue([]);

            const result = await Task.countByFilters({ userId: mockUserId });

            expect(result).toBe(0);
        });
    });

    describe('listToday', () => {
        it('should list tasks for today', async () => {
            const mockTasks = [
                { id: 1, type: 'short', start_date: '2024-01-15' },
                { id: 2, type: 'long', start_date: '2024-01-10', end_date: '2024-01-20' },
            ];

            db.query.mockResolvedValue(mockTasks);

            const result = await Task.listToday(mockUserId, '2024-01-15');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE user_id = ?'),
                [mockUserId, '2024-01-15', '2024-01-15', '2024-01-15']
            );
            expect(result).toEqual(mockTasks);
        });

        it('should order by start_time with nulls last', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listToday(mockUserId, '2024-01-15');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/WHEN\s+start_time\s+IS\s+NOT\s+NULL\s+THEN\s+start_time\s+ELSE\s+'23:59:59'/),
                expect.any(Array)
            );
        });
    });

    describe('listForCalendar', () => {
        it('should list tasks for calendar date range', async () => {
            const mockTasks = [
                { id: 1, start_date: '2024-01-10', end_date: '2024-01-15' },
                { id: 2, start_date: '2024-01-20', end_date: '2024-01-25' },
            ];

            db.query.mockResolvedValue(mockTasks);

            const result = await Task.listForCalendar(mockUserId, '2024-01-01', '2024-01-31');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE user_id = ?'),
                [mockUserId, '2024-01-01', '2024-01-31', '2024-01-01', '2024-01-31', '2024-01-01', '2024-01-31']
            );
            expect(result).toEqual(mockTasks);
        });

        it('should include tasks spanning the date range', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listForCalendar(mockUserId, '2024-01-10', '2024-01-20');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('start_date <= ? AND end_date >= ?'),
                expect.any(Array)
            );
        });
    });

    describe('updateById', () => {
        it('should update task title', async () => {
            const mockUpdatedTask = {
                id: mockTaskId,
                title: 'Updated Title',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedTask]);

            const result = await Task.updateById(mockTaskId, mockUserId, {
                title: 'Updated Title',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE tasks SET title = ?'),
                ['Updated Title', mockTaskId, mockUserId]
            );
            expect(result).toEqual(mockUpdatedTask);
        });

        it('should update multiple fields', async () => {
            const mockUpdatedTask = { id: mockTaskId };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedTask]);

            await Task.updateById(mockTaskId, mockUserId, {
                title: 'New Title',
                description: 'New Description',
                priority: 'high',
                startDate: '2024-01-20',
                startTime: '14:00:00',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE tasks SET'),
                ['New Title', 'New Description', '2024-01-20', '14:00:00', 'high', mockTaskId, mockUserId]
            );
        });

        it('should update parentTaskId', async () => {
            const mockUpdatedTask = {
                id: mockTaskId,
                parent_task_id: 50,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedTask]);

            const result = await Task.updateById(mockTaskId, mockUserId, {
                parentTaskId: 50,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('parent_task_id = ?'),
                [50, mockTaskId, mockUserId]
            );
            expect(result.parent_task_id).toBe(50);
        });

        it('should return current task when no fields to update', async () => {
            const mockTask = { id: mockTaskId, title: 'Original' };

            db.query.mockResolvedValue([mockTask]);

            const result = await Task.updateById(mockTaskId, mockUserId, {});

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockTask);
        });

        it('should ignore undefined fields', async () => {
            const mockTask = { id: mockTaskId };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockTask]);

            await Task.updateById(mockTaskId, mockUserId, {
                title: 'New Title',
                description: undefined,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                'UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?',
                ['New Title', mockTaskId, mockUserId]
            );
        });
    });

    describe('setStatus', () => {
        it('should set task status to completed', async () => {
            const mockCompletedTask = {
                id: mockTaskId,
                status: 'completed',
                completed_at: new Date(),
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockCompletedTask]);

            const result = await Task.setStatus(mockTaskId, mockUserId, 'completed');

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('status = ?, completed_at = CASE WHEN'),
                ['completed', 'completed', mockTaskId, mockUserId]
            );
            expect(result).toEqual(mockCompletedTask);
        });

        it('should set task status to in_progress', async () => {
            const mockTask = {
                id: mockTaskId,
                status: 'in_progress',
                completed_at: null,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockTask]);

            const result = await Task.setStatus(mockTaskId, mockUserId, 'in_progress');

            expect(result).toEqual(mockTask);
            expect(result.completed_at).toBeNull();
        });

        it('should return null when task is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Task.setStatus(999, mockUserId, 'completed');

            expect(result).toBeNull();
        });
    });

    describe('setSortOrder', () => {
        it('should update task sort order', async () => {
            const mockTask = {
                id: mockTaskId,
                sort_order: 10,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockTask]);

            const result = await Task.setSortOrder(mockTaskId, mockUserId, 10);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE tasks SET sort_order = ?'),
                [10, mockTaskId, mockUserId]
            );
            expect(result).toEqual(mockTask);
        });

        it('should return null when task is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Task.setSortOrder(999, mockUserId, 5);

            expect(result).toBeNull();
        });
    });

    describe('deleteById', () => {
        it('should delete a task and its subtasks', async () => {
            db.query.mockResolvedValue({ affectedRows: 3 });

            const result = await Task.deleteById(mockTaskId, mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM tasks WHERE (id = ? OR parent_task_id = ?) AND user_id = ?',
                [mockTaskId, mockTaskId, mockUserId]
            );
            expect(result).toBe(true);
        });

        it('should return false when task is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Task.deleteById(999, mockUserId);

            expect(result).toBe(false);
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(Task.deleteById(mockTaskId, mockUserId)).rejects.toThrow('Database error');
        });
    });

    describe('listByDateTime', () => {
        it('should list tasks by date and time', async () => {
            const mockTasks = [
                { id: 1, start_date: '2024-01-15', start_time: '10:00:00' },
                { id: 2, start_date: '2024-01-15', start_time: '10:00:00' },
            ];

            db.query.mockResolvedValue(mockTasks);

            const result = await Task.listByDateTime(mockUserId, '2024-01-15', '10:00:00');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('start_date = ?'),
                [mockUserId, '2024-01-15', '10:00:00']
            );
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('start_time = ?'),
                expect.any(Array)
            );
            expect(result).toEqual(mockTasks);
        });

        it('should only return short type tasks', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listByDateTime(mockUserId, '2024-01-15', '10:00:00');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("type = 'short'"),
                expect.any(Array)
            );
        });
    });

    describe('listShortTasksByDate', () => {
        it('should list short tasks for a date', async () => {
            const mockTasks = [
                { id: 1, type: 'short', start_date: '2024-01-15', start_time: '09:00:00' },
                { id: 2, type: 'short', start_date: '2024-01-15', start_time: '14:00:00' },
                { id: 3, type: 'short', start_date: '2024-01-15', start_time: null },
            ];

            db.query.mockResolvedValue(mockTasks);

            const result = await Task.listShortTasksByDate(mockUserId, '2024-01-15');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('start_date = ?'),
                [mockUserId, '2024-01-15']
            );
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("type = 'short'"),
                expect.any(Array)
            );
            expect(result).toEqual(mockTasks);
        });

        it('should order by start_time with nulls last', async () => {
            const mockTasks = [];

            db.query.mockResolvedValue(mockTasks);

            await Task.listShortTasksByDate(mockUserId, '2024-01-15');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/WHEN\s+start_time\s+IS\s+NOT\s+NULL\s+THEN\s+start_time\s+ELSE\s+'23:59:59'/),
                expect.any(Array)
            );
        });
    });

    describe('checkTimeConflict', () => {
        it('should find conflicting tasks', async () => {
            const mockConflicts = [
                { id: 5, title: 'Conflicting Task', start_time: '09:30:00', due_time: '10:30:00' },
            ];

            db.query.mockResolvedValue(mockConflicts);

            const result = await Task.checkTimeConflict(
                mockUserId,
                '2024-01-15',
                '10:00:00',
                '11:00:00'
            );

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('start_date = ?'),
                [mockUserId, '2024-01-15', '11:00:00', '10:00:00', '10:00:00', '11:00:00', '10:00:00', '11:00:00']
            );
            expect(result).toEqual(mockConflicts);
        });

        it('should exclude a specific task when checking conflicts', async () => {
            const mockConflicts = [];

            db.query.mockResolvedValue(mockConflicts);

            await Task.checkTimeConflict(
                mockUserId,
                '2024-01-15',
                '10:00:00',
                '11:00:00',
                mockTaskId
            );

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('AND id != ?'),
                [mockUserId, '2024-01-15', '11:00:00', '10:00:00', '10:00:00', '11:00:00', '10:00:00', '11:00:00', mockTaskId]
            );
        });

        it('should not include completed tasks in conflict check', async () => {
            const mockConflicts = [];

            db.query.mockResolvedValue(mockConflicts);

            await Task.checkTimeConflict(
                mockUserId,
                '2024-01-15',
                '10:00:00',
                '11:00:00'
            );

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("status != 'completed'"),
                expect.any(Array)
            );
        });

        it('should return empty array when no conflicts', async () => {
            db.query.mockResolvedValue([]);

            const result = await Task.checkTimeConflict(
                mockUserId,
                '2024-01-15',
                '10:00:00',
                '11:00:00'
            );

            expect(result).toEqual([]);
        });
    });
});