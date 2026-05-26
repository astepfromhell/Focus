const PomodoroSession = require('../models/PomodoroSession');
const Tag = require('../models/Tag');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

const sanitizePagination = ({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }) => {
  const p = Math.max(1, Number(page) || DEFAULT_PAGE);
  const l = Math.min(100, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  return { page: p, limit: l };
};

const computeActualDuration = (session, { endTime, actualDuration }) => {
  if (actualDuration !== undefined) return actualDuration;
  if (!endTime) return session.actual_duration;
  const start = new Date(session.start_time);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return session.actual_duration;
  const minutes = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  return minutes;
};

const pomodoroService = {
  async createSession(userId, payload) {
    const startTime = payload.startTime ? new Date(payload.startTime) : new Date();
    const session = await PomodoroSession.create({
      userId,
      startTime,
      plannedDuration: payload.plannedDuration,
      tag: payload.tag || null,
      notes: payload.notes || null,
    });
    if (payload.tag) {
      await Tag.upsertTag({ userId, name: payload.tag, type: 'pomodoro' });
    }
    return session;
  },

  async listSessions(userId, filters = {}) {
    const { page, limit } = sanitizePagination(filters);
    const query = {
      userId,
      page,
      limit,
      status: filters.status,
      tag: filters.tag,
      startDate: filters.startDate,
      endDate: filters.endDate,
    };
    const [items, total] = await Promise.all([
      PomodoroSession.listByFilters(query),
      PomodoroSession.countByFilters(query),
    ]);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getSession(userId, id) {
    const session = await PomodoroSession.findByIdForUser(id, userId);
    if (!session) throw { status: 404, message: 'Session not found', code: 'NOT_FOUND' };
    return session;
  },

  async updateSession(userId, id, payload) {
    const session = await this.getSession(userId, id);
    const updatedPayload = { ...payload };
    if (payload.endTime || payload.actualDuration !== undefined) {
      updatedPayload.actualDuration = computeActualDuration(session, payload);
    }
    if (payload.tag) {
      await Tag.upsertTag({ userId, name: payload.tag, type: 'pomodoro' });
    }
    const updated = await PomodoroSession.updateById(id, userId, updatedPayload);
    if (!updated) throw { status: 404, message: 'Session not found', code: 'NOT_FOUND' };
    return updated;
  },

  async deleteSession(userId, id) {
    const ok = await PomodoroSession.deleteById(id, userId);
    if (!ok) throw { status: 404, message: 'Session not found', code: 'NOT_FOUND' };
  },

  async interruptSession(userId, id) {
    const session = await PomodoroSession.incrementInterruptions(id, userId);
    if (!session) throw { status: 404, message: 'Session not found', code: 'NOT_FOUND' };
    return session;
  },

  async getTags(userId) {
    return Tag.listByType(userId, 'pomodoro');
  },
};

module.exports = pomodoroService;
