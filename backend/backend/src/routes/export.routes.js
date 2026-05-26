const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const exportController = require('../controllers/export.controller');
const {
  pomodoroExportSchema,
  simpleExportSchema,
  allExportSchema,
} = require('../validators/export.validator');

router.use(authMiddleware);

router.get('/pomodoro', validate(pomodoroExportSchema, 'query'), exportController.exportPomodoro);
router.get('/tasks', validate(simpleExportSchema, 'query'), exportController.exportTasks);
router.get('/notes', validate(simpleExportSchema, 'query'), exportController.exportNotes);
router.get('/all', validate(allExportSchema, 'query'), exportController.exportAll);

module.exports = router;
