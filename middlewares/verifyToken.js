const jwt = require('jsonwebtoken');
const token = require('../utils/generateToken');
const appError = require('../utils/appError');
const statusText = require('../utils/statusText');


const verifyToken = (req, res, next)=>{
    const authorizationValue = req.headers['Authorization'] || req.headers['authorization'];
    if(!authorizationValue){
        const error = new appError("Token required", 401, statusText.FAIL);
        return next(error);
    }
    
    const token = authorizationValue.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userData = payload;
        next();
    } catch (err){
        const error = new appError("invalid or expired token", 401, statusText.FAIL);
        return next(error);
    }
};

const allowedTo = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.userData.role)){
            const error = new appError("Role not authorized", 403, statusText.FAIL);
            return next(error);
        }
        next();
    }
};

module.exports = {
    verifyToken,
    allowedTo
};