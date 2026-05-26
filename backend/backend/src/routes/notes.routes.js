const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validation.middleware');
const notesController = require('../controllers/notes.controller');
const {
  createNoteSchema,
  updateNoteSchema,
  listNotesSchema,
  updatePositionSchema,
  pinNoteSchema,
  archiveNoteSchema,
  batchUpdateSchema,
} = require('../validators/notes.validator');

router.use(authMiddleware);

router.post('/', validate(createNoteSchema), notesController.createNote);
router.get('/', validate(listNotesSchema, 'query'), notesController.listNotes);
router.post('/batch-update', validate(batchUpdateSchema), notesController.batchUpdatePositions);
router.get('/:id', notesController.getNote);
router.put('/:id', validate(updateNoteSchema), notesController.updateNote);
router.put('/:id/position', validate(updatePositionSchema), notesController.updatePosition);
router.put('/:id/pin', validate(pinNoteSchema), notesController.pinNote);
router.put('/:id/archive', validate(archiveNoteSchema), notesController.archiveNote);
router.delete('/:id', notesController.deleteNote);

module.exports = router;
