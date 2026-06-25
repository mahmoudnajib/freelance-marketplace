const jwt = require('jsonwebtoken');
const token = require('../utils/generateToken');

const verifyToken = (req, res, next)=>{
    const authorizationValue = req.headers['Authorization'] || req.headers['authorization'];
    if(!authorizationValue){
        return res.status(401).json({status: "fail", message: "Token required"});
    }
    
    const token = authorizationValue.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userData = payload;
        next();
    } catch (err){
        return res.status(401).json({status: "fail", message: "invalid or expired token"});
    }
};

const allowedTo = (...roles)=>{
    return (req, res, next)=>{
        if(!roles.includes(req.userData.role)){
            return res.status(403).json({status: "fail", message: "Role not authorized"});
        }
        next();
    }
};

module.exports = {
    verifyToken,
    allowedTo
};