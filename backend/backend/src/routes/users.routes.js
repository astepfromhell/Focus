const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const validate = require('../middlewares/validation.middleware');
const upload = require('../utils/upload.util');
const {
	updateProfileSchema,
	changePasswordSchema,
	deleteAccountSchema,
	updateSettingsSchema,
	updateThemeSchema,
	updatePomodoroSchema,
	updateNotificationSchema,
} = require('../validators/user.validator');

router.get('/me', authMiddleware, userController.me);
router.put('/me', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put('/me/password', authMiddleware, validate(changePasswordSchema), userController.changePassword);
router.delete('/me', authMiddleware, validate(deleteAccountSchema), userController.deleteAccount);
router.post('/me/avatar', authMiddleware, upload.single('file'), userController.uploadAvatar);

router.get('/settings', authMiddleware, userController.getSettings);
router.put('/settings', authMiddleware, validate(updateSettingsSchema), userController.updateSettings);
router.put('/settings/theme', authMiddleware, validate(updateThemeSchema), userController.updateThemeSettings);
router.put('/settings/pomodoro', authMiddleware, validate(updatePomodoroSchema), userController.updatePomodoroSettings);
router.put('/settings/notifications', authMiddleware, validate(updateNotificationSchema), userController.updateNotificationSettings);
router.post('/settings/reset', authMiddleware, userController.resetSettings);

module.exports = router;
