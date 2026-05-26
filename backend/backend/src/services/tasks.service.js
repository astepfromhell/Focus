const Task = require('../models/Task');
const Tag = require('../models/Tag');

const normalizeTags = (input) => {
    if (input === undefined || input === null) return [];
    if (Array.isArray(input)) {
        return input.map((t) => `${t}`.trim()).filter(Boolean);
    }
    if (typeof input === 'string') {
        return input
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }
    return [];
};

const prepareTags = (input) => {
    const tags = normalizeTags(input);
    return {
        tags,
        value: tags.length ? tags.join(',') : null,
    };
};

const registerTags = async (userId, tags = []) => {
    if (!tags.length) return;
    await Promise.all(tags.map((name) => Tag.upsertTag({ userId, name, type: 'task' })));
};

const sanitizePagination = ({ page = 1, limit = 20 }) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    return { page: p, limit: l };
};

const tasksService = {
    async createTask(userId, payload, parentTaskId = null) {
        const { tags, value } = prepareTags(payload.tags);

        //console.log('📝 创建任务 - 接收到的payload:', payload);

        // 处理开始日期和时间
        let start_date = null;
        let start_time = null;
        let due_time = null;

        if (payload.type === 'short') {
            // 对于短任务，现在前端已经发送了分开的 start_date 和 start_time 字段
            start_date = payload.start_date || null;
            start_time = payload.start_time || null;

            //console.log(`📅 短任务日期时间: start_date=${start_date}, start_time=${start_time}`);

            // 处理结束时间
            if (payload.due_time) {
                // 检查是否已经是 HH:mm:ss 格式
                const timeRegex = /^\d{1,2}:\d{2}:\d{2}$/;
                if (timeRegex.test(payload.due_time)) {
                    // 已经是完整格式，直接使用
                    due_time = payload.due_time;
                } else if (payload.due_time.includes(':')) {
                    // HH:mm 格式，添加秒数
                    due_time = `${payload.due_time}:00`;
                } else {
                    // 只有小时，添加分钟和秒数
                    due_time = `${payload.due_time}:00:00`;
                }
                //console.log(`🕒 结束时间格式化: ${payload.due_time} -> ${due_time}`);
            }
        } else if (payload.type === 'long') {
            // 长任务只使用日期
            start_date = payload.start_date || null;
            start_time = null; // 长任务没有开始时间
            due_time = null;   // 长任务没有结束时间
        }

        // console.log('📝 准备创建任务的数据:', {
        //     type: payload.type,
        //     start_date,
        //     start_time,
        //     end_date: payload.end_date,
        //     due_time
        // });

        // ✅ 使用驼峰命名调用 Task.create
        const task = await Task.create({
            userId,
            title: payload.title,
            description: payload.description || null,
            type: payload.type,
            startDate: start_date,                    // ✅ 驼峰命名
            startTime: start_time,                    // ✅ 驼峰命名
            endDate: payload.end_date || null,
            dueTime: due_time,                        // ✅ 驼峰命名
            priority: payload.priority || 'medium',
            status: payload.status || 'pending',
            tags: value,
            remindAt: payload.remind_at || null,
            parentTaskId: parentTaskId,
            sortOrder: payload.sort_order || 0,
        });

        await registerTags(userId, tags);
        return task;
    },

    async listTasks(userId, filters = {}) {
        console.log('📋 listTasks 收到的 filters:', filters);  // 添加这行

        const { page, limit } = sanitizePagination(filters);
        const query = {
            userId,
            page,
            limit,
            type: filters.type,
            status: filters.status,
            priority: filters.priority,
            startDate: filters.start_date,
            endDate: filters.end_date,
        };

        console.log('📋 listTasks 构建的 query:', query);  // 添加这行

        try {
            const [items, total] = await Promise.all([
                Task.listByFilters(query),
                Task.countByFilters(query),
            ]);
            console.log('📋 listTasks 查询结果: items=', items.length, 'total=', total);  // 添加这行
            return {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit) || 1,
                },
            };
        } catch (err) {
            console.error('❌ listTasks 错误:', err);  // 添加这行
            throw err;
        }
    },

    async listToday(userId) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;
        const items = await Task.listToday(userId, iso);
        return { items };
    },

    async getCalendarView(userId, { start_date, end_date }) {
        const tasks = await Task.listForCalendar(userId, start_date, end_date);
        const calendarMap = new Map();

        tasks.forEach((task) => {
            const shortDates = [];

            if (task.type === 'short') {
                // 短任务：只在其具体日期显示
                const taskDate = task.start_date;
                if (taskDate) {
                    shortDates.push(taskDate);
                }
            } else {
                // 长任务：在日期范围内每天显示
                const start = new Date(task.start_date || start_date);
                const finish = new Date(task.end_date || end_date);
                for (let d = new Date(start); d <= finish; d.setDate(d.getDate() + 1)) {
                    shortDates.push(d.toISOString().slice(0, 10));
                }
            }

            shortDates.forEach((date) => {
                if (!calendarMap.has(date)) {
                    calendarMap.set(date, { date, shortTasks: [], longTasks: [] });
                }
                const bucket = calendarMap.get(date);
                if (task.type === 'short') {
                    bucket.shortTasks.push(task);
                } else {
                    bucket.longTasks.push(task);
                }
            });
        });

        // 对每个日期的短任务按开始时间排序
        calendarMap.forEach((bucket) => {
            bucket.shortTasks.sort((a, b) => {
                const timeA = a.start_time || '23:59:59';
                const timeB = b.start_time || '23:59:59';
                return timeA.localeCompare(timeB);
            });
        });

        const dates = Array.from(calendarMap.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
        return { dates };
    },

    async getTask(userId, id) {
        const task = await Task.findByIdForUser(id, userId);
        if (!task) throw { status: 404, message: 'Task not found', code: 'NOT_FOUND' };
        return task;
    },

    async updateTask(userId, id, payload) {
        const updates = { ...payload };
        let tagsToRegister = [];

        // 处理开始时间和日期的更新
        if (payload.type === 'short') {
            // 前端已发送分开的 start_date 和 start_time 字段
            if (payload.start_date !== undefined) {
                updates.startDate = payload.start_date;  // ✅ 转为驼峰
                delete updates.start_date;                // ✅ 删除下划线版本
            }
            if (payload.start_time !== undefined) {
                updates.startTime = payload.start_time;  // ✅ 转为驼峰
                delete updates.start_time;                // ✅ 删除下划线版本
            }
        } else if (payload.type === 'long') {
            // 长任务
            if (payload.start_date !== undefined) {
                updates.startDate = payload.start_date;  // ✅ 转为驼峰
                delete updates.start_date;
            }
            if (payload.end_date !== undefined) {
                updates.endDate = payload.end_date;      // ✅ 转为驼峰
                delete updates.end_date;
            }
        }

        // 处理结束时间的更新
        if (payload.due_time !== undefined && payload.type === 'short') {
            // 检查是否已经是 HH:mm:ss 格式
            const timeRegex = /^\d{1,2}:\d{2}:\d{2}$/;
            if (timeRegex.test(payload.due_time)) {
                updates.dueTime = payload.due_time;      // ✅ 转为驼峰
            } else if (payload.due_time.includes(':')) {
                updates.dueTime = `${payload.due_time}:00`;
            } else {
                updates.dueTime = `${payload.due_time}:00:00`;
            }
            delete updates.due_time;  // ✅ 删除下划线版本
        }

        if (payload.tags !== undefined) {
            const { tags, value } = prepareTags(payload.tags);
            updates.tags = value;
            tagsToRegister = tags;
        }

        const task = await Task.updateById(id, userId, updates);
        if (!task) throw { status: 404, message: 'Task not found', code: 'NOT_FOUND' };
        await registerTags(userId, tagsToRegister);
        return task;
    },

    async completeTask(userId, id) {
        const task = await Task.setStatus(id, userId, 'completed');
        if (!task) throw { status: 404, message: 'Task not found', code: 'NOT_FOUND' };
        return task;
    },

    async reorderTask(userId, id, sortOrder) {
        const task = await Task.setSortOrder(id, userId, sortOrder);
        if (!task) throw { status: 404, message: 'Task not found', code: 'NOT_FOUND' };
        return task;
    },

    async deleteTask(userId, id) {
        const ok = await Task.deleteById(id, userId);
        if (!ok) throw { status: 404, message: 'Task not found', code: 'NOT_FOUND' };
    },

    async createSubtask(userId, parentId, payload) {
        await this.getTask(userId, parentId);
        return this.createTask(userId, payload, parentId);
    },

    // 新增：检查时间冲突
    async checkTimeConflict(userId, taskId, date, startTime, endTime) {
        const tasks = await Task.checkTimeConflict(userId, date, startTime, endTime, taskId);
        return tasks;
    },

    // 新增：获取指定日期的短任务
    async getShortTasksByDate(userId, date) {
        const tasks = await Task.listShortTasksByDate(userId, date);
        return tasks;
    }
};

module.exports = tasksService;