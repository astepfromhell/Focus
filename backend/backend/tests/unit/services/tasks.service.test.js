const tasksService = require('../../../src/services/tasks.service');
const Task = require('../../../src/models/Task');
const Tag = require('../../../src/models/Tag');

jest.mock('../../../src/models/Task');
jest.mock('../../../src/models/Tag');

describe('TasksService', () => {
    const mockUserId = 'user123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('应该成功创建短任务并处理时间格式', async () => {
            const payload = {
                title: '测试任务',
                description: '测试描述',
                type: 'short',
                start_date: '2024-01-15',
                start_time: '10:00:00',
                due_time: '12:00',
                priority: 'high',
                status: 'pending',
                tags: ['tag1', 'tag2']
            };

            const mockTask = { id: 1, ...payload };
            Task.create.mockResolvedValue(mockTask);
            Tag.upsertTag.mockResolvedValue({});

            const result = await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith({
                userId: mockUserId,
                title: payload.title,
                description: payload.description,
                type: 'short',
                startDate: '2024-01-15',
                startTime: '10:00:00',
                endDate: null,
                dueTime: '12:00:00',
                priority: 'high',
                status: 'pending',
                tags: 'tag1,tag2',
                remindAt: null,
                parentTaskId: null,
                sortOrder: 0
            });
            expect(Tag.upsertTag).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockTask);
        });

        it('应该处理只有小时的due_time格式', async () => {
            const payload = {
                title: '测试任务',
                type: 'short',
                start_date: '2024-01-15',
                due_time: '14'
            };

            const mockTask = { id: 1, ...payload };
            Task.create.mockResolvedValue(mockTask);

            await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    dueTime: '14:00:00'
                })
            );
        });

        it('应该处理HH:mm格式的due_time', async () => {
            const payload = {
                title: '测试任务',
                type: 'short',
                start_date: '2024-01-15',
                due_time: '14:30'
            };

            const mockTask = { id: 1, ...payload };
            Task.create.mockResolvedValue(mockTask);

            await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    dueTime: '14:30:00'
                })
            );
        });

        it('应该处理完整HH:mm:ss格式的due_time', async () => {
            const payload = {
                title: '测试任务',
                type: 'short',
                start_date: '2024-01-15',
                due_time: '14:30:45'
            };

            const mockTask = { id: 1, ...payload };
            Task.create.mockResolvedValue(mockTask);

            await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    dueTime: '14:30:45'
                })
            );
        });

        it('应该成功创建长任务不包含时间字段', async () => {
            const payload = {
                title: '长期项目',
                type: 'long',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                tags: 'project,important'
            };

            const mockTask = { id: 2, ...payload };
            Task.create.mockResolvedValue(mockTask);
            Tag.upsertTag.mockResolvedValue({});

            const result = await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith({
                userId: mockUserId,
                title: payload.title,
                description: null,
                type: 'long',
                startDate: '2024-01-01',
                startTime: null,
                endDate: '2024-12-31',
                dueTime: null,
                priority: 'medium',
                status: 'pending',
                tags: 'project,important',
                remindAt: null,
                parentTaskId: null,
                sortOrder: 0
            });
            expect(result).toEqual(mockTask);
        });

        it('应该使用默认值创建任务', async () => {
            const payload = {
                title: '简单任务',
                type: 'short'
            };

            const mockTask = { id: 3, ...payload };
            Task.create.mockResolvedValue(mockTask);

            await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    priority: 'medium',
                    status: 'pending',
                    description: null,
                    tags: null
                })
            );
        });

        it('应该处理数组格式的标签', async () => {
            const payload = {
                title: '任务',
                type: 'short',
                tags: ['tag1', 'tag2', 'tag3']
            };

            const mockTask = { id: 4 };
            Task.create.mockResolvedValue(mockTask);
            Tag.upsertTag.mockResolvedValue({});

            await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: 'tag1,tag2,tag3'
                })
            );
            expect(Tag.upsertTag).toHaveBeenCalledTimes(3);
        });

        it('应该处理空标签', async () => {
            const payload = {
                title: '任务',
                type: 'short',
                tags: []
            };

            const mockTask = { id: 5 };
            Task.create.mockResolvedValue(mockTask);

            await tasksService.createTask(mockUserId, payload);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: null
                })
            );
            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });

        it('应该处理parentTaskId', async () => {
            const payload = {
                title: '子任务',
                type: 'short'
            };
            const parentTaskId = 'parent123';

            const mockTask = { id: 6 };
            Task.create.mockResolvedValue(mockTask);

            await tasksService.createTask(mockUserId, payload, parentTaskId);

            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    parentTaskId: 'parent123'
                })
            );
        });
    });

    describe('listTasks', () => {
        it('应该返回任务列表和分页信息', async () => {
            const filters = {
                page: 1,
                limit: 10,
                type: 'short',
                status: 'pending'
            };

            const mockTasks = [{ id: 1 }, { id: 2 }];
            const mockTotal = 25;

            Task.listByFilters.mockResolvedValue(mockTasks);
            Task.countByFilters.mockResolvedValue(mockTotal);

            const result = await tasksService.listTasks(mockUserId, filters);

            expect(result).toEqual({
                items: mockTasks,
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 25,
                    totalPages: 3
                }
            });
        });

        it('应该处理默认分页参数', async () => {
            Task.listByFilters.mockResolvedValue([]);
            Task.countByFilters.mockResolvedValue(0);

            const result = await tasksService.listTasks(mockUserId, {});

            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    limit: 20
                })
            );
            expect(result.pagination).toEqual({
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 1
            });
        });

        it('应该限制最大页面大小为100', async () => {
            const filters = { limit: 200 };

            Task.listByFilters.mockResolvedValue([]);
            Task.countByFilters.mockResolvedValue(0);

            await tasksService.listTasks(mockUserId, filters);

            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({
                    limit: 100
                })
            );
        });

        it('应该处理无效的页码', async () => {
            const filters = { page: -5, limit: 0 };

            Task.listByFilters.mockResolvedValue([]);
            Task.countByFilters.mockResolvedValue(0);

            await tasksService.listTasks(mockUserId, filters);

            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 1,
                    limit: 20  // limit为0时会使用默认值20
                })
            );
        });

        it('应该处理各种无效的limit值', async () => {
            Task.listByFilters.mockResolvedValue([]);
            Task.countByFilters.mockResolvedValue(0);

            // 测试负数limit - Math.max(1, 负数) = 1
            await tasksService.listTasks(mockUserId, { limit: -10 });
            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 1 })
            );

            // 测试NaN - Number('invalid') || 20 = 20
            await tasksService.listTasks(mockUserId, { limit: 'invalid' });
            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 20 })
            );

            // 测试null - Number(null) = 0, 0 || 20 = 20
            await tasksService.listTasks(mockUserId, { limit: null });
            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 20 })
            );
        });

        it('应该正确处理有效的小limit值', async () => {
            Task.listByFilters.mockResolvedValue([]);
            Task.countByFilters.mockResolvedValue(0);

            await tasksService.listTasks(mockUserId, { limit: 5 });
            expect(Task.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({ limit: 5 })
            );
        });
    });

    describe('listToday', () => {
        it('应该返回今天的任务', async () => {
            const mockTasks = [{ id: 1 }, { id: 2 }];
            Task.listToday.mockResolvedValue(mockTasks);

            const result = await tasksService.listToday(mockUserId);

            expect(Task.listToday).toHaveBeenCalledWith(
                mockUserId,
                expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
            );
            expect(result).toEqual({ items: mockTasks });
        });
    });

    describe('getCalendarView', () => {
        it('应该正确处理短任务的日历视图', async () => {
            const mockTasks = [
                {
                    id: 1,
                    type: 'short',
                    start_date: '2024-01-15',
                    start_time: '10:00:00',
                    title: '短任务1'
                },
                {
                    id: 2,
                    type: 'short',
                    start_date: '2024-01-15',
                    start_time: '14:00:00',
                    title: '短任务2'
                }
            ];

            Task.listForCalendar.mockResolvedValue(mockTasks);

            const result = await tasksService.getCalendarView(mockUserId, {
                start_date: '2024-01-01',
                end_date: '2024-01-31'
            });

            expect(result.dates).toHaveLength(1);
            expect(result.dates[0].date).toBe('2024-01-15');
            expect(result.dates[0].shortTasks).toHaveLength(2);
            expect(result.dates[0].shortTasks[0].start_time).toBe('10:00:00');
            expect(result.dates[0].shortTasks[1].start_time).toBe('14:00:00');
        });

        it('应该正确处理长任务的日历视图', async () => {
            const mockTasks = [
                {
                    id: 1,
                    type: 'long',
                    start_date: '2024-01-15',
                    end_date: '2024-01-17',
                    title: '长任务'
                }
            ];

            Task.listForCalendar.mockResolvedValue(mockTasks);

            const result = await tasksService.getCalendarView(mockUserId, {
                start_date: '2024-01-01',
                end_date: '2024-01-31'
            });

            expect(result.dates).toHaveLength(3);
            expect(result.dates[0].date).toBe('2024-01-15');
            expect(result.dates[1].date).toBe('2024-01-16');
            expect(result.dates[2].date).toBe('2024-01-17');
            result.dates.forEach(date => {
                expect(date.longTasks).toHaveLength(1);
            });
        });

        it('应该按时间排序短任务', async () => {
            const mockTasks = [
                {
                    id: 1,
                    type: 'short',
                    start_date: '2024-01-15',
                    start_time: '14:00:00'
                },
                {
                    id: 2,
                    type: 'short',
                    start_date: '2024-01-15',
                    start_time: '09:00:00'
                },
                {
                    id: 3,
                    type: 'short',
                    start_date: '2024-01-15',
                    start_time: null
                }
            ];

            Task.listForCalendar.mockResolvedValue(mockTasks);

            const result = await tasksService.getCalendarView(mockUserId, {
                start_date: '2024-01-01',
                end_date: '2024-01-31'
            });

            const shortTasks = result.dates[0].shortTasks;
            expect(shortTasks[0].start_time).toBe('09:00:00');
            expect(shortTasks[1].start_time).toBe('14:00:00');
            expect(shortTasks[2].start_time).toBeNull();
        });

        it('应该混合处理短任务和长任务', async () => {
            const mockTasks = [
                {
                    id: 1,
                    type: 'short',
                    start_date: '2024-01-15',
                    start_time: '10:00:00'
                },
                {
                    id: 2,
                    type: 'long',
                    start_date: '2024-01-15',
                    end_date: '2024-01-16'
                }
            ];

            Task.listForCalendar.mockResolvedValue(mockTasks);

            const result = await tasksService.getCalendarView(mockUserId, {
                start_date: '2024-01-01',
                end_date: '2024-01-31'
            });

            expect(result.dates).toHaveLength(2);
            expect(result.dates[0].shortTasks).toHaveLength(1);
            expect(result.dates[0].longTasks).toHaveLength(1);
            expect(result.dates[1].longTasks).toHaveLength(1);
        });
    });

    describe('getTask', () => {
        it('应该返回找到的任务', async () => {
            const mockTask = { id: 1, title: '测试任务' };
            Task.findByIdForUser.mockResolvedValue(mockTask);

            const result = await tasksService.getTask(mockUserId, 1);

            expect(Task.findByIdForUser).toHaveBeenCalledWith(1, mockUserId);
            expect(result).toEqual(mockTask);
        });

        it('应该在任务不存在时抛出404错误', async () => {
            Task.findByIdForUser.mockResolvedValue(null);

            await expect(tasksService.getTask(mockUserId, 999))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'Task not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('updateTask', () => {
        it('应该更新短任务的日期和时间字段', async () => {
            const payload = {
                type: 'short',
                start_date: '2024-01-20',
                start_time: '11:00:00',
                due_time: '13:30'
            };

            const mockTask = { id: 1, ...payload };
            Task.updateById.mockResolvedValue(mockTask);

            await tasksService.updateTask(mockUserId, 1, payload);

            expect(Task.updateById).toHaveBeenCalledWith(1, mockUserId, {
                type: 'short',
                startDate: '2024-01-20',
                startTime: '11:00:00',
                dueTime: '13:30:00'
            });
        });

        it('应该更新长任务的日期字段', async () => {
            const payload = {
                type: 'long',
                start_date: '2024-01-01',
                end_date: '2024-06-30'
            };

            const mockTask = { id: 1 };
            Task.updateById.mockResolvedValue(mockTask);

            await tasksService.updateTask(mockUserId, 1, payload);

            expect(Task.updateById).toHaveBeenCalledWith(1, mockUserId, {
                type: 'long',
                startDate: '2024-01-01',
                endDate: '2024-06-30'
            });
        });

        it('应该处理due_time的不同格式', async () => {
            const payload1 = { type: 'short', due_time: '14' };
            const payload2 = { type: 'short', due_time: '14:30' };
            const payload3 = { type: 'short', due_time: '14:30:45' };

            Task.updateById.mockResolvedValue({ id: 1 });

            await tasksService.updateTask(mockUserId, 1, payload1);
            expect(Task.updateById).toHaveBeenCalledWith(1, mockUserId,
                expect.objectContaining({ dueTime: '14:00:00' }));

            await tasksService.updateTask(mockUserId, 1, payload2);
            expect(Task.updateById).toHaveBeenCalledWith(1, mockUserId,
                expect.objectContaining({ dueTime: '14:30:00' }));

            await tasksService.updateTask(mockUserId, 1, payload3);
            expect(Task.updateById).toHaveBeenCalledWith(1, mockUserId,
                expect.objectContaining({ dueTime: '14:30:45' }));
        });

        it('应该更新标签', async () => {
            const payload = {
                tags: ['new-tag1', 'new-tag2']
            };

            const mockTask = { id: 1 };
            Task.updateById.mockResolvedValue(mockTask);
            Tag.upsertTag.mockResolvedValue({});

            await tasksService.updateTask(mockUserId, 1, payload);

            expect(Task.updateById).toHaveBeenCalledWith(1, mockUserId, {
                tags: 'new-tag1,new-tag2'
            });
            expect(Tag.upsertTag).toHaveBeenCalledTimes(2);
        });

        it('应该在任务不存在时抛出404错误', async () => {
            Task.updateById.mockResolvedValue(null);

            await expect(tasksService.updateTask(mockUserId, 999, { title: '新标题' }))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'Task not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('completeTask', () => {
        it('应该标记任务为已完成', async () => {
            const mockTask = { id: 1, status: 'completed' };
            Task.setStatus.mockResolvedValue(mockTask);

            const result = await tasksService.completeTask(mockUserId, 1);

            expect(Task.setStatus).toHaveBeenCalledWith(1, mockUserId, 'completed');
            expect(result).toEqual(mockTask);
        });

        it('应该在任务不存在时抛出404错误', async () => {
            Task.setStatus.mockResolvedValue(null);

            await expect(tasksService.completeTask(mockUserId, 999))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'Task not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('reorderTask', () => {
        it('应该更新任务的排序顺序', async () => {
            const mockTask = { id: 1, sortOrder: 5 };
            Task.setSortOrder.mockResolvedValue(mockTask);

            const result = await tasksService.reorderTask(mockUserId, 1, 5);

            expect(Task.setSortOrder).toHaveBeenCalledWith(1, mockUserId, 5);
            expect(result).toEqual(mockTask);
        });

        it('应该在任务不存在时抛出404错误', async () => {
            Task.setSortOrder.mockResolvedValue(null);

            await expect(tasksService.reorderTask(mockUserId, 999, 5))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'Task not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('deleteTask', () => {
        it('应该成功删除任务', async () => {
            Task.deleteById.mockResolvedValue(true);

            await tasksService.deleteTask(mockUserId, 1);

            expect(Task.deleteById).toHaveBeenCalledWith(1, mockUserId);
        });

        it('应该在任务不存在时抛出404错误', async () => {
            Task.deleteById.mockResolvedValue(false);

            await expect(tasksService.deleteTask(mockUserId, 999))
                .rejects
                .toEqual({
                    status: 404,
                    message: 'Task not found',
                    code: 'NOT_FOUND'
                });
        });
    });

    describe('createSubtask', () => {
        it('应该创建子任务', async () => {
            const parentId = 'parent123';
            const payload = {
                title: '子任务',
                type: 'short'
            };

            const mockParentTask = { id: parentId };
            const mockSubtask = { id: 'sub123', parentTaskId: parentId };

            Task.findByIdForUser.mockResolvedValue(mockParentTask);
            Task.create.mockResolvedValue(mockSubtask);

            const result = await tasksService.createSubtask(mockUserId, parentId, payload);

            expect(Task.findByIdForUser).toHaveBeenCalledWith(parentId, mockUserId);
            expect(Task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    parentTaskId: parentId
                })
            );
            expect(result).toEqual(mockSubtask);
        });

        it('应该在父任务不存在时抛出错误', async () => {
            Task.findByIdForUser.mockResolvedValue(null);

            await expect(
                tasksService.createSubtask(mockUserId, 'nonexistent', { title: '子任务', type: 'short' })
            ).rejects.toEqual({
                status: 404,
                message: 'Task not found',
                code: 'NOT_FOUND'
            });
        });
    });

    describe('checkTimeConflict', () => {
        it('应该检查时间冲突', async () => {
            const date = '2024-01-15';
            const startTime = '10:00:00';
            const endTime = '12:00:00';
            const taskId = 'task123';

            const mockConflicts = [{ id: 'conflict1' }];
            Task.checkTimeConflict.mockResolvedValue(mockConflicts);

            const result = await tasksService.checkTimeConflict(
                mockUserId,
                taskId,
                date,
                startTime,
                endTime
            );

            expect(Task.checkTimeConflict).toHaveBeenCalledWith(
                mockUserId,
                date,
                startTime,
                endTime,
                taskId
            );
            expect(result).toEqual(mockConflicts);
        });
    });

    describe('getShortTasksByDate', () => {
        it('应该获取指定日期的短任务', async () => {
            const date = '2024-01-15';
            const mockTasks = [
                { id: 1, type: 'short' },
                { id: 2, type: 'short' }
            ];

            Task.listShortTasksByDate.mockResolvedValue(mockTasks);

            const result = await tasksService.getShortTasksByDate(mockUserId, date);

            expect(Task.listShortTasksByDate).toHaveBeenCalledWith(mockUserId, date);
            expect(result).toEqual(mockTasks);
        });
    });

    describe('Helper Functions', () => {
        describe('normalizeTags', () => {
            // 由于这些是内部函数，我们通过测试使用它们的公共方法来间接测试
            it('应该通过createTask处理不同格式的标签', async () => {
                Task.create.mockResolvedValue({ id: 1 });
                Tag.upsertTag.mockResolvedValue({});

                // 测试字符串格式
                await tasksService.createTask(mockUserId, {
                    title: 'test',
                    type: 'short',
                    tags: 'tag1, tag2, tag3'
                });
                expect(Task.create).toHaveBeenCalledWith(
                    expect.objectContaining({ tags: 'tag1,tag2,tag3' })
                );

                // 测试数组格式
                await tasksService.createTask(mockUserId, {
                    title: 'test',
                    type: 'short',
                    tags: ['tag1', 'tag2']
                });
                expect(Task.create).toHaveBeenCalledWith(
                    expect.objectContaining({ tags: 'tag1,tag2' })
                );

                // 测试空值
                await tasksService.createTask(mockUserId, {
                    title: 'test',
                    type: 'short',
                    tags: null
                });
                expect(Task.create).toHaveBeenCalledWith(
                    expect.objectContaining({ tags: null })
                );
            });

            it('应该过滤空标签', async () => {
                Task.create.mockResolvedValue({ id: 1 });
                Tag.upsertTag.mockResolvedValue({});

                await tasksService.createTask(mockUserId, {
                    title: 'test',
                    type: 'short',
                    tags: ['tag1', '', '  ', 'tag2']
                });

                expect(Task.create).toHaveBeenCalledWith(
                    expect.objectContaining({ tags: 'tag1,tag2' })
                );
                expect(Tag.upsertTag).toHaveBeenCalledTimes(2);
            });
        });
    });
});