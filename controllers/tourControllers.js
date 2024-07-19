const APITourstill = require('../utils/apiFest');
const Tour = require('./../model/tourModel');

const catchAsync = require('./../utils/catchAsync');
const Apperr = require('./../utils/errTours')
const factory = require('./handlerFactory');
exports.Toptours = async(req, res, next) => {
    req.query.limit = 5;
    req.query.fields = 'name,price,ratingAverage,difficulty';
    req.query.sort = '-ratingsAverage,price';
    next();

}

exports.getAllTours = factory.getAll(Tour)

exports.getToursId = factory.getOne(Tour,{path:'reviews'});

exports.postTours = factory.createOne(Tour)
    
 


exports.patchTours = factory.updateOne(Tour)
exports.deleteTours = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
   
    const tourStats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {  $group:{
                _id: {$toUpper: '$difficulty'},
                numTours: { $sum: 1 },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },{
            $sort:{avgPrice:1}
    },{
        $match: {
            _id: { $ne: 'EASY' }
        }
    }
    ]);
    res.status(200).json({
        status: "success",
        data: {
             tourStats
        }
    }) 
}

)

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  
    // const year = req.query.year * 1;//2024
    const year = 2021;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 6
        }
    ])
    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    })

})
// tìm tour theo vị trí
exports.getTourWithin = catchAsync(async (req,res,next)=>{
    const {distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit ==='mi'? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next (new Apperr('ko tìm thấy',400) )
    }
    const tours = await Tour.find({
      startLocation:  {$geoWithin: {$centerSphere:[lat,lng],radius}
    }})

    res.status(200).json({
        status:'success',
        results: tours.length,
        data: {
            tours
        }
    })

})

exports.getDistances = catchAsync(async (req,res,next)=>{
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit ==='mi'? 0.000621371 : 0.001;
    if(!lat ||!lng) {
        next (new Apperr('ko tìm thấy',400) )
    }
    const tours = await Tour.aggregate([{
        $geoNear: {
            near: { type: 'Point', 
                    coordinates: [lng * 1, lat * 1] },
            distanceField: 'distance',
            distanceMultiplier: multiplier
         
        }},
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    
]);
    res.status(200).json({
        status:'success',
        results: tours.length,
        data: {
            data: tours
        }
})
});