const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');
const upload = require('../middlewares/upload.middleware');

const validator = require('../middlewares/validator.middleware');
const {registerSchema, loginSchema, updateUserSchema} = require('../validators/userSchema');


router.route('/register').post(validator(registerSchema), userController.register);
router.route('/login').post(validator(loginSchema), userController.login);

router.use(verifyToken);

router.route('/my-profile').get(userController.getMe);
router.route('/update-profile').patch(upload.single('avatar'), validator(updateUserSchema), userController.updateUser)


router.route('/').get(allowedTo('admin'), userController.getUsers);

router.route('/:id').get(userController.getUser);


module.exports = router;