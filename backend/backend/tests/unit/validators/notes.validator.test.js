const {
    createNoteSchema,
    updateNoteSchema,
    listNotesSchema,
    updatePositionSchema,
    pinNoteSchema,
    archiveNoteSchema,
    batchUpdateSchema
} = require('../../../src/validators/notes.validator');

describe('Notes Validators', () => {
    describe('createNoteSchema', () => {
        test('should validate correct note creation data', () => {
            const validData = {
                content: 'This is a test note',
                positionX: 100,
                positionY: 200,
                width: 200,
                height: 150,
                zIndex: 10,
                color: '#FFEB3B',
                tags: ['work', 'important'],
                isPinned: true,
                isArchived: false
            };

            const { error } = createNoteSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should validate with minimal fields', () => {
            const validData = {
                content: '' // Empty content is allowed
            };

            const { error } = createNoteSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject with invalid color format', () => {
            const invalidData = {
                content: 'Test',
                color: 'invalid-color'
            };

            const { error } = createNoteSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['color']);
            expect(error.message).toContain('HEX格式');
        });

        test('should reject with position out of bounds', () => {
            const invalidData = {
                content: 'Test',
                positionX: -10001 // Min is -10000
            };

            const { error } = createNoteSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['positionX']);
        });

        test('should accept tags as array or string', () => {
            const asArray = {
                content: 'Test',
                tags: ['tag1', 'tag2']
            };

            const asString = {
                content: 'Test',
                tags: 'tag1,tag2'
            };

            const asEmptyString = {
                content: 'Test',
                tags: ''
            };

            expect(createNoteSchema.validate(asArray).error).toBeUndefined();
            expect(createNoteSchema.validate(asString).error).toBeUndefined();
            expect(createNoteSchema.validate(asEmptyString).error).toBeUndefined();
        });

        test('should reject with too many tags', () => {
            const invalidData = {
                content: 'Test',
                tags: Array.from({ length: 21 }, (_, i) => `tag${i}`) // 21 tags, max is 20
            };

            const { error } = createNoteSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['tags']);
        });
    });

    describe('updateNoteSchema', () => {
        test('should validate correct note update data', () => {
            const validData = {
                content: 'Updated content',
                positionX: 150,
                color: '#FF5722'
            };

            const { error } = updateNoteSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject empty update object', () => {
            const invalidData = {};

            const { error } = updateNoteSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('object.min');
        });

        test('should accept partial updates', () => {
            const validData = {
                isPinned: true
            };

            const { error } = updateNoteSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('listNotesSchema', () => {
        test('should validate correct list filters', () => {
            const validData = {
                isArchived: true
            };

            const { error, value } = listNotesSchema.validate(validData);

            expect(error).toBeUndefined();
            expect(value.isArchived).toBe(true);
        });

        test('should apply default value for isArchived', () => {
            const data = {};

            const { value } = listNotesSchema.validate(data);

            expect(value.isArchived).toBe(false);
        });

        test('should reject unknown fields', () => {
            const invalidData = {
                isArchived: false,
                extraField: 'should not be here'
            };

            const { error } = listNotesSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('object.unknown');
        });
    });

    describe('updatePositionSchema', () => {
        test('should validate correct position update data', () => {
            const validData = {
                positionX: 100,
                positionY: 200,
                zIndex: 5
            };

            const { error } = updatePositionSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject missing required fields', () => {
            const invalidData = {
                positionX: 100,
                positionY: 200
                // Missing zIndex
            };

            const { error } = updatePositionSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['zIndex']);
        });
    });

    describe('pinNoteSchema', () => {
        test('should validate correct pin data', () => {
            const validData = {
                isPinned: true
            };

            const { error } = pinNoteSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject without isPinned', () => {
            const invalidData = {};

            const { error } = pinNoteSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].path).toEqual(['isPinned']);
        });
    });

    describe('archiveNoteSchema', () => {
        test('should validate correct archive data', () => {
            const validData = {
                isArchived: false
            };

            const { error } = archiveNoteSchema.validate(validData);

            expect(error).toBeUndefined();
        });
    });

    describe('batchUpdateSchema', () => {
        test('should validate correct batch update data as array', () => {
            const validData = [
                {
                    id: 1,
                    positionX: 100,
                    positionY: 200,
                    zIndex: 5
                },
                {
                    id: 2,
                    positionX: 300,
                    positionY: 400,
                    zIndex: 10
                }
            ];

            const { error } = batchUpdateSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should validate correct batch update data as object with items', () => {
            const validData = {
                items: [
                    {
                        id: 1,
                        positionX: 100,
                        positionY: 200,
                        zIndex: 5
                    }
                ]
            };

            const { error } = batchUpdateSchema.validate(validData);

            expect(error).toBeUndefined();
        });

        test('should reject empty batch update', () => {
            const invalidData = [];

            const { error } = batchUpdateSchema.validate(invalidData);

            expect(error).toBeDefined();
            expect(error.details[0].type).toBe('array.min');
        });

        test('should reject with too many items', () => {
            const invalidData = {
                items: Array.from({ length: 101 }, (_, i) => ({
                    id: i + 1,
                    positionX: 100,
                    positionY: 100,
                    zIndex: 1
                }))
            };

            const { error } = batchUpdateSchema.validate(invalidData);

            expect(error).toBeDefined();
        });

        test('should reject with missing required fields in items', () => {
            const invalidData = [
                {
                    id: 1,
                    positionX: 100
                    // Missing positionY and zIndex
                }
            ];

            const { error } = batchUpdateSchema.validate(invalidData);

            expect(error).toBeDefined();
        });
    });
});