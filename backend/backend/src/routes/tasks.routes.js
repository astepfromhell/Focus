const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const tasksController = require('../controllers/tasks.controller');
const {
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
  reorderTaskSchema,
  calendarSchema,
  createSubtaskSchema,
} = require('../validators/tasks.validator');

router.use(authMiddleware);

router.post('/', validate(createTaskSchema), tasksController.createTask);
router.get('/', validate(listTasksSchema, 'query'), tasksController.listTasks);
router.get('/today', tasksController.listToday);
router.get('/calendar', validate(calendarSchema, 'query'), tasksController.calendarView);
router.post('/:id/subtasks', validate(createSubtaskSchema), tasksController.createSubtask);
router.get('/:id', tasksController.getTask);
router.put('/:id', validate(updateTaskSchema), tasksController.updateTask);
router.put('/:id/complete', tasksController.completeTask);
router.put('/:id/reorder', validate(reorderTaskSchema), tasksController.reorderTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
