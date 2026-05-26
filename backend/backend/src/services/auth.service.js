const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwtUtil = require('../utils/jwt.util');
const { toUserDto } = require('../utils/user.util');
const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const UserToken = require('../models/UserToken');

const SALT_ROUNDS = 10;
const TOKEN_TYPES = {
  REFRESH: 'refresh',
  VERIFY_EMAIL: 'verify_email',
  PASSWORD_RESET: 'password_reset',
};

const issueTokens = async (user) => {
  const payload = { id: user.id, email: user.email };
  const accessToken = jwtUtil.generateAccessToken(payload);
  const refreshToken = jwtUtil.generateRefreshToken({ id: user.id });
  const decoded = jwtUtil.decode(refreshToken);
  const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;
  await UserToken.create({ userId: user.id, token: refreshToken, type: TOKEN_TYPES.REFRESH, expiresAt });
  return { accessToken, refreshToken };
};

const createOneTimeToken = async (userId, type, ttlHours = 24) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  await UserToken.create({ userId, token, type, expiresAt });
  return token;
};

const authService = {
  async registerUser({ username, email, password }) {
    const exists = await User.findByEmail(email);
    if (exists) throw { status: 400, message: 'Email already registered', code: 'EMAIL_EXISTS' };

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await User.create({ username, email, password_hash });
    await UserSettings.createDefault(newUser.id);
    const user = await User.findById(newUser.id);

    const tokens = await issueTokens(user);
    const verifyToken = await createOneTimeToken(user.id, TOKEN_TYPES.VERIFY_EMAIL, 48);

    const payload = {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: toUserDto(user),
    };

    if ((process.env.NODE_ENV || 'development') !== 'production') {
      payload.devVerificationToken = verifyToken;
    }

    return payload;
  },

  async loginUser({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) throw { status: 400, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw { status: 400, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' };

    await User.updateLastLogin(user.id);
    const tokens = await issueTokens(user);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: toUserDto(user),
    };
  },

  async logoutUser(userId, refreshToken) {
    const record = await UserToken.findValid(refreshToken, TOKEN_TYPES.REFRESH);
    if (!record || record.user_id !== userId) {
      throw { status: 400, message: 'Refresh token invalid', code: 'INVALID_REFRESH' };
    }
    await UserToken.consume(record.id);
  },

  async refreshTokens(refreshToken) {
    const decoded = jwtUtil.verifyRefreshToken(refreshToken);
    if (!decoded) throw { status: 401, message: 'Invalid refresh token', code: 'INVALID_REFRESH' };

    const record = await UserToken.findValid(refreshToken, TOKEN_TYPES.REFRESH);
    if (!record) throw { status: 401, message: 'Refresh token expired or revoked', code: 'INVALID_REFRESH' };

    const user = await User.findById(decoded.id);
    if (!user) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };
    if (record.user_id !== user.id) throw { status: 401, message: 'Refresh token invalid', code: 'INVALID_REFRESH' };

    await UserToken.consume(record.id);
    const tokens = await issueTokens(user);
    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: toUserDto(user),
    };
  },

  async forgotPassword(email) {
    const user = await User.findByEmail(email);
    if (!user) return { delivered: true };
    const token = await createOneTimeToken(user.id, TOKEN_TYPES.PASSWORD_RESET, 1); // 1 hour
    return {
      delivered: true,
      devResetToken: (process.env.NODE_ENV || 'development') === 'production' ? undefined : token,
    };
  },

  async resetPassword(token, newPassword) {
    const record = await UserToken.findValid(token, TOKEN_TYPES.PASSWORD_RESET);
    if (!record) throw { status: 400, message: 'Token invalid or expired', code: 'INVALID_TOKEN' };
    const user = await User.findWithPasswordById(record.user_id);
    if (!user) throw { status: 404, message: 'User not found', code: 'NOT_FOUND' };

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.updatePassword(user.id, password_hash);
    await UserToken.consume(record.id);
    await UserToken.revokeByUser(user.id, TOKEN_TYPES.REFRESH);
  },

  async verifyEmail(token) {
    const record = await UserToken.findValid(token, TOKEN_TYPES.VERIFY_EMAIL);
    if (!record) throw { status: 400, message: 'Verification link invalid', code: 'INVALID_TOKEN' };
    await User.setEmailVerified(record.user_id);
    await UserToken.consume(record.id);
    const user = await User.findById(record.user_id);
    return toUserDto(user);
  },
  // ==================== 新增方法：用户名和邮箱可用性校验 ====================

  /**
   * 检查用户名是否已存在
   * @param {string} username - 用户名
   * @returns {Promise<boolean>} - true 表示已存在，false 表示可用
   */
  async checkUsernameExists(username) {
    const user = await User.findByUsername(username);
    return !!user;
  },

  /**
   * 检查邮箱是否已存在
   * @param {string} email - 邮箱地址
   * @returns {Promise<boolean>} - true 表示已存在，false 表示可用
   */
  async checkEmailExists(email) {
      const user = await User.findByEmail(email);
      return !!user;
  },
};

module.exports = authService;
