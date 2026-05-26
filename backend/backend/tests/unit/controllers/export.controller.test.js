const exportController = require('../../../src/controllers/export.controller');
const exportService = require('../../../src/services/export.service');
const response = require('../../../src/utils/response.util');

// Mock dependencies
jest.mock('../../../src/services/export.service');
jest.mock('../../../src/utils/response.util');

describe('Export Controller', () => {
    let req, res, next;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock Date to return consistent timestamp
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

        // Setup mock request
        req = {
            query: {},
            userId: 'user-123'
        };

        // Setup mock response
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn().mockReturnThis(),
            send: jest.fn(),
            on: jest.fn(),
            write: jest.fn(),
            end: jest.fn()
        };

        // Setup mock next function
        next = jest.fn();

        // Mock response.util methods
        response.success = jest.fn().mockReturnValue({
            status: 200,
            data: {},
            message: 'Success'
        });

        // Mock export service methods
        exportService.getPomodoroSessions = jest.fn();
        exportService.getTasks = jest.fn();
        exportService.getNotes = jest.fn();
        exportService.buildCsvAttachment = jest.fn();
        exportService.buildJsonAttachment = jest.fn();
        exportService.streamZip = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('exportPomodoro', () => {
        it('should export pomodoro sessions as JSON without download', async () => {
            const mockSessions = [
                { id: 1, duration: 25, task: 'Task 1' },
                { id: 2, duration: 25, task: 'Task 2' }
            ];

            exportService.getPomodoroSessions.mockResolvedValue(mockSessions);

            await exportController.exportPomodoro(req, res, next);

            expect(exportService.getPomodoroSessions).toHaveBeenCalledWith(
                'user-123',
                req.query
            );
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: mockSessions },
                '番茄钟数据导出'
            );
            expect(exportService.buildCsvAttachment).not.toHaveBeenCalled();
            expect(exportService.buildJsonAttachment).not.toHaveBeenCalled();
        });

        it('should export pomodoro sessions as CSV', async () => {
            req.query = { format: 'csv' };
            const mockSessions = [
                { id: 1, duration: 25, task: 'Task 1' }
            ];

            exportService.getPomodoroSessions.mockResolvedValue(mockSessions);
            exportService.buildCsvAttachment.mockReturnValue();

            await exportController.exportPomodoro(req, res, next);

            expect(exportService.getPomodoroSessions).toHaveBeenCalledWith(
                'user-123',
                { format: 'csv' }
            );
            expect(exportService.buildCsvAttachment).toHaveBeenCalledWith(
                res,
                'pomodoro-sessions-2024-01-01T00-00-00-000Z',
                mockSessions
            );
            expect(response.success).not.toHaveBeenCalled();
        });

        it('should export pomodoro sessions as JSON with download', async () => {
            req.query = { format: 'json', download: 'true' };
            const mockSessions = [
                { id: 1, duration: 25, task: 'Task 1' }
            ];

            exportService.getPomodoroSessions.mockResolvedValue(mockSessions);
            exportService.buildJsonAttachment.mockReturnValue();

            await exportController.exportPomodoro(req, res, next);

            expect(exportService.getPomodoroSessions).toHaveBeenCalledWith(
                'user-123',
                { format: 'json', download: 'true' }
            );
            expect(exportService.buildJsonAttachment).toHaveBeenCalledWith(
                res,
                'pomodoro-sessions-2024-01-01T00-00-00-000Z',
                { items: mockSessions }
            );
            expect(response.success).not.toHaveBeenCalled();
        });

        it('should call next with error when export fails', async () => {
            const error = new Error('Export failed');
            exportService.getPomodoroSessions.mockRejectedValue(error);

            await exportController.exportPomodoro(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('exportTasks', () => {
        it('should export tasks as JSON without download', async () => {
            const mockTasks = [
                { id: 1, title: 'Task 1', completed: false },
                { id: 2, title: 'Task 2', completed: true }
            ];

            exportService.getTasks.mockResolvedValue(mockTasks);

            await exportController.exportTasks(req, res, next);

            expect(exportService.getTasks).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: mockTasks },
                '任务数据导出'
            );
            expect(exportService.buildCsvAttachment).not.toHaveBeenCalled();
            expect(exportService.buildJsonAttachment).not.toHaveBeenCalled();
        });

        it('should export tasks as CSV', async () => {
            req.query = { format: 'csv' };
            const mockTasks = [
                { id: 1, title: 'Task 1', completed: false }
            ];

            exportService.getTasks.mockResolvedValue(mockTasks);
            exportService.buildCsvAttachment.mockReturnValue();

            await exportController.exportTasks(req, res, next);

            expect(exportService.buildCsvAttachment).toHaveBeenCalledWith(
                res,
                'tasks-2024-01-01T00-00-00-000Z',
                mockTasks
            );
        });

        it('should export tasks as JSON with download', async () => {
            req.query = { format: 'json', download: 'true' };
            const mockTasks = [
                { id: 1, title: 'Task 1', completed: false }
            ];

            exportService.getTasks.mockResolvedValue(mockTasks);
            exportService.buildJsonAttachment.mockReturnValue();

            await exportController.exportTasks(req, res, next);

            expect(exportService.buildJsonAttachment).toHaveBeenCalledWith(
                res,
                'tasks-2024-01-01T00-00-00-000Z',
                { items: mockTasks }
            );
        });

        it('should call next with error when export fails', async () => {
            const error = new Error('Export failed');
            exportService.getTasks.mockRejectedValue(error);

            await exportController.exportTasks(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('exportNotes', () => {
        it('should export notes as JSON without download', async () => {
            const mockNotes = [
                { id: 1, content: 'Note 1', tags: ['work'] },
                { id: 2, content: 'Note 2', tags: ['personal'] }
            ];

            exportService.getNotes.mockResolvedValue(mockNotes);

            await exportController.exportNotes(req, res, next);

            expect(exportService.getNotes).toHaveBeenCalledWith('user-123');
            expect(response.success).toHaveBeenCalledWith(
                res,
                { items: mockNotes },
                '便签数据导出'
            );
        });

        it('should export notes as CSV', async () => {
            req.query = { format: 'csv' };
            const mockNotes = [
                { id: 1, content: 'Note 1', tags: ['work'] }
            ];

            exportService.getNotes.mockResolvedValue(mockNotes);
            exportService.buildCsvAttachment.mockReturnValue();

            await exportController.exportNotes(req, res, next);

            expect(exportService.buildCsvAttachment).toHaveBeenCalledWith(
                res,
                'notes-2024-01-01T00-00-00-000Z',
                mockNotes
            );
        });

        it('should export notes as JSON with download', async () => {
            req.query = { format: 'json', download: 'true' };
            const mockNotes = [
                { id: 1, content: 'Note 1', tags: ['work'] }
            ];

            exportService.getNotes.mockResolvedValue(mockNotes);
            exportService.buildJsonAttachment.mockReturnValue();

            await exportController.exportNotes(req, res, next);

            expect(exportService.buildJsonAttachment).toHaveBeenCalledWith(
                res,
                'notes-2024-01-01T00-00-00-000Z',
                { items: mockNotes }
            );
        });

        it('should call next with error when export fails', async () => {
            const error = new Error('Export failed');
            exportService.getNotes.mockRejectedValue(error);

            await exportController.exportNotes(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('exportAll', () => {
        it('should export all data as JSON without download', async () => {
            const mockPomodoro = [{ id: 1, duration: 25 }];
            const mockTasks = [{ id: 1, title: 'Task 1' }];
            const mockNotes = [{ id: 1, content: 'Note 1' }];

            exportService.getPomodoroSessions.mockResolvedValue(mockPomodoro);
            exportService.getTasks.mockResolvedValue(mockTasks);
            exportService.getNotes.mockResolvedValue(mockNotes);

            await exportController.exportAll(req, res, next);

            expect(exportService.getPomodoroSessions).toHaveBeenCalledWith(
                'user-123',
                {}
            );
            expect(exportService.getTasks).toHaveBeenCalledWith('user-123');
            expect(exportService.getNotes).toHaveBeenCalledWith('user-123');

            expect(response.success).toHaveBeenCalledWith(
                res,
                { pomodoro: mockPomodoro, tasks: mockTasks, notes: mockNotes },
                '全量数据导出'
            );
        });

        it('should export all data as ZIP', async () => {
            req.query = { format: 'zip' };
            const mockPomodoro = [{ id: 1, duration: 25 }];
            const mockTasks = [{ id: 1, title: 'Task 1' }];
            const mockNotes = [{ id: 1, content: 'Note 1' }];

            exportService.getPomodoroSessions.mockResolvedValue(mockPomodoro);
            exportService.getTasks.mockResolvedValue(mockTasks);
            exportService.getNotes.mockResolvedValue(mockNotes);

            // Mock streamZip to call callback
            const mockStream = {
                pipe: jest.fn().mockReturnThis(),
                on: jest.fn()
            };
            exportService.streamZip.mockImplementation((res, data) => {
                // Simulate successful stream
                return Promise.resolve();
            });

            await exportController.exportAll(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/zip'
            );
            expect(res.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename="focus-export-2024-01-01T00-00-00-000Z.zip"'
            );
            expect(exportService.streamZip).toHaveBeenCalledWith(res, {
                pomodoro: mockPomodoro,
                tasks: mockTasks,
                notes: mockNotes
            });
        });

        it('should export all data as JSON with download', async () => {
            req.query = { format: 'json', download: 'true' };
            const mockPomodoro = [{ id: 1, duration: 25 }];
            const mockTasks = [{ id: 1, title: 'Task 1' }];
            const mockNotes = [{ id: 1, content: 'Note 1' }];

            exportService.getPomodoroSessions.mockResolvedValue(mockPomodoro);
            exportService.getTasks.mockResolvedValue(mockTasks);
            exportService.getNotes.mockResolvedValue(mockNotes);
            exportService.buildJsonAttachment.mockReturnValue();

            await exportController.exportAll(req, res, next);

            expect(exportService.buildJsonAttachment).toHaveBeenCalledWith(
                res,
                'focus-export-2024-01-01T00-00-00-000Z',
                { pomodoro: mockPomodoro, tasks: mockTasks, notes: mockNotes }
            );
        });

        it('should handle zip stream error', async () => {
            req.query = { format: 'zip' };
            const mockPomodoro = [{ id: 1, duration: 25 }];
            const mockTasks = [{ id: 1, title: 'Task 1' }];
            const mockNotes = [{ id: 1, content: 'Note 1' }];

            exportService.getPomodoroSessions.mockResolvedValue(mockPomodoro);
            exportService.getTasks.mockResolvedValue(mockTasks);
            exportService.getNotes.mockResolvedValue(mockNotes);

            // Mock streamZip to reject with error
            const error = new Error('Stream failed');
            exportService.streamZip.mockRejectedValue(error);

            await exportController.exportAll(req, res, next);

            // Should call next with the error
            expect(next).toHaveBeenCalledWith(error);
        });

        it('should call next with error when any export fails', async () => {
            const error = new Error('Export failed');
            exportService.getPomodoroSessions.mockRejectedValue(error);

            await exportController.exportAll(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('buildFilename', () => {
        it('should generate correct filename format', () => {
            // Test the internal buildFilename function
            // Since it's exported in the controller, we can access it via exportController
            // However, it's not exported, so we need to test it indirectly

            // We'll test it through the export calls
            req.query = { format: 'csv' };
            const mockSessions = [{ id: 1, duration: 25 }];

            exportService.getPomodoroSessions.mockResolvedValue(mockSessions);
            exportService.buildCsvAttachment.mockReturnValue();

            // Spy on the calls to verify the generated filename
            const filenameSpy = jest.spyOn(exportService, 'buildCsvAttachment');

            return exportController.exportPomodoro(req, res, next).then(() => {
                // Check that buildCsvAttachment was called with expected filename format
                expect(filenameSpy).toHaveBeenCalledWith(
                    res,
                    'pomodoro-sessions-2024-01-01T00-00-00-000Z',
                    mockSessions
                );
            });
        });
    });
});