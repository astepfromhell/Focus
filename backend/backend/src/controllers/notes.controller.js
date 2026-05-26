const response = require('../utils/response.util');
const notesService = require('../services/notes.service');

exports.createNote = async (req, res, next) => {
  try {
    const note = await notesService.createNote(req.userId, req.body);
    return response.success(res, { note }, '便签已创建');
  } catch (err) {
    next(err);
  }
};

exports.listNotes = async (req, res, next) => {
  try {
    const notes = await notesService.listNotes(req.userId, req.query);
    return response.success(res, { items: notes[0] }, '便签列表');
  } catch (err) {
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  try {
    const note = await notesService.getNote(req.userId, req.params.id);
    return response.success(res, { note }, '便签详情');
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await notesService.updateNote(req.userId, req.params.id, req.body);
    return response.success(res, { note }, '便签已更新');
  } catch (err) {
    next(err);
  }
};

exports.updatePosition = async (req, res, next) => {
  try {
    const note = await notesService.updatePosition(req.userId, req.params.id, req.body);
    return response.success(res, { note }, '位置已更新');
  } catch (err) {
    next(err);
  }
};

exports.pinNote = async (req, res, next) => {
  try {
    const note = await notesService.pinNote(req.userId, req.params.id, req.body.isPinned);
    return response.success(res, { note }, '置顶状态已更新');
  } catch (err) {
    next(err);
  }
};

exports.archiveNote = async (req, res, next) => {
  try {
    const note = await notesService.archiveNote(req.userId, req.params.id, req.body.isArchived);
    return response.success(res, { note }, '归档状态已更新');
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    await notesService.deleteNote(req.userId, req.params.id);
    return response.success(res, { deleted: true }, '便签已删除');
  } catch (err) {
    next(err);
  }
};

exports.batchUpdatePositions = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.items;
    const result = await notesService.batchUpdatePositions(req.userId, items);
    return response.success(res, result, '位置已批量更新');
  } catch (err) {
    next(err);
  }
};
