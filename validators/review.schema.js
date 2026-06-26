const joi = require('joi')

const idPattern = /^[0-9a-fA-F]{24}$/;


const reviewSchema = joi.object({
    rating: joi.number().integer().min(1).max(5).required(),
    comment: joi.string().allow('', null),
    service: joi.string().pattern(idPattern).required().messages({
            'string.pattern.base': 'Invalid Service ID format'
        })
});

module.exports = {
    reviewSchema
};