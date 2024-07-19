
const  Review = require('./../model/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const  Apperr= require('./../utils/errTours');
const factory = require('./handlerFactory')
exports.getAllReviews = factory.getAll(Review)
exports.getReviewId = catchAsync(async (req,res,next) => {
    const reviews = await Review.findById(req.params.id);
    if(!reviews) next(new Apperr('không tìm thấy review',500) )
    res.status(200).json({
        status:'success',
        review: reviews
    })
})

exports.setTourUserId = (req,res,next) => {
    if(req.params.tourId) req.body.tourId = req.params.tourId
    if(req.body.user) req.body.user = req.user.id
    next()
}
exports.createReview = factory.createOne(Review)
exports.getReviewId = factory.getOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.deleteReview = factory.deleteOne(Review)