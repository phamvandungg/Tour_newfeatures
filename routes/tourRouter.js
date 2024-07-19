const express = require('express');
const tourControllers = require("./../controllers/tourControllers")
const authControllers = require("./../controllers/authControllers")
const reviewRouter  = require("./reviewRouter");
const { route } = require('express/lib/router');

const router = express.Router();

// lấy tác cả các review theo tour, thêm veview theo tour
router.use('/:tourId/reviews', reviewRouter)

// router.param("id",tourControllers.checkId)
router
   .route("/top-5-cheap")
   .get(tourControllers.Toptours,tourControllers.getAllTours);
router
   .route("/tours-year")
   .get(tourControllers.Toptours,tourControllers.getMonthlyPlan);

router 
    .route("/start-tours")
    .get(authControllers.protect,authControllers.restrictTo('admin','lead-guide'),tourControllers.getTourStats)

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourControllers.getTourWithin )
    
router
    .route('/distances/:latlng/unit/:unit')
    .get(tourControllers.getDistances)
router
    .route("/")
    .get(tourControllers.getAllTours)
    .post(authControllers.protect,authControllers.restrictTo('admin','lead-guide'),tourControllers.postTours)

router
    .route("/:id")
    .get(tourControllers.getToursId)
    .patch(tourControllers.patchTours)
    .delete(authControllers.protect,authControllers.restrictTo('admin','lead-guide'),tourControllers.deleteTours);


module.exports = router;
