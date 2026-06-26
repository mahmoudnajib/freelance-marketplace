const joi = require('joi');
const constants = require('../utils/constants');

const serviceSchema = joi.object({
    title: joi.string().min(3).max(30).required(),
    category: joi.string().valid(...constants.CATEGORIES).required(),
    description: joi.string().min(3).required(),
    price: joi.number().integer().min(0).required()
});


module.exports = {
    serviceSchema
};





