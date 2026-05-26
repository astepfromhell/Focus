const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const pomodoroRoutes = require('./pomodoro.routes');
const notesRoutes = require('./notes.routes');
const tasksRoutes = require('./tasks.routes');
const statisticsRoutes = require('./statistics.routes');
const exportRoutes = require('./export.routes');
const aiRoutes = require('./ai.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/pomodoro', pomodoroRoutes);
router.use('/notes', notesRoutes);
router.use('/tasks', tasksRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/export', exportRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
