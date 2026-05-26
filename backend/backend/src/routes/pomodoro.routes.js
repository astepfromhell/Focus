const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const pomodoroController = require('../controllers/pomodoro.controller');
const {
  createSessionSchema,
  listSessionSchema,
  updateSessionSchema,
} = require('../validators/pomodoro.validator');

router.use(authMiddleware);

router.post('/sessions', validate(createSessionSchema), pomodoroController.createSession);
router.get('/sessions', validate(listSessionSchema, 'query'), pomodoroController.listSessions);
router.get('/sessions/:id', pomodoroController.getSession);
router.put('/sessions/:id', validate(updateSessionSchema), pomodoroController.updateSession);
router.delete('/sessions/:id', pomodoroController.deleteSession);
router.post('/sessions/:id/interrupt', pomodoroController.interruptSession);
router.get('/tags', pomodoroController.getTags);

module.exports = router;
