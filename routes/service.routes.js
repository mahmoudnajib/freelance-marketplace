const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');

router.route('/')
    .post(verifyToken, allowedTo("seller"), serviceController.createService)
    .get(serviceController.getServices);
    
router.route('/:id')
    .get(serviceController.getService)
    .patch(verifyToken, allowedTo("admin", "seller"), serviceController.updateService)
    .delete(verifyToken, allowedTo("admin", "seller") ,serviceController.deleteService);

module.exports = router;