const Note = require('../../../src/models/Note');
const db = require('../../../src/models/index');

// Mock the db module
jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('Note Model', () => {
    const mockUserId = 1;
    const mockNoteId = 100;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a note with all parameters', async () => {
            const mockInsertResult = { insertId: mockNoteId, affectedRows: 1 };
            const mockNote = {
                id: mockNoteId,
                user_id: mockUserId,
                content: 'Test note',
                position_x: 10,
                position_y: 20,
                width: 300,
                height: 250,
                z_index: 5,
                color: '#FF5733',
                is_pinned: true,
                is_archived: false,
                tags: 'work,important',
                created_at: new Date(),
                updated_at: new Date(),
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockNote]);

            const result = await Note.create({
                userId: mockUserId,
                content: 'Test note',
                positionX: 10,
                positionY: 20,
                width: 300,
                height: 250,
                zIndex: 5,
                color: '#FF5733',
                isPinned: true,
                isArchived: false,
                tags: 'work,important',
            });

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO notes'),
                [mockUserId, 'Test note', 10, 20, 300, 250, 5, '#FF5733', true, false, 'work,important']
            );
            expect(result).toEqual(mockNote);
        });

        it('should create a note with default parameters', async () => {
            const mockInsertResult = { insertId: mockNoteId, affectedRows: 1 };
            const mockNote = {
                id: mockNoteId,
                user_id: mockUserId,
                content: 'Simple note',
                position_x: 0,
                position_y: 0,
                width: 200,
                height: 200,
                z_index: 0,
                color: '#FFEB3B',
                is_pinned: false,
                is_archived: false,
                tags: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockNote]);

            const result = await Note.create({
                userId: mockUserId,
                content: 'Simple note',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO notes'),
                [mockUserId, 'Simple note', 0, 0, 200, 200, 0, '#FFEB3B', false, false, null]
            );
            expect(result).toEqual(mockNote);
        });

        it('should handle creation errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                Note.create({
                    userId: mockUserId,
                    content: 'Test note',
                })
            ).rejects.toThrow('Database error');
        });
    });

    describe('findByIdForUser', () => {
        it('should find a note by id and user id', async () => {
            const mockNote = {
                id: mockNoteId,
                user_id: mockUserId,
                content: 'Test note',
                position_x: 0,
                position_y: 0,
                width: 200,
                height: 200,
                z_index: 0,
                color: '#FFEB3B',
                is_pinned: false,
                is_archived: false,
                tags: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            db.query.mockResolvedValue([mockNote]);

            const result = await Note.findByIdForUser(mockNoteId, mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockNote);
        });

        it('should return null when note is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await Note.findByIdForUser(999, mockUserId);

            expect(result).toBeNull();
        });

        it('should return null when note belongs to different user', async () => {
            db.query.mockResolvedValue([]);

            const result = await Note.findByIdForUser(mockNoteId, 999);

            expect(result).toBeNull();
        });
    });

    describe('listByUser', () => {
        it('should list all non-archived notes for a user', async () => {
            const mockNotes = [
                { id: 1, content: 'Note 1', is_archived: false, is_pinned: true, z_index: 10 },
                { id: 2, content: 'Note 2', is_archived: false, is_pinned: false, z_index: 5 },
            ];

            db.query.mockResolvedValue(mockNotes);

            const result = await Note.listByUser(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUserId, 0]
            );
            expect(result).toEqual(mockNotes);
        });

        it('should list archived notes when isArchived is true', async () => {
            const mockArchivedNotes = [
                { id: 3, content: 'Archived Note', is_archived: true },
            ];

            db.query.mockResolvedValue(mockArchivedNotes);

            const result = await Note.listByUser(mockUserId, { isArchived: true });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUserId, 1]
            );
            expect(result).toEqual(mockArchivedNotes);
        });

        it('should return empty array when user has no notes', async () => {
            db.query.mockResolvedValue([]);

            const result = await Note.listByUser(mockUserId);

            expect(result).toEqual([]);
        });
    });

    describe('updateById', () => {
        it('should update note content', async () => {
            const mockUpdatedNote = {
                id: mockNoteId,
                user_id: mockUserId,
                content: 'Updated content',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedNote]);

            const result = await Note.updateById(mockNoteId, mockUserId, {
                content: 'Updated content',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET content = ?'),
                ['Updated content', mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockUpdatedNote);
        });

        it('should update multiple fields', async () => {
            const mockUpdatedNote = {
                id: mockNoteId,
                user_id: mockUserId,
                content: 'New content',
                color: '#00FF00',
                width: 300,
                height: 300,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedNote]);

            const result = await Note.updateById(mockNoteId, mockUserId, {
                content: 'New content',
                color: '#00FF00',
                width: 300,
                height: 300,
            });

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockUpdatedNote);
        });

        it('should return current note when no fields to update', async () => {
            const mockNote = { id: mockNoteId, content: 'Original' };

            db.query.mockResolvedValue([mockNote]);

            const result = await Note.updateById(mockNoteId, mockUserId, {});

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockNote);
        });

        it('should ignore undefined fields', async () => {
            const mockNote = { id: mockNoteId, content: 'Test' };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockNote]);

            await Note.updateById(mockNoteId, mockUserId, {
                content: 'Test',
                color: undefined,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET content = ?'),
                ['Test', mockNoteId, mockUserId]
            );
        });

        it('should handle tags update', async () => {
            const mockNote = { id: mockNoteId, tags: 'tag1,tag2' };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockNote]);

            const result = await Note.updateById(mockNoteId, mockUserId, {
                tags: 'tag1,tag2',
            });

            expect(result).toEqual(mockNote);
        });
    });

    describe('updatePosition', () => {
        it('should update note position and z-index', async () => {
            const mockUpdatedNote = {
                id: mockNoteId,
                position_x: 100,
                position_y: 150,
                z_index: 10,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedNote]);

            const result = await Note.updatePosition(mockNoteId, mockUserId, {
                positionX: 100,
                positionY: 150,
                zIndex: 10,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET position_x = ?, position_y = ?, z_index = ?'),
                [100, 150, 10, mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockUpdatedNote);
        });

        it('should return null when note is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Note.updatePosition(mockNoteId, mockUserId, {
                positionX: 100,
                positionY: 150,
                zIndex: 10,
            });

            expect(result).toBeNull();
        });
    });

    describe('setPinned', () => {
        it('should pin a note', async () => {
            const mockPinnedNote = {
                id: mockNoteId,
                is_pinned: true,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockPinnedNote]);

            const result = await Note.setPinned(mockNoteId, mockUserId, true);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET is_pinned = ?'),
                [1, mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockPinnedNote);
        });

        it('should unpin a note', async () => {
            const mockUnpinnedNote = {
                id: mockNoteId,
                is_pinned: false,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUnpinnedNote]);

            const result = await Note.setPinned(mockNoteId, mockUserId, false);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET is_pinned = ?'),
                [0, mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockUnpinnedNote);
        });

        it('should return null when note is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Note.setPinned(mockNoteId, mockUserId, true);

            expect(result).toBeNull();
        });
    });

    describe('setArchived', () => {
        it('should archive a note', async () => {
            const mockArchivedNote = {
                id: mockNoteId,
                is_archived: true,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockArchivedNote]);

            const result = await Note.setArchived(mockNoteId, mockUserId, true);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET is_archived = ?'),
                [1, mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockArchivedNote);
        });

        it('should unarchive a note', async () => {
            const mockUnarchivedNote = {
                id: mockNoteId,
                is_archived: false,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUnarchivedNote]);

            const result = await Note.setArchived(mockNoteId, mockUserId, false);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET is_archived = ?'),
                [0, mockNoteId, mockUserId]
            );
            expect(result).toEqual(mockUnarchivedNote);
        });

        it('should return null when note is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Note.setArchived(mockNoteId, mockUserId, true);

            expect(result).toBeNull();
        });
    });

    describe('bulkUpdatePositions', () => {
        it('should update positions for multiple notes', async () => {
            const updates = [
                { id: 1, positionX: 10, positionY: 20, zIndex: 1 },
                { id: 2, positionX: 30, positionY: 40, zIndex: 2 },
                { id: 3, positionX: 50, positionY: 60, zIndex: 3 },
            ];

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 1 });

            const result = await Note.bulkUpdatePositions(mockUserId, updates);

            expect(db.query).toHaveBeenCalledTimes(3);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE notes SET position_x = ?, position_y = ?, z_index = ?'),
                [10, 20, 1, 1, mockUserId]
            );
            expect(db.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('UPDATE notes SET position_x = ?, position_y = ?, z_index = ?'),
                [30, 40, 2, 2, mockUserId]
            );
            expect(db.query).toHaveBeenNthCalledWith(
                3,
                expect.stringContaining('UPDATE notes SET position_x = ?, position_y = ?, z_index = ?'),
                [50, 60, 3, 3, mockUserId]
            );
            expect(result).toBe(3);
        });

        it('should handle partial updates when some notes are not found', async () => {
            const updates = [
                { id: 1, positionX: 10, positionY: 20, zIndex: 1 },
                { id: 999, positionX: 30, positionY: 40, zIndex: 2 },
            ];

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce({ affectedRows: 0 });

            const result = await Note.bulkUpdatePositions(mockUserId, updates);

            expect(result).toBe(1);
        });

        it('should handle empty updates array', async () => {
            const result = await Note.bulkUpdatePositions(mockUserId, []);

            expect(db.query).not.toHaveBeenCalled();
            expect(result).toBe(0);
        });

        it('should handle database errors during bulk update', async () => {
            const updates = [
                { id: 1, positionX: 10, positionY: 20, zIndex: 1 },
            ];

            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                Note.bulkUpdatePositions(mockUserId, updates)
            ).rejects.toThrow('Database error');
        });
    });

    describe('deleteById', () => {
        it('should delete a note', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            const result = await Note.deleteById(mockNoteId, mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM notes WHERE id = ? AND user_id = ?',
                [mockNoteId, mockUserId]
            );
            expect(result).toBe(true);
        });

        it('should return false when note is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Note.deleteById(mockNoteId, mockUserId);

            expect(result).toBe(false);
        });

        it('should return false when deleting note of different user', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await Note.deleteById(mockNoteId, 999);

            expect(result).toBe(false);
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                Note.deleteById(mockNoteId, mockUserId)
            ).rejects.toThrow('Database error');
        });
    });
});