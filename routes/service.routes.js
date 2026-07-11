const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');
const validator = require('../middlewares/validator.middleware');
const serviceSchema = require('../validators/serviceSchema');


router.route('/')
    .post(verifyToken, allowedTo("seller"),validator(serviceSchema), serviceController.createService)
    .get(serviceController.getServices);
    
router.route('/:id')
    .get(serviceController.getService)
    .patch(verifyToken, allowedTo("admin", "seller"), validator(serviceSchema), serviceController.updateService)
    .delete(verifyToken, allowedTo("admin", "seller") ,serviceController.deleteService);

module.exports = router;