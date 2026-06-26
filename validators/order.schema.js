const joi = require('joi');

const idPattern = /^[0-9a-fA-F]{24}$/;

const orderSchema = joi.object({
    service: joi.string().pattern(idPattern).required().messages({
        'string.pattern.base': 'Invalid Service ID format'
    })
});

module.exports = {
    orderSchema
};

