const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const {
	registerSchema,
	loginSchema,
	logoutSchema,
	refreshSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authMiddleware, validate(logoutSchema), authController.logout);
router.post('/refresh-token', validate(refreshSchema), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email', authController.verifyEmail);

//新增接口
router.get('/check-username', authController.checkUsername);
router.get('/check-email', authController.checkEmail);

module.exports = router;
