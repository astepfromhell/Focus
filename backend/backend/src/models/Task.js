const db = require('./index');

const STATUS_VALUES = ['pending', 'in_progress', 'completed', 'cancelled'];
const TYPE_VALUES = ['short', 'long'];
const PRIORITY_VALUES = ['low', 'medium', 'high'];

// 更新 baseSelect，添加 start_time 字段
const baseSelect = `id, user_id, parent_task_id, title, description, type, start_date, start_time, end_date, due_time, priority, status, completed_at, tags, remind_at, reminder_sent, sort_order, created_at, updated_at`;

const mapFields = {
    title: 'title',
    description: 'description',
    type: 'type',
    startDate: 'start_date',
    startTime: 'start_time', // 新增开始时间字段映射
    endDate: 'end_date',
    dueTime: 'due_time',
    priority: 'priority',
    status: 'status',
    tags: 'tags',
    remindAt: 'remind_at',
};

const buildFilters = (filters = {}) => {
    const clauses = ['user_id = ?'];
    const values = [filters.userId || null];

    if (filters.type && TYPE_VALUES.includes(filters.type)) {
        clauses.push('type = ?');
        values.push(filters.type);
    }
    if (filters.status && STATUS_VALUES.includes(filters.status)) {
        clauses.push('status = ?');
        values.push(filters.status);
    }
    if (filters.priority && PRIORITY_VALUES.includes(filters.priority)) {
        clauses.push('priority = ?');
        values.push(filters.priority);
    }

    // ✅ 正确的日期范围查询逻辑
    if (filters.startDate && filters.endDate) {
        clauses.push(`(
            (type = 'short' AND start_date BETWEEN ? AND ?)
            OR
            (type = 'long' AND start_date <= ? AND end_date >= ?)
        )`);
        values.push(
            filters.startDate,
            filters.endDate,
            filters.endDate,
            filters.startDate
        );
    } else if (filters.startDate) {
        clauses.push('COALESCE(start_date, end_date) >= ?');
        values.push(filters.startDate);
    } else if (filters.endDate) {
        clauses.push('COALESCE(end_date, start_date) <= ?');
        values.push(filters.endDate);
    }

    return { where: clauses.join(' AND '), values };
};

const Task = {
    STATUS_VALUES,
    TYPE_VALUES,
    PRIORITY_VALUES,

    // ✅ 新增：格式化任务日期字段
    formatTaskDates(task) {
        if (!task) return task;

        // 将日期字段转换为纯日期字符串 (YYYY-MM-DD)
        if (task.start_date) {
            task.start_date = this.formatDateOnly(task.start_date);
        }
        if (task.end_date) {
            task.end_date = this.formatDateOnly(task.end_date);
        }
        // 保留时间字段的完整格式
        if (task.created_at) {
            task.created_at = new Date(task.created_at).toISOString();
        }
        if (task.updated_at) {
            task.updated_at = new Date(task.updated_at).toISOString();
        }
        if (task.completed_at) {
            task.completed_at = new Date(task.completed_at).toISOString();
        }

        return task;
    },

    // ✅ 新增：格式化为纯日期字符串
    formatDateOnly(date) {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    async create({
                     userId,
                     title,
                     description = null,
                     type = 'short',
                     startDate = null,
                     startTime = null,
                     endDate = null,
                     dueTime = null,
                     priority = 'medium',
                     status = 'pending',
                     tags = null,
                     remindAt = null,
                     parentTaskId = null,
                     sortOrder = 0,
                 }) {
        const sql = `INSERT INTO tasks (user_id, parent_task_id, title, description, type, start_date, start_time, end_date, due_time, priority, status, tags, remind_at, sort_order)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            userId,
            parentTaskId,
            title,
            description,
            type,
            startDate,
            startTime,
            endDate,
            dueTime,
            priority,
            status,
            tags,
            remindAt,
            sortOrder,
        ];

        const [result] = await db.query(sql, params);

        if (status === 'completed') {
            await db.query('UPDATE tasks SET completed_at = CURRENT_TIMESTAMP WHERE id = ?', [result.insertId]);
        }

        const createdTask = await this.findByIdForUser(result.insertId, userId);
        return createdTask;
    },

    async findByIdForUser(id, userId) {
        const sql = `SELECT ${baseSelect} FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`;
        const [rows] = await db.query(sql, [id, userId]);
        return rows[0] ? this.formatTaskDates(rows[0]) : null;  // ✅ 格式化
    },

    async listByFilters(filters = {}) {
        const { where, values } = buildFilters(filters);
        const limit = Number(filters.limit) || 20;
        const page = Number(filters.page) || 1;
        const offset = (page - 1) * limit;
        const sql = `SELECT ${baseSelect} FROM tasks WHERE ${where} ORDER BY sort_order ASC, priority DESC, created_at DESC LIMIT ? OFFSET ?`;
        const [rows] = await db.query(sql, [...values, limit, offset]);
        return rows.map(task => this.formatTaskDates(task));  // ✅ 批量格式化
    },

    async countByFilters(filters = {}) {
        const { where, values } = buildFilters(filters);
        const sql = `SELECT COUNT(*) AS total FROM tasks WHERE ${where}`;
        const [rows] = await db.query(sql, values);
        return rows[0]?.total || 0;
    },

    async listToday(userId, today) {
        const sql = `SELECT ${baseSelect} FROM tasks
                     WHERE user_id = ? AND (
                         (type = 'short' AND COALESCE(start_date, end_date) = ?)
                             OR (type = 'long' AND (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?))
                         )
                     ORDER BY
                         CASE
                             WHEN start_time IS NOT NULL THEN start_time
                             ELSE '23:59:59'
                             END ASC,
                         priority DESC, sort_order ASC, created_at DESC`;
        const [rows] = await db.query(sql, [userId, today, today, today]);
        return rows.map(task => this.formatTaskDates(task));  // ✅ 批量格式化
    },

    async listForCalendar(userId, startDate, endDate) {
        const sql = `SELECT ${baseSelect} FROM tasks
                     WHERE user_id = ?
                       AND (
                         (start_date BETWEEN ? AND ?)
                             OR (end_date BETWEEN ? AND ?)
                             OR (start_date <= ? AND end_date >= ?)
                             OR (start_date IS NULL AND end_date IS NULL)
                         )
                     ORDER BY
                         CASE
                             WHEN start_time IS NOT NULL THEN start_time
                             ELSE '23:59:59'
                             END ASC,
                         start_date ASC, end_date ASC, created_at DESC`;
        const [rows] = await db.query(sql, [userId, startDate, endDate, startDate, endDate, startDate, endDate]);
        return rows.map(task => this.formatTaskDates(task));  // ✅ 批量格式化
    },

    async updateById(id, userId, payload = {}) {
        const fields = [];
        const values = [];
        Object.entries(mapFields).forEach(([key, column]) => {
            if (payload[key] !== undefined) {
                fields.push(`${column} = ?`);
                values.push(payload[key]);
            }
        });
        if (payload.parentTaskId !== undefined) {
            fields.push('parent_task_id = ?');
            values.push(payload.parentTaskId);
        }
        if (!fields.length) return this.findByIdForUser(id, userId);
        const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
        await db.query(sql, [...values, id, userId]);
        return this.findByIdForUser(id, userId);  // ✅ 已经在 findByIdForUser 中格式化
    },

    async setStatus(id, userId, status) {
        const sql = `UPDATE tasks SET status = ?, completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ? AND user_id = ?`;
        const [result] = await db.query(sql, [status, status, id, userId]);
        if (!result.affectedRows) return null;
        return this.findByIdForUser(id, userId);  // ✅ 已经在 findByIdForUser 中格式化
    },

    async setSortOrder(id, userId, sortOrder) {
        const sql = `UPDATE tasks SET sort_order = ? WHERE id = ? AND user_id = ?`;
        const [result] = await db.query(sql, [sortOrder, id, userId]);
        if (!result.affectedRows) return null;
        return this.findByIdForUser(id, userId);  // ✅ 已经在 findByIdForUser 中格式化
    },

    async deleteById(id, userId) {
        const sql = 'DELETE FROM tasks WHERE (id = ? OR parent_task_id = ?) AND user_id = ?';
        const [result] = await db.query(sql, [id, id, userId]);
        return result.affectedRows > 0;
    },

    async listByDateTime(userId, date, time) {
        const sql = `SELECT ${baseSelect} FROM tasks
                 WHERE user_id = ? 
                   AND type = 'short'
                   AND start_date = ?
                   AND start_time = ?
                 ORDER BY start_time ASC`;
        const [rows] = await db.query(sql, [userId, date, time]);
        return rows.map(task => this.formatTaskDates(task));  // ✅ 批量格式化
    },

    async listShortTasksByDate(userId, date) {
        const sql = `SELECT ${baseSelect} FROM tasks
                 WHERE user_id = ? 
                   AND type = 'short'
                   AND start_date = ?
                 ORDER BY 
                   CASE 
                     WHEN start_time IS NOT NULL THEN start_time 
                     ELSE '23:59:59' 
                   END ASC`;
        const [rows] = await db.query(sql, [userId, date]);
        return rows.map(task => this.formatTaskDates(task));  // ✅ 批量格式化
    },

    async checkTimeConflict(userId, date, startTime, endTime, excludeId = null) {
        let sql = `SELECT id, title, start_time, due_time FROM tasks
               WHERE user_id = ? 
                 AND type = 'short'
                 AND start_date = ?
                 AND status != 'completed'
                 AND ((start_time < ? AND due_time > ?) 
                   OR (start_time >= ? AND start_time < ?)
                   OR (due_time > ? AND due_time <= ?))`;

        const params = [userId, date, endTime, startTime, startTime, endTime, startTime, endTime];

        if (excludeId) {
            sql += ` AND id != ?`;
            params.push(excludeId);
        }

        const [rows] = await db.query(sql, params);
        return rows.map(task => this.formatTaskDates(task));  // ✅ 批量格式化
    }
};

module.exports = Task;