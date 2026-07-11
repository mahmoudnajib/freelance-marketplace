const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const {verifyToken, allowedTo} = require('../middlewares/verifyToken');

const validator = require('../middlewares/validator.middleware');
const reviewSchema = require('../validators/reviewSchema');

router.route('/')
    .post(verifyToken, allowedTo("buyer"), validator(reviewSchema), reviewController.createReview)
    .get(reviewController.getReviews)

router.route('/:id')
    .get(reviewController.getReview)
    .patch(verifyToken, allowedTo("buyer"), validator(reviewSchema), reviewController.updateReview)
    .delete(verifyToken, allowedTo("admin", "buyer"), reviewController.deleteReview)

module.exports = router;