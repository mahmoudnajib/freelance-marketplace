const joi = require('joi');

const registerSchema = joi.object({
    firstName: joi.string().min(2).max(30).required(),
        lastName: joi.string().min(2).max(30).required(),
            age: joi.number().integer().min(7).required(),
                email: joi.string().email().required(),
            password: joi.string().min(6).required(),
        role: joi.string().valid("buyer", "seller", "admin").optional(),
    adminKey: joi.string().optional()
});

const loginSchema = joi.object({
    email: joi.string().email().required(),
        password: joi.string().required(),
});

const updateUserSchema = joi.object({
    firstName: joi.string().min(2).max(30).optional(),
        lastName: joi.string().min(2).max(30).optional(),
            email: joi.string().email().optional(),
            password: joi.string().min(6).optional(),
        age: joi.number().integer().min(7).optional(),
    withdrawalAccount: joi.string().pattern(/^01[0125]\d{8}$/)
    .messages({'string.pattern.base': 'Withdrawal account must be a valid Egyptian mobile number.'})
});

module.exports = {
    registerSchema,
    loginSchema,
    updateUserSchema
};