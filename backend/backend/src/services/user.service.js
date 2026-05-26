const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const UserToken = require('../models/UserToken');
const { toUserDto } = require('../utils/user.util');

const SALT_ROUNDS = 10;

const ensureSettings = async (userId) => {
  let settings = await UserSettings.getByUserId(userId);
  if (!settings) settings = await UserSettings.createDefault(userId);
  return settings;
};

const deleteFileIfExists = (filepath) => {
  if (!filepath) return;
  fs.promises
    .unlink(filepath)
    .catch(() => null);
};

const userService = {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
    const settings = await ensureSettings(userId);
    return { user: toUserDto(user), settings };
  },

  async updateProfile(userId, payload) {
    if (payload.email) {
      const existing = await User.findByEmail(payload.email);
      if (existing && existing.id !== userId) {
        throw { status: 400, message: 'Email already in use', code: 'EMAIL_EXISTS' };
      }
    }
    const updated = await User.updateById(userId, payload);
    if (!updated) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
    return toUserDto(updated);
  },

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findWithPasswordById(userId);
    if (!user) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) throw { status: 400, message: 'Old password incorrect', code: 'INVALID_PASSWORD' };
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.updatePassword(userId, password_hash);
    await UserToken.revokeByUser(userId, 'refresh');
  },

  async deleteAccount(userId, password) {
    const user = await User.findWithPasswordById(userId);
    if (!user) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw { status: 400, message: 'Password incorrect', code: 'INVALID_PASSWORD' };
    if (user.avatar_url && user.avatar_url.startsWith('/uploads/')) {
      const oldPath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads', path.basename(user.avatar_url));
      deleteFileIfExists(oldPath);
    }
    await User.deleteById(userId);
  },

  async uploadAvatar(userId, file) {
    if (!file) throw { status: 400, message: 'File is required', code: 'NO_FILE' };
    const filename = path.basename(file.path);
    const avatarUrl = `/uploads/${filename}`;
    const current = await User.findById(userId);
    if (!current) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
    if (current && current.avatar_url && current.avatar_url.startsWith('/uploads/')) {
      const oldPath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads', path.basename(current.avatar_url));
      if (oldPath !== file.path) deleteFileIfExists(oldPath);
    }
    const updated = await User.updateById(userId, { avatar_url: avatarUrl });
    return toUserDto(updated);
  },

  async getSettings(userId) {
    return ensureSettings(userId);
  },

  async updateSettings(userId, payload) {
    await ensureSettings(userId);
    return UserSettings.updateByUserId(userId, payload);
  },

  async resetSettings(userId) {
    await ensureSettings(userId);
    return UserSettings.resetToDefault(userId);
  },
};

module.exports = userService;
