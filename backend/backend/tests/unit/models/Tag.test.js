const Tag = require('../../../src/models/Tag');
const db = require('../../../src/models/index');

jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('Tag Model', () => {
    const mockUserId = 1;
    const mockTagId = 100;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('upsertTag', () => {
        it('should create a new tag when it does not exist', async () => {
            const mockInsertResult = { insertId: mockTagId, affectedRows: 1 };
            const tagData = {
                userId: mockUserId,
                name: 'work',
                type: 'pomodoro',
                color: '#FF5733',
            };

            db.query
                .mockResolvedValueOnce([]) // SELECT returns empty (tag doesn't exist)
                .mockResolvedValueOnce(mockInsertResult); // INSERT

            const result = await Tag.upsertTag(tagData);

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT id FROM tags'),
                [mockUserId, 'work', 'pomodoro']
            );
            expect(db.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO tags'),
                [mockUserId, 'work', 'pomodoro', '#FF5733']
            );
            expect(result).toEqual({
                id: mockTagId,
                name: 'work',
                type: 'pomodoro',
                color: '#FF5733',
            });
        });

        it('should update existing tag usage count', async () => {
            const existingTag = { id: mockTagId };

            db.query
                .mockResolvedValueOnce([existingTag]) // SELECT returns existing tag
                .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE

            const result = await Tag.upsertTag({
                userId: mockUserId,
                name: 'work',
                type: 'pomodoro',
                color: '#FF5733',
            });

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT id FROM tags'),
                [mockUserId, 'work', 'pomodoro']
            );
            expect(db.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('UPDATE tags SET usage_count = usage_count + 1'),
                [mockTagId]
            );
            expect(result).toEqual(existingTag);
        });

        it('should use default type and color when not provided', async () => {
            const mockInsertResult = { insertId: mockTagId, affectedRows: 1 };

            db.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce(mockInsertResult);

            const result = await Tag.upsertTag({
                userId: mockUserId,
                name: 'study',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT id FROM tags'),
                [mockUserId, 'study', 'pomodoro']
            );
            expect(db.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO tags'),
                [mockUserId, 'study', 'pomodoro', '#757575']
            );
            expect(result).toEqual({
                id: mockTagId,
                name: 'study',
                type: 'pomodoro',
                color: '#757575',
            });
        });

        it('should return null when name is empty', async () => {
            const result = await Tag.upsertTag({
                userId: mockUserId,
                name: '',
                type: 'pomodoro',
            });

            expect(db.query).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should return null when name is not provided', async () => {
            const result = await Tag.upsertTag({
                userId: mockUserId,
                type: 'pomodoro',
            });

            expect(db.query).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should return null when name is null', async () => {
            const result = await Tag.upsertTag({
                userId: mockUserId,
                name: null,
                type: 'pomodoro',
            });

            expect(db.query).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('should handle different tag types', async () => {
            const mockInsertResult = { insertId: mockTagId, affectedRows: 1 };

            db.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce(mockInsertResult);

            const result = await Tag.upsertTag({
                userId: mockUserId,
                name: 'meeting',
                type: 'note',
                color: '#00FF00',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT id FROM tags'),
                [mockUserId, 'meeting', 'note']
            );
            expect(result.type).toBe('note');
        });

        it('should handle database errors on SELECT', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                Tag.upsertTag({
                    userId: mockUserId,
                    name: 'work',
                    type: 'pomodoro',
                })
            ).rejects.toThrow('Database error');
        });

        it('should handle database errors on INSERT', async () => {
            db.query
                .mockResolvedValueOnce([])
                .mockRejectedValueOnce(new Error('Insert failed'));

            await expect(
                Tag.upsertTag({
                    userId: mockUserId,
                    name: 'work',
                    type: 'pomodoro',
                })
            ).rejects.toThrow('Insert failed');
        });

        it('should handle database errors on UPDATE', async () => {
            const existingTag = { id: mockTagId };

            db.query
                .mockResolvedValueOnce([existingTag])
                .mockRejectedValueOnce(new Error('Update failed'));

            await expect(
                Tag.upsertTag({
                    userId: mockUserId,
                    name: 'work',
                    type: 'pomodoro',
                })
            ).rejects.toThrow('Update failed');
        });

        it('should create tag with custom color', async () => {
            const mockInsertResult = { insertId: mockTagId, affectedRows: 1 };
            const customColor = '#123456';

            db.query
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce(mockInsertResult);

            const result = await Tag.upsertTag({
                userId: mockUserId,
                name: 'urgent',
                type: 'pomodoro',
                color: customColor,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO tags'),
                [mockUserId, 'urgent', 'pomodoro', customColor]
            );
            expect(result.color).toBe(customColor);
        });
    });

    describe('listByType', () => {
        it('should list tags by type with default type', async () => {
            const mockTags = [
                { id: 1, name: 'work', color: '#FF5733', type: 'pomodoro', usage_count: 10, created_at: new Date() },
                { id: 2, name: 'study', color: '#00FF00', type: 'pomodoro', usage_count: 5, created_at: new Date() },
            ];

            db.query.mockResolvedValue(mockTags);

            const result = await Tag.listByType(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT id, name, color, type, usage_count, created_at FROM tags'),
                [mockUserId, 'pomodoro']
            );
            expect(result).toEqual(mockTags);
        });

        it('should list tags by specific type', async () => {
            const mockTags = [
                { id: 3, name: 'meeting', color: '#0000FF', type: 'note', usage_count: 3, created_at: new Date() },
            ];

            db.query.mockResolvedValue(mockTags);

            const result = await Tag.listByType(mockUserId, 'note');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUserId, 'note']
            );
            expect(result).toEqual(mockTags);
        });

        it('should return empty array when no tags found', async () => {
            db.query.mockResolvedValue([]);

            const result = await Tag.listByType(mockUserId, 'pomodoro');

            expect(result).toEqual([]);
        });

        it('should order by usage_count DESC and name ASC', async () => {
            const mockTags = [
                { id: 1, name: 'work', usage_count: 10 },
                { id: 2, name: 'study', usage_count: 10 },
                { id: 3, name: 'break', usage_count: 5 },
            ];

            db.query.mockResolvedValue(mockTags);

            await Tag.listByType(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('ORDER BY usage_count DESC, name ASC'),
                [mockUserId, 'pomodoro']
            );
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                Tag.listByType(mockUserId, 'pomodoro')
            ).rejects.toThrow('Database error');
        });

        it('should return all required fields', async () => {
            const mockTags = [
                {
                    id: 1,
                    name: 'work',
                    color: '#FF5733',
                    type: 'pomodoro',
                    usage_count: 10,
                    created_at: new Date('2024-01-01'),
                },
            ];

            db.query.mockResolvedValue(mockTags);

            const result = await Tag.listByType(mockUserId);

            expect(result[0]).toHaveProperty('id');
            expect(result[0]).toHaveProperty('name');
            expect(result[0]).toHaveProperty('color');
            expect(result[0]).toHaveProperty('type');
            expect(result[0]).toHaveProperty('usage_count');
            expect(result[0]).toHaveProperty('created_at');
        });

        it('should filter tags by user', async () => {
            const mockTags = [];

            db.query.mockResolvedValue(mockTags);

            await Tag.listByType(mockUserId, 'pomodoro');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE user_id = ?'),
                [mockUserId, 'pomodoro']
            );
        });

        it('should list tags for different users separately', async () => {
            const user1Tags = [{ id: 1, name: 'work' }];
            const user2Tags = [{ id: 2, name: 'study' }];

            db.query
                .mockResolvedValueOnce(user1Tags)
                .mockResolvedValueOnce(user2Tags);

            const result1 = await Tag.listByType(1, 'pomodoro');
            const result2 = await Tag.listByType(2, 'pomodoro');

            expect(result1).toEqual(user1Tags);
            expect(result2).toEqual(user2Tags);
            expect(db.query).toHaveBeenCalledTimes(2);
        });
    });
});