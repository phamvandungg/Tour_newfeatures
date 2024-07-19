const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review:{
        type:String,
        required: [true, 'Review must be provided'],
        minLength: [5, 'Review must be at least 5 characters long'],
        maxLength: [500, 'Review must be less than 500 characters long']
    },
    rating:{
        type:Number,
        required: [true, 'Rating must be provided'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating must be at most 5']

    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    tour :{
        type:mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true,'review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'review must belong to a user']
    }
    

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.index({user:1,tour:1},{unique:true})

reviewSchema.pre(/^find/, function(next) {

    // this.populate({
    //   path: 'user',
    //   select: 'name'
    // }).populate({
    //   path: 'tour',
    //   select: 'name photo'
    // });
    // next();
      
    this.populate({
        path: 'user',
        select: 'name photo'
      });
      next();
  
  });

// trung bình đánh lá trong 1 tour
reviewSchema.static.calcAverageRatings = async function(tourId){
    const start = await this.aggregate([{
        $match: {tour:tourId}
    },
    {
        $group: {
            _id: '$tour',
            nRatings: {$sum: 1},
            avgRating: {$avg: '$rating'}
        }
    }
])  
    if(start.length > 0) {
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: start[0].nRatings,
            ratingsAverage: start[0].avgRating
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }
}

reviewSchema.post('save',function (){
    this.constructor.calcAverageRatings(this.tour)
    
})
// cập nhật lại khi update và delete
reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r = await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/,async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour);
})

const Review = mongoose.model('Review',reviewSchema);
module.exports = Review;