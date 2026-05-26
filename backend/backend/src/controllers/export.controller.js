const response = require('../utils/response.util');
const exportService = require('../services/export.service');

const buildFilename = (prefix) => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${prefix}-${stamp}`;
};

exports.exportPomodoro = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const sessions = await exportService.getPomodoroSessions(req.userId, req.query);
    if (format === 'csv') {
      return exportService.buildCsvAttachment(res, buildFilename('pomodoro-sessions'), sessions);
    }
    if (format === 'json' && req.query.download === 'true') {
      return exportService.buildJsonAttachment(res, buildFilename('pomodoro-sessions'), { items: sessions });
    }
    return response.success(res, { items: sessions }, '番茄钟数据导出');
  } catch (err) {
    next(err);
  }
};

exports.exportTasks = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const tasks = await exportService.getTasks(req.userId);
    if (format === 'csv') {
      return exportService.buildCsvAttachment(res, buildFilename('tasks'), tasks);
    }
    if (format === 'json' && req.query.download === 'true') {
      return exportService.buildJsonAttachment(res, buildFilename('tasks'), { items: tasks });
    }
    return response.success(res, { items: tasks }, '任务数据导出');
  } catch (err) {
    next(err);
  }
};

exports.exportNotes = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const notes = await exportService.getNotes(req.userId);
    if (format === 'csv') {
      return exportService.buildCsvAttachment(res, buildFilename('notes'), notes);
    }
    if (format === 'json' && req.query.download === 'true') {
      return exportService.buildJsonAttachment(res, buildFilename('notes'), { items: notes });
    }
    return response.success(res, { items: notes }, '便签数据导出');
  } catch (err) {
    next(err);
  }
};

exports.exportAll = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const [pomodoro, tasks, notes] = await Promise.all([
      exportService.getPomodoroSessions(req.userId, {}),
      exportService.getTasks(req.userId),
      exportService.getNotes(req.userId),
    ]);

    if (format === 'zip') {
      res.status(200);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${buildFilename('focus-export')}.zip"`);
      return exportService
        .streamZip(res, {
          pomodoro,
          tasks,
          notes,
        })
        .catch((err) => next(err));
    }

    if (format === 'json' && req.query.download === 'true') {
      return exportService.buildJsonAttachment(res, buildFilename('focus-export'), {
        pomodoro,
        tasks,
        notes,
      });
    }

    return response.success(res, { pomodoro, tasks, notes }, '全量数据导出');
  } catch (err) {
    next(err);
  }
};
