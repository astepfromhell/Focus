const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const statisticsController = require('../controllers/statistics.controller');
const {
  pomodoroSummarySchema,
  pomodoroDailySchema,
  pomodoroTagsSchema,
  pomodoroTrendsSchema,
  taskSummarySchema,
  taskCompletionSchema,
} = require('../validators/statistics.validator');

router.use(authMiddleware);

router.get('/pomodoro/summary', validate(pomodoroSummarySchema, 'query'), statisticsController.getPomodoroSummary);
router.get('/pomodoro/daily', validate(pomodoroDailySchema, 'query'), statisticsController.getPomodoroDaily);
router.get('/pomodoro/tags', validate(pomodoroTagsSchema, 'query'), statisticsController.getPomodoroTags);
router.get('/pomodoro/trends', validate(pomodoroTrendsSchema, 'query'), statisticsController.getPomodoroTrends);
router.get('/tasks/summary', validate(taskSummarySchema, 'query'), statisticsController.getTaskSummary);
router.get('/tasks/completion', validate(taskCompletionSchema, 'query'), statisticsController.getTaskCompletion);

module.exports = router;
