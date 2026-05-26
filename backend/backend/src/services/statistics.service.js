const db = require('../models');

const buildPomodoroWhere = (userId, { startDate, endDate } = {}) => {
    const clauses = ['user_id = ?'];
    const params = [userId];
    if (startDate) {
        clauses.push('DATE(start_time) >= ?');
        params.push(startDate);
    }
    if (endDate) {
        clauses.push('DATE(start_time) <= ?');
        params.push(endDate);
    }
    return { where: clauses.join(' AND '), params };
};

/**
 * 构建任务查询条件
 * 使用"时间范围交集"逻辑，查询在指定日期范围内"活跃"的任务。
 *
 * 字段说明：
 *   短任务：start_date 为任务日期，end_date 为 NULL
 *   长任务：start_date / end_date 为任务起止日期
 *
 * 交集逻辑：
 *   任务结束边界：COALESCE(end_date, start_date) >= 查询开始日期
 *   任务开始边界：start_date <= 查询结束日期
 */
const buildTaskWhere = (userId, { startDate, endDate } = {}) => {
    const clauses = ['user_id = ?'];
    const params = [userId];
    if (startDate) {
        // 任务结束边界 >= 查询开始日期（短任务无 end_date，用 start_date 兜底）
        clauses.push('COALESCE(end_date, start_date) >= ?');
        params.push(startDate);
    }
    if (endDate) {
        // 任务开始边界 <= 查询结束日期
        clauses.push('start_date <= ?');
        params.push(endDate);
    }
    return { where: clauses.join(' AND '), params };
};

const computeDateSpan = (minDate, maxDate) => {
    if (!minDate || !maxDate) return 1;
    const start = new Date(minDate);
    const end = new Date(maxDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1;
    const diff = Math.abs(end - start);
    return Math.max(1, Math.floor(diff / 86400000) + 1);
};

const buildDateMap = (rows) => {
    const map = new Map();
    rows.forEach((row) => {
        map.set(row.day, row.completed);
    });
    return map;
};

const computeCurrentStreak = (rows) => {
    const map = buildDateMap(rows);
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 90; i += 1) {
        const cursor = new Date(today);
        cursor.setDate(today.getDate() - i);
        const key = cursor.toISOString().slice(0, 10);
        if (map.has(key) && map.get(key) > 0) {
            streak += 1;
        } else {
            break;
        }
    }
    return streak;
};

const statisticsService = {
    async getPomodoroSummary(userId, filters = {}) {
        const { where, params } = buildPomodoroWhere(userId, filters);
        const summarySql = `SELECT
                                COUNT(*) AS totalSessions,
                                SUM(CASE WHEN status = 'completed' AND start_time IS NOT NULL AND end_time IS NOT NULL THEN 1 ELSE 0 END) AS completedSessions,
                                SUM(COALESCE(actual_duration, planned_duration, 0)) AS totalFocusMinutes
                            FROM pomodoro_sessions
                            WHERE ${where}`;
        const rangeSql = `SELECT MIN(DATE(start_time)) AS minDate, MAX(DATE(start_time)) AS maxDate FROM pomodoro_sessions WHERE ${where}`;
        const tagsSql = `SELECT tag AS tag, COUNT(*) AS count, SUM(COALESCE(actual_duration, planned_duration, 0)) AS minutes
                         FROM pomodoro_sessions
                         WHERE ${where} AND tag IS NOT NULL AND tag <> ''
                         GROUP BY tag
                         ORDER BY count DESC
                             LIMIT 5`;
        const streakSql = `SELECT DATE(start_time) AS day, COUNT(*) AS completed
                           FROM pomodoro_sessions
                           WHERE ${where} AND status = 'completed' AND start_time IS NOT NULL AND end_time IS NOT NULL
                           GROUP BY DATE(start_time)
                           ORDER BY day DESC
                               LIMIT 90`;

        const [[summaryRows], [rangeRows], [tags], [streakRows]] = await Promise.all([
            db.query(summarySql, params),
            db.query(rangeSql, params),
            db.query(tagsSql, params),
            db.query(streakSql, params),
        ]);

        const summary = summaryRows[0] || { totalSessions: 0, completedSessions: 0, totalFocusMinutes: 0 };
        const range = rangeRows[0] || {};
        const daySpan = computeDateSpan(range.minDate, range.maxDate);
        const completionRate = summary.totalSessions
            ? Number(((summary.completedSessions / summary.totalSessions) * 100).toFixed(2))
            : 0;
        const dailyAverage = summary.totalSessions ? Number((summary.totalSessions / daySpan).toFixed(2)) : 0;
        const currentStreak = computeCurrentStreak(streakRows);

        return {
            totalSessions: Number(summary.totalSessions) || 0,
            completedSessions: Number(summary.completedSessions) || 0,
            totalFocusMinutes: Number(summary.totalFocusMinutes) || 0,
            completionRate,
            topTags: tags,
            dailyAverage,
            currentStreak,
        };
    },

    async getPomodoroDaily(userId, { startDate, endDate }) {
        const { where, params } = buildPomodoroWhere(userId, { startDate, endDate });
        const sql = `SELECT DATE(start_time) AS date,
                         COUNT(*) AS totalSessions,
                         SUM(CASE WHEN status = 'completed' AND start_time IS NOT NULL AND end_time IS NOT NULL THEN 1 ELSE 0 END) AS completedSessions,
                         SUM(COALESCE(actual_duration, planned_duration, 0)) AS totalMinutes
                     FROM pomodoro_sessions
                     WHERE ${where}
                     GROUP BY DATE(start_time)
                     ORDER BY DATE(start_time)`;
        const [rows] = await db.query(sql, params);
        return { items: rows };
    },

    async getPomodoroTags(userId, filters = {}) {
        const { where, params } = buildPomodoroWhere(userId, filters);
        const sql = `SELECT tag AS tag,
                            COUNT(*) AS count,
                            SUM(COALESCE(actual_duration, planned_duration, 0)) AS minutes
                     FROM pomodoro_sessions
                     WHERE ${where} AND tag IS NOT NULL AND tag <> ''
                     GROUP BY tag
                     ORDER BY count DESC, minutes DESC`;
        const [rows] = await db.query(sql, params);
        return { items: rows };
    },

    async getPomodoroTrends(userId, { period = 'week' }) {
        const meta = {
            week: { label: "DATE_FORMAT(start_time, '%x-W%v')", group: "DATE_FORMAT(start_time, '%x-W%v')", window: '12 WEEK' },
            month: { label: "DATE_FORMAT(start_time, '%Y-%m')", group: "DATE_FORMAT(start_time, '%Y-%m')", window: '12 MONTH' },
            year: { label: "DATE_FORMAT(start_time, '%Y')", group: "DATE_FORMAT(start_time, '%Y')", window: '5 YEAR' },
        }[period];
        const sql = `SELECT ${meta.label} AS period,
                            COUNT(*) AS totalSessions,
                            SUM(CASE WHEN status = 'completed' AND start_time IS NOT NULL AND end_time IS NOT NULL THEN 1 ELSE 0 END) AS completedSessions,
                            SUM(COALESCE(actual_duration, planned_duration, 0)) AS totalMinutes,
                            MIN(DATE(start_time)) AS firstDate
                     FROM pomodoro_sessions
                     WHERE user_id = ? AND start_time >= DATE_SUB(CURDATE(), INTERVAL ${meta.window})
                     GROUP BY ${meta.group}
                     ORDER BY firstDate`;
        const [items] = await db.query(sql, [userId]);
        return { items };
    },

    async getTaskSummary(userId, filters = {}) {
        console.log('getTaskSummary filters:', JSON.stringify(filters));
        const { where, params } = buildTaskWhere(userId, filters);
        const summarySql = `SELECT
                                COUNT(*) AS totalTasks,
                                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedTasks,
                                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS inProgressTasks,
                                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingTasks,
                                SUM(CASE WHEN status NOT IN ('completed', 'cancelled') AND (
                                    (type = 'short' AND start_date IS NOT NULL AND start_date < CURDATE()) OR
                                    (type = 'long' AND end_date IS NOT NULL AND end_date < CURDATE())
                                    ) THEN 1 ELSE 0 END) AS overdueTasks
                            FROM tasks
                            WHERE ${where}`;
        const prioritySql = `SELECT priority, COUNT(*) AS count FROM tasks WHERE ${where} GROUP BY priority`;
        const statusSql = `SELECT status, COUNT(*) AS count FROM tasks WHERE ${where} GROUP BY status`;

        const [[summaryRows], [priorityRows], [statusRows]] = await Promise.all([
            db.query(summarySql, params),
            db.query(prioritySql, params),
            db.query(statusSql, params),
        ]);

        const summary = summaryRows[0] || { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, pendingTasks: 0, overdueTasks: 0 };
        const completionRate = summary.totalTasks
            ? Number(((summary.completedTasks / summary.totalTasks) * 100).toFixed(2))
            : 0;

        return {
            totalTasks: Number(summary.totalTasks) || 0,
            completedTasks: Number(summary.completedTasks) || 0,
            inProgressTasks: Number(summary.inProgressTasks) || 0,
            pendingTasks: Number(summary.pendingTasks) || 0,
            overdueTasks: Number(summary.overdueTasks) || 0,
            completionRate,
            priorityBreakdown: priorityRows,
            statusBreakdown: statusRows,
        };
    },

    async getTaskCompletion(userId, { period = 'week' }) {
        const meta = {
            week: { label: "DATE_FORMAT(created_at, '%x-W%v')", group: "DATE_FORMAT(created_at, '%x-W%v')", window: '12 WEEK' },
            month: { label: "DATE_FORMAT(created_at, '%Y-%m')", group: "DATE_FORMAT(created_at, '%Y-%m')", window: '12 MONTH' },
        }[period];
        const sql = `SELECT ${meta.label} AS period,
                            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedTasks,
                            COUNT(*) AS totalTasks,
                            MIN(DATE(created_at)) AS firstDate
                     FROM tasks
                     WHERE user_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ${meta.window})
                     GROUP BY ${meta.group}
                     ORDER BY firstDate`;
        const [items] = await db.query(sql, [userId]);
        const normalized = items.map((item) => ({
            period: item.period,
            completedTasks: Number(item.completedTasks) || 0,
            totalTasks: Number(item.totalTasks) || 0,
            completionRate: item.totalTasks
                ? Number(((item.completedTasks / item.totalTasks) * 100).toFixed(2))
                : 0,
        }));
        return { items: normalized };
    },
};

module.exports = statisticsService;