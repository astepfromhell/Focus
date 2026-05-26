const notesController = require('../../../src/controllers/notes.controller');
const notesService = require('../../../src/services/notes.service');
const response = require('../../../src/utils/response.util');

// Mock dependencies
jest.mock('../../../src/services/notes.service');
jest.mock('../../../src/utils/response.util');

describe('Notes Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request
        req = {
            body: {},
            query: {},
            params: {},
            userId: 'user-123'
        };

        // Setup mock response
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn().mockReturnThis(),
            send: jest.fn()
        };

        // Setup mock next function
        next = jest.fn();

        // Mock response.util methods
        response.success = jest.fn().mockReturnValue({
            status: 200,
            data: {},
            message: 'Success'
        });
    });

    describe('createNote', () => {
        it('should create a new note successfully', async () => {
            const mockNote = {
                id: 'note-123',
                content: 'Test note content',
                userId: 'user-123'
            };

            req.body = { content: 'Test note content' };
            notesService.createNote.mockResolvedValue(mockNote);

            await notesController.createNote(req, res, next);

            expect(notesService.createNote).toHaveBeenCalledWith(
                'user-123',
                { content: 'Test note content' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockNote },
                '便签已创建'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when note creation fails', async () => {
            req.body = { content: 'Test note content' };
            const error = new Error('Creation failed');
            notesService.createNote.mockRejectedValue(error);

            await notesController.createNote(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('listNotes', () => {
        it('should list notes successfully', async () => {
            const mockNotes = [
                { id: 'note-1', content: 'Note 1', pinned: true },
                { id: 'note-2', content: 'Note 2', pinned: false }
            ];

            req.query = { archived: 'false' };
            notesService.listNotes.mockResolvedValue(mockNotes);

            await notesController.listNotes(req, res, next);

            expect(notesService.listNotes).toHaveBeenCalledWith(
                'user-123',
                { archived: 'false' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: mockNotes },
                '便签列表'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should handle empty query parameters', async () => {
            const mockNotes = [{ id: 'note-1', content: 'Note 1' }];
            notesService.listNotes.mockResolvedValue(mockNotes);

            await notesController.listNotes(req, res, next);

            expect(notesService.listNotes).toHaveBeenCalledWith(
                'user-123',
                {}
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: mockNotes },
                '便签列表'
            );
        });

        it('should call next with error when listing fails', async () => {
            const error = new Error('Listing failed');
            notesService.listNotes.mockRejectedValue(error);

            await notesController.listNotes(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('getNote', () => {
        it('should get a specific note successfully', async () => {
            const mockNote = {
                id: 'note-123',
                content: 'Test note content',
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            notesService.getNote.mockResolvedValue(mockNote);

            await notesController.getNote(req, res, next);

            expect(notesService.getNote).toHaveBeenCalledWith(
                'user-123',
                'note-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockNote },
                '便签详情'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when note not found', async () => {
            req.params = { id: 'non-existent' };
            const error = { status: 404, message: 'Note not found' };
            notesService.getNote.mockRejectedValue(error);

            await notesController.getNote(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updateNote', () => {
        it('should update a note successfully', async () => {
            const mockUpdatedNote = {
                id: 'note-123',
                content: 'Updated content',
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            req.body = { content: 'Updated content' };
            notesService.updateNote.mockResolvedValue(mockUpdatedNote);

            await notesController.updateNote(req, res, next);

            expect(notesService.updateNote).toHaveBeenCalledWith(
                'user-123',
                'note-123',
                { content: 'Updated content' }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockUpdatedNote },
                '便签已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when update fails', async () => {
            req.params = { id: 'note-123' };
            req.body = { content: 'Updated content' };
            const error = new Error('Update failed');
            notesService.updateNote.mockRejectedValue(error);

            await notesController.updateNote(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('updatePosition', () => {
        it('should update note position successfully', async () => {
            const mockUpdatedNote = {
                id: 'note-123',
                position: { x: 100, y: 200 },
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            req.body = { x: 100, y: 200 };
            notesService.updatePosition.mockResolvedValue(mockUpdatedNote);

            await notesController.updatePosition(req, res, next);

            expect(notesService.updatePosition).toHaveBeenCalledWith(
                'user-123',
                'note-123',
                { x: 100, y: 200 }
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockUpdatedNote },
                '位置已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when position update fails', async () => {
            req.params = { id: 'note-123' };
            req.body = { x: 100, y: 200 };
            const error = new Error('Position update failed');
            notesService.updatePosition.mockRejectedValue(error);

            await notesController.updatePosition(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('pinNote', () => {
        it('should pin a note successfully', async () => {
            const mockPinnedNote = {
                id: 'note-123',
                isPinned: true,
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            req.body = { isPinned: true };
            notesService.pinNote.mockResolvedValue(mockPinnedNote);

            await notesController.pinNote(req, res, next);

            expect(notesService.pinNote).toHaveBeenCalledWith(
                'user-123',
                'note-123',
                true
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockPinnedNote },
                '置顶状态已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should unpin a note successfully', async () => {
            const mockUnpinnedNote = {
                id: 'note-123',
                isPinned: false,
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            req.body = { isPinned: false };
            notesService.pinNote.mockResolvedValue(mockUnpinnedNote);

            await notesController.pinNote(req, res, next);

            expect(notesService.pinNote).toHaveBeenCalledWith(
                'user-123',
                'note-123',
                false
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockUnpinnedNote },
                '置顶状态已更新'
            );
        });

        it('should call next with error when pin operation fails', async () => {
            req.params = { id: 'note-123' };
            req.body = { isPinned: true };
            const error = new Error('Pin operation failed');
            notesService.pinNote.mockRejectedValue(error);

            await notesController.pinNote(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('archiveNote', () => {
        it('should archive a note successfully', async () => {
            const mockArchivedNote = {
                id: 'note-123',
                isArchived: true,
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            req.body = { isArchived: true };
            notesService.archiveNote.mockResolvedValue(mockArchivedNote);

            await notesController.archiveNote(req, res, next);

            expect(notesService.archiveNote).toHaveBeenCalledWith(
                'user-123',
                'note-123',
                true
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockArchivedNote },
                '归档状态已更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should unarchive a note successfully', async () => {
            const mockUnarchivedNote = {
                id: 'note-123',
                isArchived: false,
                userId: 'user-123'
            };

            req.params = { id: 'note-123' };
            req.body = { isArchived: false };
            notesService.archiveNote.mockResolvedValue(mockUnarchivedNote);

            await notesController.archiveNote(req, res, next);

            expect(notesService.archiveNote).toHaveBeenCalledWith(
                'user-123',
                'note-123',
                false
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { note: mockUnarchivedNote },
                '归档状态已更新'
            );
        });

        it('should call next with error when archive operation fails', async () => {
            req.params = { id: 'note-123' };
            req.body = { isArchived: true };
            const error = new Error('Archive operation failed');
            notesService.archiveNote.mockRejectedValue(error);

            await notesController.archiveNote(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('deleteNote', () => {
        it('should delete a note successfully', async () => {
            req.params = { id: 'note-123' };
            notesService.deleteNote.mockResolvedValue(true);

            await notesController.deleteNote(req, res, next);

            expect(notesService.deleteNote).toHaveBeenCalledWith(
                'user-123',
                'note-123'
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { deleted: true },
                '便签已删除'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when deletion fails', async () => {
            req.params = { id: 'note-123' };
            const error = new Error('Deletion failed');
            notesService.deleteNote.mockRejectedValue(error);

            await notesController.deleteNote(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });

    describe('batchUpdatePositions', () => {
        it('should batch update note positions with array body', async () => {
            const mockItems = [
                { id: 'note-1', x: 100, y: 200 },
                { id: 'note-2', x: 150, y: 250 }
            ];

            const mockResult = { updated: 2 };

            req.body = mockItems;
            notesService.batchUpdatePositions.mockResolvedValue(mockResult);

            await notesController.batchUpdatePositions(req, res, next);

            expect(notesService.batchUpdatePositions).toHaveBeenCalledWith(
                'user-123',
                mockItems
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockResult,
                '位置已批量更新'
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('should batch update note positions with object body containing items', async () => {
            const mockItems = [
                { id: 'note-1', x: 100, y: 200 },
                { id: 'note-2', x: 150, y: 250 }
            ];

            const mockResult = { updated: 2 };

            req.body = { items: mockItems };
            notesService.batchUpdatePositions.mockResolvedValue(mockResult);

            await notesController.batchUpdatePositions(req, res, next);

            expect(notesService.batchUpdatePositions).toHaveBeenCalledWith(
                'user-123',
                mockItems
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockResult,
                '位置已批量更新'
            );
        });

        it('should handle empty batch update request', async () => {
            const mockResult = { updated: 0 };

            req.body = { items: [] };
            notesService.batchUpdatePositions.mockResolvedValue(mockResult);

            await notesController.batchUpdatePositions(req, res, next);

            expect(notesService.batchUpdatePositions).toHaveBeenCalledWith(
                'user-123',
                []
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                mockResult,
                '位置已批量更新'
            );
        });

        it('should call next with error when batch update fails', async () => {
            req.body = [{ id: 'note-1', x: 100, y: 200 }];
            const error = new Error('Batch update failed');
            notesService.batchUpdatePositions.mockRejectedValue(error);

            await notesController.batchUpdatePositions(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(response.success).not.toHaveBeenCalled();
        });
    });
});