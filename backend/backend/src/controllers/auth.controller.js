const authService = require('../services/auth.service');
const response = require('../utils/response.util');
const { verifyEmailSchema } = require('../validators/auth.validator');

exports.register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    return response.success(res, data, '注册成功');
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.loginUser(req.body);
    return response.success(res, data, '登录成功');
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.userId, req.body.refreshToken);
    return response.success(res, { loggedOut: true }, '退出成功');
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const data = await authService.refreshTokens(req.body.refreshToken);
    return response.success(res, data, '刷新成功');
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    return response.success(res, result, '如果邮箱存在，我们已发送重置链接');
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    return response.success(res, { reset: true }, '密码已更新');
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { error, value } = verifyEmailSchema.validate(req.query);
    if (error) return response.error(res, error.message, 'VALIDATION_ERROR', 400);
    const user = await authService.verifyEmail(value.token);
    return response.success(res, { user }, '邮箱验证成功');
  } catch (err) {
    next(err);
  }
};


// ==================== 新增接口：用户名和邮箱可用性校验 ====================

/**
 * 检查用户名是否可用
 * GET /api/auth/check-username?username=xxx
 */
exports.checkUsername = async (req, res, next) => {
  try {
      const { username } = req.query;

      // 参数验证
      if (!username || username.trim().length < 4) {
          return response.error(res, '用户名至少需要4个字符', 'VALIDATION_ERROR', 400);
      }

      if (username.trim().length > 20) {
          return response.error(res, '用户名不能超过20个字符', 'VALIDATION_ERROR', 400);
      }

      // 调用服务层检查
      const exists = await authService.checkUsernameExists(username.trim());

      return response.success(res, {
          available: !exists,
          username: username.trim()
      }, exists ? '该用户名已被占用' : '用户名可用');
  } catch (err) {
      next(err);
  }
};

/**
* 检查邮箱是否可用
* GET /api/auth/check-email?email=xxx
*/
exports.checkEmail = async (req, res, next) => {
  try {
      const { email } = req.query;

      // 参数验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email.trim())) {
          return response.error(res, '请输入有效的邮箱地址', 'VALIDATION_ERROR', 400);
      }

      // 调用服务层检查
      const exists = await authService.checkEmailExists(email.trim().toLowerCase());

      return response.success(res, {
          available: !exists,
          email: email.trim().toLowerCase()
      }, exists ? '该邮箱已被注册' : '邮箱可用');
  } catch (err) {
      next(err);
  }
  
};
