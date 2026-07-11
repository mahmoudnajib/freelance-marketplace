class AppError extends Error {
    constructor(message, statusCode, statusText){
        super(message);
        this.statusText = statusText;
        this.statusCode = statusCode;
    
        Error.captureStackTrace(this, this.constructor);
        
    }
};

module.exports = AppError;
