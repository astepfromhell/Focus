const pomodoroService = require('../../../src/services/pomodoro.service');
const PomodoroSession = require('../../../src/models/PomodoroSession');
const Tag = require('../../../src/models/Tag');

jest.mock('../../../src/models/PomodoroSession');
jest.mock('../../../src/models/Tag');

describe('Pomodoro Service', () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        const mockPayload = {
            startTime: '2024-01-01T10:00:00.000Z',
            plannedDuration: 25,
            tag: 'work',
            notes: 'Working on project',
        };

        const mockSession = {
            id: 1,
            user_id: userId,
            start_time: new Date('2024-01-01T10:00:00.000Z'),
            planned_duration: 25,
            tag: 'work',
            notes: 'Working on project',
        };

        test('should create session with all fields', async () => {
            PomodoroSession.create.mockResolvedValue(mockSession);
            Tag.upsertTag.mockResolvedValue({});

            const result = await pomodoroService.createSession(userId, mockPayload);

            expect(PomodoroSession.create).toHaveBeenCalledWith({
                userId,
                startTime: new Date('2024-01-01T10:00:00.000Z'),
                plannedDuration: 25,
                tag: 'work',
                notes: 'Working on project',
            });

            expect(Tag.upsertTag).toHaveBeenCalledWith({
                userId,
                name: 'work',
                type: 'pomodoro',
            });

            expect(result).toEqual(mockSession);
        });

        test('should create session with current time if not provided', async () => {
            const payloadWithoutTime = {
                plannedDuration: 25,
                tag: 'work',
            };

            PomodoroSession.create.mockResolvedValue(mockSession);
            Tag.upsertTag.mockResolvedValue({});

            await pomodoroService.createSession(userId, payloadWithoutTime);

            const createCall = PomodoroSession.create.mock.calls[0][0];
            expect(createCall.startTime).toBeInstanceOf(Date);
            expect(Date.now() - createCall.startTime.getTime()).toBeLessThan(1000);
        });

        test('should create session without tag', async () => {
            const payloadWithoutTag = {
                plannedDuration: 25,
            };

            PomodoroSession.create.mockResolvedValue(mockSession);

            await pomodoroService.createSession(userId, payloadWithoutTag);

            expect(PomodoroSession.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    tag: null,
                    notes: null,
                })
            );

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });

        test('should handle empty tag string', async () => {
            const payloadWithEmptyTag = {
                plannedDuration: 25,
                tag: '',
            };

            PomodoroSession.create.mockResolvedValue(mockSession);

            await pomodoroService.createSession(userId, payloadWithEmptyTag);

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });
    });

    describe('listSessions', () => {
        const mockSessions = [
            {
                id: 1,
                user_id: userId,
                start_time: new Date('2024-01-01T10:00:00.000Z'),
                planned_duration: 25,
            },
            {
                id: 2,
                user_id: userId,
                start_time: new Date('2024-01-01T11:00:00.000Z'),
                planned_duration: 25,
            },
        ];

        test('should list sessions with default pagination', async () => {
            PomodoroSession.listByFilters.mockResolvedValue(mockSessions);
            PomodoroSession.countByFilters.mockResolvedValue(2);

            const result = await pomodoroService.listSessions(userId);

            expect(PomodoroSession.listByFilters).toHaveBeenCalledWith({
                userId,
                page: 1,
                limit: 20,
                status: undefined,
                tag: undefined,
                startDate: undefined,
                endDate: undefined,
            });

            expect(result).toEqual({
                items: mockSessions,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 2,
                    totalPages: 1,
                },
            });
        });

        test('should list sessions with custom pagination', async () => {
            const filters = {
                page: 2,
                limit: 10,
            };

            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(25);

            const result = await pomodoroService.listSessions(userId, filters);

            expect(PomodoroSession.listByFilters).toHaveBeenCalledWith(
                expect.objectContaining({
                    page: 2,
                    limit: 10,
                })
            );

            expect(result.pagination).toEqual({
                page: 2,
                limit: 10,
                total: 25,
                totalPages: 3,
            });
        });

        test('should list sessions with filters', async () => {
            const filters = {
                status: 'completed',
                tag: 'work',
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            };

            PomodoroSession.listByFilters.mockResolvedValue(mockSessions);
            PomodoroSession.countByFilters.mockResolvedValue(2);

            await pomodoroService.listSessions(userId, filters);

            expect(PomodoroSession.listByFilters).toHaveBeenCalledWith({
                userId,
                page: 1,
                limit: 20,
                status: 'completed',
                tag: 'work',
                startDate: '2024-01-01',
                endDate: '2024-01-31',
            });
        });

        test('should sanitize invalid page number', async () => {
            const filters = {
                page: -1,
                limit: 0,
            };

            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(0);

            const result = await pomodoroService.listSessions(userId, filters);

            expect(result.pagination.page).toBe(1);
            // limit=0 is falsy, so it uses DEFAULT_LIMIT (20)
            expect(result.pagination.limit).toBe(20);
        });

        test('should apply minimum limit of 1 for negative numbers', async () => {
            const filters = {
                page: 1,
                limit: -5,
            };

            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(0);

            const result = await pomodoroService.listSessions(userId, filters);

            expect(result.pagination.page).toBe(1);
            // limit=-5 is truthy, so Math.max(1, -5) applies, resulting in 1
            expect(result.pagination.limit).toBe(1);
        });

        test('should cap limit at 100', async () => {
            const filters = {
                limit: 500,
            };

            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(0);

            const result = await pomodoroService.listSessions(userId, filters);

            expect(result.pagination.limit).toBe(100);
        });

        test('should handle empty results', async () => {
            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(0);

            const result = await pomodoroService.listSessions(userId);

            expect(result.items).toEqual([]);
            expect(result.pagination.totalPages).toBe(1);
        });

        test('should handle non-numeric page and limit', async () => {
            const filters = {
                page: 'abc',
                limit: 'xyz',
            };

            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(0);

            const result = await pomodoroService.listSessions(userId, filters);

            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(20);
        });
    });

    describe('getSession', () => {
        const sessionId = 1;
        const mockSession = {
            id: sessionId,
            user_id: userId,
            start_time: new Date('2024-01-01T10:00:00.000Z'),
        };

        test('should get session successfully', async () => {
            PomodoroSession.findByIdForUser.mockResolvedValue(mockSession);

            const result = await pomodoroService.getSession(userId, sessionId);

            expect(PomodoroSession.findByIdForUser).toHaveBeenCalledWith(sessionId, userId);
            expect(result).toEqual(mockSession);
        });

        test('should throw error if session not found', async () => {
            PomodoroSession.findByIdForUser.mockResolvedValue(null);

            await expect(pomodoroService.getSession(userId, sessionId)).rejects.toEqual({
                status: 404,
                message: 'Session not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('updateSession', () => {
        const sessionId = 1;
        const mockSession = {
            id: sessionId,
            user_id: userId,
            start_time: new Date('2024-01-01T10:00:00.000Z'),
            actual_duration: 25,
        };

        const mockUpdatedSession = {
            ...mockSession,
            tag: 'updated',
        };

        beforeEach(() => {
            PomodoroSession.findByIdForUser.mockResolvedValue(mockSession);
        });

        test('should update session without duration calculation', async () => {
            const payload = {
                tag: 'updated',
                notes: 'Updated notes',
            };

            PomodoroSession.updateById.mockResolvedValue(mockUpdatedSession);
            Tag.upsertTag.mockResolvedValue({});

            const result = await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(sessionId, userId, payload);
            expect(Tag.upsertTag).toHaveBeenCalledWith({
                userId,
                name: 'updated',
                type: 'pomodoro',
            });
            expect(result).toEqual(mockUpdatedSession);
        });

        test('should calculate actualDuration from endTime', async () => {
            const payload = {
                endTime: '2024-01-01T10:30:00.000Z',
            };

            PomodoroSession.updateById.mockResolvedValue(mockUpdatedSession);

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(sessionId, userId, {
                endTime: '2024-01-01T10:30:00.000Z',
                actualDuration: 30,
            });
        });

        test('should use provided actualDuration', async () => {
            const payload = {
                actualDuration: 20,
            };

            PomodoroSession.updateById.mockResolvedValue(mockUpdatedSession);

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(sessionId, userId, {
                actualDuration: 20,
            });
        });

        test('should prioritize actualDuration over endTime', async () => {
            const payload = {
                endTime: '2024-01-01T10:30:00.000Z',
                actualDuration: 15,
            };

            PomodoroSession.updateById.mockResolvedValue(mockUpdatedSession);

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(sessionId, userId, {
                endTime: '2024-01-01T10:30:00.000Z',
                actualDuration: 15,
            });
        });

        test('should handle invalid endTime', async () => {
            const payload = {
                endTime: 'invalid-date',
            };

            PomodoroSession.updateById.mockResolvedValue(mockUpdatedSession);

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(sessionId, userId, {
                endTime: 'invalid-date',
                actualDuration: 25,
            });
        });

        test('should throw error if session not found on update', async () => {
            const payload = { tag: 'test' };
            PomodoroSession.updateById.mockResolvedValue(null);

            await expect(
                pomodoroService.updateSession(userId, sessionId, payload)
            ).rejects.toEqual({
                status: 404,
                message: 'Session not found',
                code: 'NOT_FOUND',
            });
        });

        test('should not upsert tag if tag is not provided', async () => {
            const payload = {
                notes: 'Just notes',
            };

            PomodoroSession.updateById.mockResolvedValue(mockUpdatedSession);

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(Tag.upsertTag).not.toHaveBeenCalled();
        });
    });

    describe('deleteSession', () => {
        const sessionId = 1;

        test('should delete session successfully', async () => {
            PomodoroSession.deleteById.mockResolvedValue(true);

            await pomodoroService.deleteSession(userId, sessionId);

            expect(PomodoroSession.deleteById).toHaveBeenCalledWith(sessionId, userId);
        });

        test('should throw error if session not found', async () => {
            PomodoroSession.deleteById.mockResolvedValue(false);

            await expect(pomodoroService.deleteSession(userId, sessionId)).rejects.toEqual({
                status: 404,
                message: 'Session not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('interruptSession', () => {
        const sessionId = 1;
        const mockSession = {
            id: sessionId,
            interruptions: 1,
        };

        test('should increment interruptions', async () => {
            PomodoroSession.incrementInterruptions.mockResolvedValue(mockSession);

            const result = await pomodoroService.interruptSession(userId, sessionId);

            expect(PomodoroSession.incrementInterruptions).toHaveBeenCalledWith(sessionId, userId);
            expect(result).toEqual(mockSession);
        });

        test('should throw error if session not found', async () => {
            PomodoroSession.incrementInterruptions.mockResolvedValue(null);

            await expect(pomodoroService.interruptSession(userId, sessionId)).rejects.toEqual({
                status: 404,
                message: 'Session not found',
                code: 'NOT_FOUND',
            });
        });
    });

    describe('getTags', () => {
        const mockTags = [
            { id: 1, name: 'work', type: 'pomodoro' },
            { id: 2, name: 'study', type: 'pomodoro' },
        ];

        test('should get pomodoro tags', async () => {
            Tag.listByType.mockResolvedValue(mockTags);

            const result = await pomodoroService.getTags(userId);

            expect(Tag.listByType).toHaveBeenCalledWith(userId, 'pomodoro');
            expect(result).toEqual(mockTags);
        });

        test('should handle empty tags list', async () => {
            Tag.listByType.mockResolvedValue([]);

            const result = await pomodoroService.getTags(userId);

            expect(result).toEqual([]);
        });
    });

    describe('Edge cases', () => {
        test('should handle duration computation with endTime before startTime', async () => {
            const sessionId = 1;
            const mockSession = {
                id: sessionId,
                user_id: userId,
                start_time: new Date('2024-01-01T10:00:00.000Z'),
                actual_duration: null,
            };

            PomodoroSession.findByIdForUser.mockResolvedValue(mockSession);
            PomodoroSession.updateById.mockResolvedValue(mockSession);

            const payload = {
                endTime: '2024-01-01T09:00:00.000Z',
            };

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(
                sessionId,
                userId,
                expect.objectContaining({
                    actualDuration: 0,
                })
            );
        });

        test('should round duration to minutes', async () => {
            const sessionId = 1;
            const mockSession = {
                id: sessionId,
                user_id: userId,
                start_time: new Date('2024-01-01T10:00:00.000Z'),
                actual_duration: null,
            };

            PomodoroSession.findByIdForUser.mockResolvedValue(mockSession);
            PomodoroSession.updateById.mockResolvedValue(mockSession);

            const payload = {
                endTime: '2024-01-01T10:45:30.000Z',
            };

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(
                sessionId,
                userId,
                expect.objectContaining({
                    actualDuration: 46,
                })
            );
        });

        test('should handle actualDuration of 0', async () => {
            const sessionId = 1;
            const mockSession = {
                id: sessionId,
                user_id: userId,
                start_time: new Date('2024-01-01T10:00:00.000Z'),
            };

            PomodoroSession.findByIdForUser.mockResolvedValue(mockSession);
            PomodoroSession.updateById.mockResolvedValue(mockSession);

            const payload = {
                actualDuration: 0,
            };

            await pomodoroService.updateSession(userId, sessionId, payload);

            expect(PomodoroSession.updateById).toHaveBeenCalledWith(
                sessionId,
                userId,
                expect.objectContaining({
                    actualDuration: 0,
                })
            );
        });

        test('should handle pagination with decimal numbers', async () => {
            const filters = {
                page: 2.7,
                limit: 15.9,
            };

            PomodoroSession.listByFilters.mockResolvedValue([]);
            PomodoroSession.countByFilters.mockResolvedValue(0);

            const result = await pomodoroService.listSessions(userId, filters);

            // The code doesn't round decimals, so they pass through as-is
            expect(result.pagination.page).toBe(2.7);
            expect(result.pagination.limit).toBe(15.9);
        });
    });
});