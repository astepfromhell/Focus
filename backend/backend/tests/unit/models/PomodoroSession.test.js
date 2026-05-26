const PomodoroSession = require('../../../src/models/PomodoroSession');
const db = require('../../../src/models/index');

jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('PomodoroSession Model', () => {
    const mockUserId = 1;
    const mockSessionId = 100;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('STATUS_VALUES', () => {
        it('should export valid status values', () => {
            expect(PomodoroSession.STATUS_VALUES).toEqual(['in_progress', 'completed', 'cancelled']);
        });
    });

    describe('create', () => {
        it('should create a pomodoro session with all parameters', async () => {
            const mockInsertResult = { insertId: mockSessionId, affectedRows: 1 };
            const mockSession = {
                id: mockSessionId,
                user_id: mockUserId,
                start_time: '2024-01-01T10:00:00Z',
                planned_duration: 25,
                status: 'in_progress',
                tag: 'work',
                notes: 'Test session',
                interruptions: 0,
                created_at: new Date(),
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockSession]);

            const result = await PomodoroSession.create({
                userId: mockUserId,
                startTime: '2024-01-01T10:00:00Z',
                plannedDuration: 25,
                tag: 'work',
                notes: 'Test session',
            });

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO pomodoro_sessions'),
                [mockUserId, '2024-01-01T10:00:00Z', 25, 'work', 'Test session']
            );
            expect(result).toEqual(mockSession);
        });

        it('should create a session with default null values for tag and notes', async () => {
            const mockInsertResult = { insertId: mockSessionId, affectedRows: 1 };
            const mockSession = {
                id: mockSessionId,
                user_id: mockUserId,
                start_time: '2024-01-01T10:00:00Z',
                planned_duration: 25,
                status: 'in_progress',
                tag: null,
                notes: null,
            };

            db.query
                .mockResolvedValueOnce(mockInsertResult)
                .mockResolvedValueOnce([mockSession]);

            const result = await PomodoroSession.create({
                userId: mockUserId,
                startTime: '2024-01-01T10:00:00Z',
                plannedDuration: 25,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('INSERT INTO pomodoro_sessions'),
                [mockUserId, '2024-01-01T10:00:00Z', 25, null, null]
            );
            expect(result).toEqual(mockSession);
        });

        it('should handle creation errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                PomodoroSession.create({
                    userId: mockUserId,
                    startTime: '2024-01-01T10:00:00Z',
                    plannedDuration: 25,
                })
            ).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should find a session by id', async () => {
            const mockSession = {
                id: mockSessionId,
                user_id: mockUserId,
                start_time: '2024-01-01T10:00:00Z',
                status: 'in_progress',
            };

            db.query.mockResolvedValue([mockSession]);

            const result = await PomodoroSession.findById(mockSessionId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockSessionId]
            );
            expect(result).toEqual(mockSession);
        });

        it('should return null when session is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await PomodoroSession.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findByIdForUser', () => {
        it('should find a session by id and user id', async () => {
            const mockSession = {
                id: mockSessionId,
                user_id: mockUserId,
                start_time: '2024-01-01T10:00:00Z',
                status: 'in_progress',
            };

            db.query.mockResolvedValue([mockSession]);

            const result = await PomodoroSession.findByIdForUser(mockSessionId, mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockSessionId, mockUserId]
            );
            expect(result).toEqual(mockSession);
        });

        it('should return null when session is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await PomodoroSession.findByIdForUser(999, mockUserId);

            expect(result).toBeNull();
        });

        it('should return null when session belongs to different user', async () => {
            db.query.mockResolvedValue([]);

            const result = await PomodoroSession.findByIdForUser(mockSessionId, 999);

            expect(result).toBeNull();
        });
    });

    describe('listByFilters', () => {
        it('should list sessions for a user with default pagination', async () => {
            const mockSessions = [
                { id: 1, user_id: mockUserId, status: 'completed' },
                { id: 2, user_id: mockUserId, status: 'in_progress' },
            ];

            db.query.mockResolvedValue(mockSessions);

            const result = await PomodoroSession.listByFilters({ userId: mockUserId });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUserId, 20, 0]
            );
            expect(result).toEqual(mockSessions);
        });

        it('should filter by status', async () => {
            const mockSessions = [{ id: 1, user_id: mockUserId, status: 'completed' }];

            db.query.mockResolvedValue(mockSessions);

            await PomodoroSession.listByFilters({
                userId: mockUserId,
                status: 'completed',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('status = ?'),
                [mockUserId, 'completed', 20, 0]
            );
        });

        it('should filter by tag', async () => {
            const mockSessions = [{ id: 1, tag: 'work' }];

            db.query.mockResolvedValue(mockSessions);

            await PomodoroSession.listByFilters({
                userId: mockUserId,
                tag: 'work',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('tag = ?'),
                [mockUserId, 'work', 20, 0]
            );
        });

        it('should filter by date range', async () => {
            const mockSessions = [{ id: 1 }];

            db.query.mockResolvedValue(mockSessions);

            await PomodoroSession.listByFilters({
                userId: mockUserId,
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('DATE(start_time) >='),
                [mockUserId, '2024-01-01', '2024-01-31', 20, 0]
            );
        });

        it('should support custom pagination', async () => {
            const mockSessions = [];

            db.query.mockResolvedValue(mockSessions);

            await PomodoroSession.listByFilters({
                userId: mockUserId,
                limit: 50,
                page: 3,
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.anything(),
                [mockUserId, 50, 100]
            );
        });

        it('should ignore invalid status values', async () => {
            const mockSessions = [];

            db.query.mockResolvedValue(mockSessions);

            await PomodoroSession.listByFilters({
                userId: mockUserId,
                status: 'invalid_status',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.not.stringContaining('status = ?'),
                [mockUserId, 20, 0]
            );
        });

        it('should handle multiple filters combined', async () => {
            const mockSessions = [];

            db.query.mockResolvedValue(mockSessions);

            await PomodoroSession.listByFilters({
                userId: mockUserId,
                status: 'completed',
                tag: 'work',
                startDate: '2024-01-01',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('user_id = ?'),
                [mockUserId, 'completed', 'work', '2024-01-01', 20, 0]
            );
        });
    });

    describe('countByFilters', () => {
        it('should count sessions for a user', async () => {
            db.query.mockResolvedValue([{ total: 42 }]);

            const result = await PomodoroSession.countByFilters({ userId: mockUserId });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*)'),
                [mockUserId]
            );
            expect(result).toBe(42);
        });

        it('should count with filters', async () => {
            db.query.mockResolvedValue([{ total: 10 }]);

            const result = await PomodoroSession.countByFilters({
                userId: mockUserId,
                status: 'completed',
                tag: 'work',
            });

            expect(result).toBe(10);
        });

        it('should return 0 when no sessions found', async () => {
            db.query.mockResolvedValue([{ total: 0 }]);

            const result = await PomodoroSession.countByFilters({ userId: mockUserId });

            expect(result).toBe(0);
        });

        it('should handle empty result gracefully', async () => {
            db.query.mockResolvedValue([]);

            const result = await PomodoroSession.countByFilters({ userId: mockUserId });

            expect(result).toBe(0);
        });
    });

    describe('updateById', () => {
        it('should update session fields', async () => {
            const mockUpdatedSession = {
                id: mockSessionId,
                user_id: mockUserId,
                end_time: '2024-01-01T10:25:00Z',
                actual_duration: 25,
                status: 'completed',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedSession]);

            const result = await PomodoroSession.updateById(mockSessionId, mockUserId, {
                endTime: '2024-01-01T10:25:00Z',
                actualDuration: 25,
                status: 'completed',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE pomodoro_sessions SET'),
                ['2024-01-01T10:25:00Z', 25, 'completed', mockSessionId, mockUserId]
            );
            expect(result).toEqual(mockUpdatedSession);
        });

        it('should update only provided fields', async () => {
            const mockSession = { id: mockSessionId, notes: 'Updated notes' };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockSession]);

            const result = await PomodoroSession.updateById(mockSessionId, mockUserId, {
                notes: 'Updated notes',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('notes = ?'),
                ['Updated notes', mockSessionId, mockUserId]
            );
            expect(result).toEqual(mockSession);
        });

        it('should return current session when no fields to update', async () => {
            const mockSession = { id: mockSessionId, status: 'in_progress' };

            db.query.mockResolvedValue([mockSession]);

            const result = await PomodoroSession.updateById(mockSessionId, mockUserId, {});

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockSessionId, mockUserId]
            );
            expect(result).toEqual(mockSession);
        });

        it('should ignore undefined fields', async () => {
            const mockSession = { id: mockSessionId, status: 'completed' };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockSession]);

            await PomodoroSession.updateById(mockSessionId, mockUserId, {
                status: 'completed',
                notes: undefined,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('status = ?'),
                ['completed', mockSessionId, mockUserId]
            );
        });

        it('should update all available fields', async () => {
            const mockSession = { id: mockSessionId };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockSession]);

            await PomodoroSession.updateById(mockSessionId, mockUserId, {
                startTime: '2024-01-01T10:00:00Z',
                endTime: '2024-01-01T10:25:00Z',
                plannedDuration: 25,
                actualDuration: 25,
                status: 'completed',
                tag: 'work',
                notes: 'Done',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE pomodoro_sessions SET'),
                ['2024-01-01T10:00:00Z', '2024-01-01T10:25:00Z', 25, 25, 'completed', 'work', 'Done', mockSessionId, mockUserId]
            );
        });
    });

    describe('deleteById', () => {
        it('should delete a session', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            const result = await PomodoroSession.deleteById(mockSessionId, mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM pomodoro_sessions WHERE id = ? AND user_id = ?',
                [mockSessionId, mockUserId]
            );
            expect(result).toBe(true);
        });

        it('should return false when session is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await PomodoroSession.deleteById(999, mockUserId);

            expect(result).toBe(false);
        });

        it('should return false when deleting session of different user', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await PomodoroSession.deleteById(mockSessionId, 999);

            expect(result).toBe(false);
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                PomodoroSession.deleteById(mockSessionId, mockUserId)
            ).rejects.toThrow('Database error');
        });
    });

    describe('incrementInterruptions', () => {
        it('should increment interruptions count', async () => {
            const mockSession = {
                id: mockSessionId,
                interruptions: 3,
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockSession]);

            const result = await PomodoroSession.incrementInterruptions(mockSessionId, mockUserId);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('interruptions = interruptions + 1'),
                [mockSessionId, mockUserId]
            );
            expect(result).toEqual(mockSession);
        });

        it('should return null when session is not found', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await PomodoroSession.incrementInterruptions(999, mockUserId);

            expect(result).toBeNull();
        });

        it('should return null when session belongs to different user', async () => {
            db.query.mockResolvedValue({ affectedRows: 0 });

            const result = await PomodoroSession.incrementInterruptions(mockSessionId, 999);

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                PomodoroSession.incrementInterruptions(mockSessionId, mockUserId)
            ).rejects.toThrow('Database error');
        });
    });
});