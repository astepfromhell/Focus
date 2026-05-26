const Note = require('../models/Note');
const Tag = require('../models/Tag');

const normalizeTags = (input) => {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) {
    return input
      .map((tag) => `${tag}`.trim())
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const prepareTags = (input) => {
  const tags = normalizeTags(input);
  return {
    tags,
    tagsValue: tags.length ? tags.join(',') : null,
  };
};

const registerTags = async (userId, tags = []) => {
  if (!tags.length) return;
  await Promise.all(tags.map((name) => Tag.upsertTag({ userId, name, type: 'note' })));
};

const notesService = {
  async createNote(userId, payload) {
    const { tags, tagsValue } = prepareTags(payload.tags);
    const note = await Note.create({
      userId,
      content: payload.content,
      positionX: payload.positionX ?? 0,
      positionY: payload.positionY ?? 0,
      width: payload.width ?? 200,
      height: payload.height ?? 200,
      zIndex: payload.zIndex ?? 0,
      color: payload.color ?? '#FFEB3B',
      isPinned: payload.isPinned ?? false,
      isArchived: payload.isArchived ?? false,
      tags: tagsValue,
    });
    await registerTags(userId, tags);
    return note;
  },

  async listNotes(userId, filters = {}) {
    const isArchived = filters.isArchived ?? false;
    return Note.listByUser(userId, { isArchived });
  },

  async getNote(userId, id) {
    const note = await Note.findByIdForUser(id, userId);
    if (!note) throw { status: 404, message: 'Note not found', code: 'NOT_FOUND' };
    return note;
  },

  async updateNote(userId, id, payload) {
    const updates = { ...payload };
    let tagsToRegister = [];
    if (payload.tags !== undefined) {
      const { tags, tagsValue } = prepareTags(payload.tags);
      updates.tags = tagsValue;
      tagsToRegister = tags;
    }
    const note = await Note.updateById(id, userId, updates);
    if (!note) throw { status: 404, message: 'Note not found', code: 'NOT_FOUND' };
    await registerTags(userId, tagsToRegister);
    return note;
  },

  async updatePosition(userId, id, payload) {
    const note = await Note.updatePosition(id, userId, payload);
    if (!note) throw { status: 404, message: 'Note not found', code: 'NOT_FOUND' };
    return note;
  },

  async pinNote(userId, id, isPinned) {
    const note = await Note.setPinned(id, userId, isPinned);
    if (!note) throw { status: 404, message: 'Note not found', code: 'NOT_FOUND' };
    return note;
  },

  async archiveNote(userId, id, isArchived) {
    const note = await Note.setArchived(id, userId, isArchived);
    if (!note) throw { status: 404, message: 'Note not found', code: 'NOT_FOUND' };
    return note;
  },

  async deleteNote(userId, id) {
    const ok = await Note.deleteById(id, userId);
    if (!ok) throw { status: 404, message: 'Note not found', code: 'NOT_FOUND' };
  },

  async batchUpdatePositions(userId, updates = []) {
    if (!updates.length) return { updated: 0 };
    const updated = await Note.bulkUpdatePositions(userId, updates);
    return { updated };
  },
};

module.exports = notesService;
