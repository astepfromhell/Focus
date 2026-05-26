const User = require('../../../src/models/User');
const db = require('../../../src/models/index');

jest.mock('../../../src/models/index', () => ({
    query: jest.fn(),
    pool: {},
}));

describe('User Model', () => {
    const mockUserId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a user with all parameters', async () => {
            const mockInsertResult = { insertId: mockUserId, affectedRows: 1 };

            db.query.mockResolvedValue(mockInsertResult);

            const result = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashed_password',
                avatar_url: 'https://example.com/avatar.jpg',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                ['testuser', 'test@example.com', 'hashed_password', 'https://example.com/avatar.jpg']
            );
            expect(result).toEqual({
                id: mockUserId,
                username: 'testuser',
                email: 'test@example.com',
                avatar_url: 'https://example.com/avatar.jpg',
            });
        });

        it('should create a user with default null avatar', async () => {
            const mockInsertResult = { insertId: mockUserId, affectedRows: 1 };

            db.query.mockResolvedValue(mockInsertResult);

            const result = await User.create({
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashed_password',
            });

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                ['testuser', 'test@example.com', 'hashed_password', null]
            );
            expect(result.avatar_url).toBeNull();
        });

        it('should handle creation errors', async () => {
            db.query.mockRejectedValue(new Error('Duplicate email'));

            await expect(
                User.create({
                    username: 'testuser',
                    email: 'test@example.com',
                    password_hash: 'hashed_password',
                })
            ).rejects.toThrow('Duplicate email');
        });
    });

    describe('findByEmail', () => {
        it('should find a user by email with password hash', async () => {
            const mockUser = {
                id: mockUserId,
                username: 'testuser',
                email: 'test@example.com',
                avatar_url: null,
                password_hash: 'hashed_password',
                created_at: new Date(),
                updated_at: new Date(),
                last_login_at: null,
                is_active: true,
                email_verified: false,
            };

            db.query.mockResolvedValue([mockUser]);

            const result = await User.findByEmail('test@example.com');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                ['test@example.com']
            );
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('password_hash'),
                expect.any(Array)
            );
            expect(result).toEqual(mockUser);
        });

        it('should return null when user is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await User.findByEmail('notfound@example.com');

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(User.findByEmail('test@example.com')).rejects.toThrow('Database error');
        });
    });

    describe('findById', () => {
        it('should find a user by id without password hash', async () => {
            const mockUser = {
                id: mockUserId,
                username: 'testuser',
                email: 'test@example.com',
                avatar_url: null,
                created_at: new Date(),
                updated_at: new Date(),
                last_login_at: null,
                is_active: true,
                email_verified: false,
            };

            db.query.mockResolvedValue([mockUser]);

            const result = await User.findById(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [mockUserId]
            );
            expect(db.query).toHaveBeenCalledWith(
                expect.not.stringContaining('password_hash FROM'),
                expect.any(Array)
            );
            expect(result).toEqual(mockUser);
            expect(result).not.toHaveProperty('password_hash');
        });

        it('should return null when user is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await User.findById(999);

            expect(result).toBeNull();
        });
    });

    describe('findWithPasswordById', () => {
        it('should find a user by id with password hash', async () => {
            const mockUser = {
                id: mockUserId,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashed_password',
                avatar_url: null,
                created_at: new Date(),
                updated_at: new Date(),
                last_login_at: null,
                is_active: true,
                email_verified: false,
            };

            db.query.mockResolvedValue([mockUser]);

            const result = await User.findWithPasswordById(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('password_hash'),
                [mockUserId]
            );
            expect(result).toEqual(mockUser);
            expect(result).toHaveProperty('password_hash');
        });

        it('should return null when user is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await User.findWithPasswordById(999);

            expect(result).toBeNull();
        });
    });

    describe('updateById', () => {
        it('should update username', async () => {
            const mockUpdatedUser = {
                id: mockUserId,
                username: 'newusername',
                email: 'test@example.com',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedUser]);

            const result = await User.updateById(mockUserId, {
                username: 'newusername',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE users SET username = ?'),
                ['newusername', mockUserId]
            );
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should update email', async () => {
            const mockUpdatedUser = {
                id: mockUserId,
                email: 'newemail@example.com',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedUser]);

            const result = await User.updateById(mockUserId, {
                email: 'newemail@example.com',
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('email = ?'),
                ['newemail@example.com', mockUserId]
            );
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should update avatar_url', async () => {
            const mockUpdatedUser = {
                id: mockUserId,
                avatar_url: 'https://example.com/new-avatar.jpg',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedUser]);

            const result = await User.updateById(mockUserId, {
                avatar_url: 'https://example.com/new-avatar.jpg',
            });

            expect(result).toEqual(mockUpdatedUser);
        });

        it('should update multiple fields', async () => {
            const mockUpdatedUser = {
                id: mockUserId,
                username: 'newusername',
                email: 'newemail@example.com',
                avatar_url: 'https://example.com/avatar.jpg',
            };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUpdatedUser]);

            const result = await User.updateById(mockUserId, {
                username: 'newusername',
                email: 'newemail@example.com',
                avatar_url: 'https://example.com/avatar.jpg',
            });

            expect(db.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should return current user when no fields to update', async () => {
            const mockUser = { id: mockUserId, username: 'testuser' };

            db.query.mockResolvedValue([mockUser]);

            const result = await User.updateById(mockUserId, {});

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockUser);
        });

        it('should ignore non-allowed fields', async () => {
            const mockUser = { id: mockUserId, username: 'testuser' };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUser]);

            await User.updateById(mockUserId, {
                username: 'newusername',
                password_hash: 'should_be_ignored',
                is_active: false,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE users SET username = ?'),
                ['newusername', mockUserId]
            );
            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.not.stringContaining('password_hash'),
                expect.any(Array)
            );
        });

        it('should ignore undefined fields', async () => {
            const mockUser = { id: mockUserId, username: 'newusername' };

            db.query
                .mockResolvedValueOnce({ affectedRows: 1 })
                .mockResolvedValueOnce([mockUser]);

            await User.updateById(mockUserId, {
                username: 'newusername',
                email: undefined,
            });

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                'UPDATE users SET username = ? WHERE id = ?',
                ['newusername', mockUserId]
            );
        });
    });

    describe('updatePassword', () => {
        it('should update user password', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            await User.updatePassword(mockUserId, 'new_hashed_password');

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                ['new_hashed_password', mockUserId]
            );
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(
                User.updatePassword(mockUserId, 'new_hashed_password')
            ).rejects.toThrow('Database error');
        });
    });

    describe('updateLastLogin', () => {
        it('should update last login timestamp', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            await User.updateLastLogin(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET last_login_at = CURRENT_TIMESTAMP'),
                [mockUserId]
            );
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(User.updateLastLogin(mockUserId)).rejects.toThrow('Database error');
        });
    });

    describe('setEmailVerified', () => {
        it('should set email as verified', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            await User.setEmailVerified(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET email_verified = TRUE'),
                [mockUserId]
            );
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(User.setEmailVerified(mockUserId)).rejects.toThrow('Database error');
        });
    });

    describe('deleteById', () => {
        it('should delete a user', async () => {
            db.query.mockResolvedValue({ affectedRows: 1 });

            await User.deleteById(mockUserId);

            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM users WHERE id = ?',
                [mockUserId]
            );
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(User.deleteById(mockUserId)).rejects.toThrow('Database error');
        });
    });

    describe('findByUsername', () => {
        it('should find a user by username', async () => {
            const mockUser = {
                id: mockUserId,
                username: 'testuser',
                email: 'test@example.com',
                avatar_url: null,
                created_at: new Date(),
                updated_at: new Date(),
                last_login_at: null,
                is_active: true,
                email_verified: false,
            };

            db.query.mockResolvedValue([mockUser]);

            const result = await User.findByUsername('testuser');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE username = ?'),
                ['testuser']
            );
            expect(result).toEqual(mockUser);
            expect(result).not.toHaveProperty('password_hash');
        });

        it('should return null when user is not found', async () => {
            db.query.mockResolvedValue([]);

            const result = await User.findByUsername('nonexistent');

            expect(result).toBeNull();
        });

        it('should handle database errors', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(User.findByUsername('testuser')).rejects.toThrow('Database error');
        });
    });
});