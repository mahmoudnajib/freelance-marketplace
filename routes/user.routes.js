const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');

router.route('/register').post(userController.register);
router.route('/login').post(userController.login);
router.route('/')
    .get(verifyToken, allowedTo('admin'), userController.getUsers);

module.exports = router;