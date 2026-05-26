const notesService = require('../../../src/services/notes.service');
const Note = require('../../../src/models/Note');
const Tag = require('../../../src/models/Tag');

jest.mock('../../../src/models/Note');
jest.mock('../../../src/models/Tag');

describe('Notes Service', () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createNote', () => {
        const mockPayload = {
            content: 'Test note content',
            positionX: 100,
            positionY: 200,
            width: 300,
            height: 400,
            zIndex: 5,
            color: '#FF5733',
            isPinned: true,
            isArchived: false,
            tags: ['work', 'important'],
        };

        const mockNote = {
            id: 1,
            user_id: userId,
            content: 'Test note content',
            position_x: 100,
            position_y: 200,
            width: 300,
            height: 400,
            z_index: 5,
            color: '#FF5733',
            is_pinned: true,
            is_archived: false,
            tags: 'work,important',
        };

        test('should create note with all fields', async () => {
            Note.create.mockResolvedValue(mockNote);
            Tag.upsertTag.mockResolvedValue({});

            const result = await notesService.createNote(userId, mockPayload);

            expect(Note.create).toHaveBeenCalledWith({
                userId,
                content: mockPayload.content,
                positionX: mockPayload.positionX,
                positionY: mockPayload.positionY,
                width: mockPayload.width,
                height: mockPayload.height,
                zIndex: mockPayload.zIndex,
                color: mockPayload.color,
                isPinned: mockPayload.isPinned,
                isArchived: mockPayload.isArchived,
                tags: 'work,important',
            });

            expect(Tag.upsertTag).toHaveBeenCalledTimes(2);
            expect(Tag.upsertTag).toHaveBeenCalledWith({
                userId,
                name: 'work',
                type: 'note',
            });
            expect(Tag.upsertTag).toHaveBeenCalledWith({
                userId,
                name: 'important',
                type: 'note',
            });

            expect(result).toEqual(mockNote);
        });

        test('should create note with default values', async () => {
            const minimalPayload = {
                content: 'Test content',
            };

            Note.create.mockResolvedValue(mockNote);

            await notesService.createNote(userId, minimalPayload);

            expect(Note.create).toHaveBeenCalledWith({
                userId,
                content: 'Test content',
                positionX: 0,
                positionY: 0,
                width: 200,
                height: 200,
                zIndex: 0,
                color: '#FFEB3B',
                isPinned: false,
                isArchived: false,
                tags: null,
            });
        });

        test('should handle tags as string', async () => {
            const payloadWithStringTags = {
                content: 'Test',
                tags: 'work,personal,urgent',
            };

            Note.create.mockResolvedValue(mockNote);
            Tag.upsertTag.mockResolvedValue({});

            await notesService.createNote(userId, payloadWithStringTags);

            expect(Note.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: 'work,personal,urgent',
                })
            );

            expect(Tag.upsertTag).toHaveBeenCalledTimes(3);
        });

        test('should handle empty tags', async () => {
            const payloadWithoutTags = {
                content: 'Test',
                tags: [],
            };

            Note.create.mockResolvedValue(mockNote);

            await notesService.createNote(userId, payloadWithoutTags);

            expect(Note.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: null,
                })
            );

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });

        test('should filter out empty tag strings', async () => {
            const payloadWithEmptyTags = {
                content: 'Test',
                tags: ['work', '', '  ', 'personal'],
            };

            Note.create.mockResolvedValue(mockNote);
            Tag.upsertTag.mockResolvedValue({});

            await notesService.createNote(userId, payloadWithEmptyTags);

            expect(Note.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tags: 'work,personal',
                })
            );

            expect(Tag.upsertTag).toHaveBeenCalledTimes(2);
        });

        test('should trim tag whitespace', async () => {
            const payloadWithWhitespaceTags = {
                content: 'Test',
                tags: ['  work  ', 'personal'],
            };

            Note.create.mockResolvedValue(mockNote);
            Tag.upsertTag.mockResolvedValue({});

            await notesService.createNote(userId, payloadWithWhitespaceTags);

            expect(Tag.upsertTag).toHaveBeenCalledWith({
                userId,
                name: 'work',
                type: 'note',
            });
        });
    });

    describe('listNotes', () => {
        const mockNotes = [
            { id: 1, content: 'Note 1', is_archived: false },
            { id: 2, content: 'Note 2', is_archived: false },
        ];

        test('should list non-archived notes by default', async () => {
            Note.listByUser.mockResolvedValue(mockNotes);

            const result = await notesService.listNotes(userId);

            expect(Note.listByUser).toHaveBeenCalledWith(userId, { isArchived: false });
            expect(result).toEqual(mockNotes);
        });

        test('should list archived notes when specified', async () => {
            const archivedNotes = [{ id: 3, content: 'Archived', is_archived: true }];
            Note.listByUser.mockResolvedValue(archivedNotes);

            const result = await notesService.listNotes(userId, { isArchived: true });

            expect(Note.listByUser).toHaveBeenCalledWith(userId, { isArchived: true });
            expect(result).toEqual(archivedNotes);
        });

        test('should handle empty notes list', async () => {
            Note.listByUser.mockResolvedValue([]);

            const result = await notesService.listNotes(userId);

            expect(result).toEqual([]);
        });
    });

    describe('getNote', () => {
        const noteId = 1;
        const mockNote = {
            id: noteId,
            user_id: userId,
            content: 'Test note',
        };

        test('should get note successfully', async () => {
            Note.findByIdForUser.mockResolvedValue(mockNote);

            const result = await notesService.getNote(userId, noteId);

            expect(Note.findByIdForUser).toHaveBeenCalledWith(noteId, userId);
            expect(result).toEqual(mockNote);
        });

        test('should throw error if note not found', async () => {
            Note.findByIdForUser.mockResolvedValue(null);

            await expect(notesService.getNote(userId, noteId)).rejects.toEqual({
                status: 404,
                message: 'Note not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('updateNote', () => {
        const noteId = 1;
        const mockUpdatedNote = {
            id: noteId,
            user_id: userId,
            content: 'Updated content',
        };

        test('should update note without tags', async () => {
            const payload = {
                content: 'Updated content',
                color: '#FF0000',
            };

            Note.updateById.mockResolvedValue(mockUpdatedNote);

            const result = await notesService.updateNote(userId, noteId, payload);

            expect(Note.updateById).toHaveBeenCalledWith(noteId, userId, payload);
            expect(Tag.upsertTag).not.toHaveBeenCalled();
            expect(result).toEqual(mockUpdatedNote);
        });

        test('should update note with tags', async () => {
            const payload = {
                content: 'Updated content',
                tags: ['new', 'tags'],
            };

            Note.updateById.mockResolvedValue(mockUpdatedNote);
            Tag.upsertTag.mockResolvedValue({});

            const result = await notesService.updateNote(userId, noteId, payload);

            expect(Note.updateById).toHaveBeenCalledWith(noteId, userId, {
                content: 'Updated content',
                tags: 'new,tags',
            });

            expect(Tag.upsertTag).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockUpdatedNote);
        });

        test('should update note with empty tags array', async () => {
            const payload = {
                content: 'Updated content',
                tags: [],
            };

            Note.updateById.mockResolvedValue(mockUpdatedNote);

            await notesService.updateNote(userId, noteId, payload);

            expect(Note.updateById).toHaveBeenCalledWith(noteId, userId, {
                content: 'Updated content',
                tags: null,
            });

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });

        test('should throw error if note not found', async () => {
            const payload = { content: 'Updated' };
            Note.updateById.mockResolvedValue(null);

            await expect(notesService.updateNote(userId, noteId, payload)).rejects.toEqual({
                status: 404,
                message: 'Note not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('updatePosition', () => {
        const noteId = 1;
        const mockNote = {
            id: noteId,
            position_x: 100,
            position_y: 200,
        };

        test('should update note position', async () => {
            const payload = {
                positionX: 150,
                positionY: 250,
                zIndex: 10,
            };

            Note.updatePosition.mockResolvedValue(mockNote);

            const result = await notesService.updatePosition(userId, noteId, payload);

            expect(Note.updatePosition).toHaveBeenCalledWith(noteId, userId, payload);
            expect(result).toEqual(mockNote);
        });

        test('should throw error if note not found', async () => {
            Note.updatePosition.mockResolvedValue(null);

            await expect(
                notesService.updatePosition(userId, noteId, {})
            ).rejects.toEqual({
                status: 404,
                message: 'Note not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('pinNote', () => {
        const noteId = 1;
        const mockNote = {
            id: noteId,
            is_pinned: true,
        };

        test('should pin note', async () => {
            Note.setPinned.mockResolvedValue(mockNote);

            const result = await notesService.pinNote(userId, noteId, true);

            expect(Note.setPinned).toHaveBeenCalledWith(noteId, userId, true);
            expect(result).toEqual(mockNote);
        });

        test('should unpin note', async () => {
            Note.setPinned.mockResolvedValue({ ...mockNote, is_pinned: false });

            const result = await notesService.pinNote(userId, noteId, false);

            expect(Note.setPinned).toHaveBeenCalledWith(noteId, userId, false);
            expect(result.is_pinned).toBe(false);
        });

        test('should throw error if note not found', async () => {
            Note.setPinned.mockResolvedValue(null);

            await expect(notesService.pinNote(userId, noteId, true)).rejects.toEqual({
                status: 404,
                message: 'Note not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('archiveNote', () => {
        const noteId = 1;
        const mockNote = {
            id: noteId,
            is_archived: true,
        };

        test('should archive note', async () => {
            Note.setArchived.mockResolvedValue(mockNote);

            const result = await notesService.archiveNote(userId, noteId, true);

            expect(Note.setArchived).toHaveBeenCalledWith(noteId, userId, true);
            expect(result).toEqual(mockNote);
        });

        test('should unarchive note', async () => {
            Note.setArchived.mockResolvedValue({ ...mockNote, is_archived: false });

            const result = await notesService.archiveNote(userId, noteId, false);

            expect(Note.setArchived).toHaveBeenCalledWith(noteId, userId, false);
            expect(result.is_archived).toBe(false);
        });

        test('should throw error if note not found', async () => {
            Note.setArchived.mockResolvedValue(null);

            await expect(notesService.archiveNote(userId, noteId, true)).rejects.toEqual({
                status: 404,
                message: 'Note not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('deleteNote', () => {
        const noteId = 1;

        test('should delete note successfully', async () => {
            Note.deleteById.mockResolvedValue(true);

            await notesService.deleteNote(userId, noteId);

            expect(Note.deleteById).toHaveBeenCalledWith(noteId, userId);
        });

        test('should throw error if note not found', async () => {
            Note.deleteById.mockResolvedValue(false);

            await expect(notesService.deleteNote(userId, noteId)).rejects.toEqual({
                status: 404,
                message: 'Note not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('batchUpdatePositions', () => {
        test('should batch update positions', async () => {
            const updates = [
                { id: 1, positionX: 10, positionY: 20 },
                { id: 2, positionX: 30, positionY: 40 },
                { id: 3, positionX: 50, positionY: 60 },
            ];

            Note.bulkUpdatePositions.mockResolvedValue(3);

            const result = await notesService.batchUpdatePositions(userId, updates);

            expect(Note.bulkUpdatePositions).toHaveBeenCalledWith(userId, updates);
            expect(result).toEqual({ updated: 3 });
        });

        test('should handle empty updates array', async () => {
            const result = await notesService.batchUpdatePositions(userId, []);

            expect(Note.bulkUpdatePositions).not.toHaveBeenCalled();
            expect(result).toEqual({ updated: 0 });
        });

        test('should handle partial updates', async () => {
            const updates = [
                { id: 1, positionX: 10, positionY: 20 },
                { id: 999, positionX: 30, positionY: 40 },
            ];

            Note.bulkUpdatePositions.mockResolvedValue(1);

            const result = await notesService.batchUpdatePositions(userId, updates);

            expect(result).toEqual({ updated: 1 });
        });
    });

    describe('Edge cases and tag normalization', () => {
        test('should handle tags as string with commas', async () => {
            const payload = {
                content: 'Test',
                tags: 'tag1, tag2, tag3',
            };

            Note.create.mockResolvedValue({});
            Tag.upsertTag.mockResolvedValue({});

            await notesService.createNote(userId, payload);

            expect(Tag.upsertTag).toHaveBeenCalledTimes(3);
            expect(Tag.upsertTag).toHaveBeenCalledWith({
                userId,
                name: 'tag1',
                type: 'note',
            });
        });

        test('should handle null tags', async () => {
            const payload = {
                content: 'Test',
                tags: null,
            };

            Note.create.mockResolvedValue({});

            await notesService.createNote(userId, payload);

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });

        test('should handle undefined tags', async () => {
            const payload = {
                content: 'Test',
            };

            Note.create.mockResolvedValue({});

            await notesService.createNote(userId, payload);

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });
    });
});
