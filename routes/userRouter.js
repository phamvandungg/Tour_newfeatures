const express = require('express');
const userControllers = require("./../controllers/userControllers")
const authControllers = require("./../controllers/authControllers")
const reviewControllers = require("./../controllers/reviewControllers")

const router = express.Router();

router.post('/them',authControllers.createUser)

router.post('/login',authControllers.loginUser)
router.post('/forgotPassword',authControllers.forgotPassword)
router.patch('/resetPassword/:token',authControllers.resetPassword)
// đăg nhập mới thực hiện
router.use(authControllers.protect)

router.patch('/updatePassword',authControllers.updatePassword);
router.patch('/updateMe',userControllers.updateMe)
router.delete('/deleteMe',userControllers.deleteMe)
router.get('/getMe',userControllers.getMe,userControllers.getUsersId)

// 
router.use(authControllers.restrictTo('admin'));
router
    .route("/")
    .get(userControllers.getAllUsers)
    .post(userControllers.postUsers)
router 
    .route("/:id")
    .get(userControllers.getUsersId)
    .patch(userControllers.patchUsers)
    .delete(userControllers.deleteUsers)


module.exports = router;
