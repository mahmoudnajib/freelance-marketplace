const joi = require('joi');

const idPattern = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = joi.object({
    service: joi.string().pattern(idPattern).required().messages({
        'string.pattern.base': 'Invalid Service ID format'
    })
});

const updateOrderSchema = joi.object({
    status: joi.string().valid('pending', 'in progress', 'completed', 'cancelled').required()
    .messages({'any.only': 'Status must be one of: pending, in progress, completed, or cancelled'})
});

module.exports = {
    createOrderSchema,
    updateOrderSchema
};

