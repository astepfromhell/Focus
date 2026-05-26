const Joi = require('joi');

const coord = Joi.number().integer().min(-10000).max(10000);
const size = Joi.number().integer().min(50).max(1000);
const zIndex = Joi.number().integer().min(0).max(100000);
const color = Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).message('颜色必须为HEX格式');
const tagsField = Joi.alternatives().try(
    Joi.array().items(Joi.string().trim().max(50)).max(20),
    Joi.string().trim().max(255).allow('', null)
);

exports.createNoteSchema = Joi.object({
    content: Joi.string().trim().allow('').max(2000).default(''),  // ✅ 允许空字符串
    positionX: coord,
    positionY: coord,
    width: size,
    height: size,
    zIndex,
    color,
    tags: tagsField,
    isPinned: Joi.boolean(),
    isArchived: Joi.boolean(),
});

exports.updateNoteSchema = Joi.object({
    content: Joi.string().trim().allow('').max(2000),  // ✅ 更新时也允许空字符串
    positionX: coord,
    positionY: coord,
    width: size,
    height: size,
    zIndex,
    color,
    tags: tagsField,
    isPinned: Joi.boolean(),
    isArchived: Joi.boolean(),
}).min(1);

exports.listNotesSchema = Joi.object({
    isArchived: Joi.boolean().default(false),
}).unknown(false);

exports.updatePositionSchema = Joi.object({
    positionX: coord.required(),
    positionY: coord.required(),
    zIndex: zIndex.required(),
});

exports.pinNoteSchema = Joi.object({
    isPinned: Joi.boolean().required(),
});

exports.archiveNoteSchema = Joi.object({
    isArchived: Joi.boolean().required(),
});

exports.batchUpdateSchema = Joi.alternatives().try(
    Joi.array()
        .items(
            Joi.object({
                id: Joi.number().integer().min(1).required(),
                positionX: coord.required(),
                positionY: coord.required(),
                zIndex: zIndex.required(),
            })
        )
        .min(1)
        .max(100),
    Joi.object({
        items: Joi.array()
            .items(
                Joi.object({
                    id: Joi.number().integer().min(1).required(),
                    positionX: coord.required(),
                    positionY: coord.required(),
                    zIndex: zIndex.required(),
                })
            )
            .min(1)
            .max(100)
            .required(),
    })
);