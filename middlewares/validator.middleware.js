const appError = require('../utils/appError');
const statusText = require('../utils/statusText');

const validationSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {abortEarly: false});
        
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return next(new appError (errorMessage, 400, statusText.FAIL));
        }
        next();
    };
};

module.exports = validationSchema;