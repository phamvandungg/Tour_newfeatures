const express = require('express');
const reviewController = require('./../controllers/reviewControllers');
const authControllers = require('./../controllers/authControllers');
// tạo ra router con để tái sử dụng
const router = express.Router({mergeParams:true});

router.use(authControllers.protect)

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authControllers.restrictTo('user'),
    reviewController.setTourUserId,reviewController.createReview);


router
    .route('/:id')
    .get(reviewController.getReviewId)
    .patch(authControllers.restrictTo('user','admin'),reviewController.updateReview)
    .delete(reviewController.deleteReview)
module.exports = router;