const joi = require('joi');

const registerSchema = joi.object({
    firstName: joi.string().min(2).max(30).required(),
        lastName: joi.string().min(2).max(30).required(),
            email: joi.string().email().required(),
                password: joi.string().min(6).required(),
            age: joi.number().integer().min(7),
        role: joi.string().valid("buyer", "seller").required(),
    avatar: joi.string().allow('', null)
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});

const updateUserSchema = joi.object({
    firstName: joi.string().min(2).max(30).required(),
        lastName: joi.string().min(2).max(30).required(),
            email: joi.string().email().required(),
            password: joi.string().min(6).required(),
        age: joi.number().integer().min(7),
    withdrawalAccount: joi.string().pattern(/^01[0125]\d{8}$/).optional()
    .messages({'string.pattern.base': 'Withdrawal account must be a valid Egyptian mobile number.'})
});

module.exports = {
    registerSchema,
    loginSchema,
    updateUserSchema
};