const User = require('./../model/userModel')
const catchAsync = require('./../utils/catchAsync')
const appErr = require('./../utils/errTours');
const  factory = require('./handlerFactory')

const fillObj = (obj,...allowdsFiles) =>{
    const newObj = {...obj};
    Object.keys(obj).forEach(key =>
      {  if(allowdsFiles(key)) newObj[key] = obj[key];}
        ) 
        return newObj; 
}

exports.getAllUsers = factory.getAll(User)

exports.postUsers = factory.createOne(User)
exports.patchUsers = factory.updateOne(User)
exports.deleteUsers = factory.deleteOne(User)
    

exports.getUsersId = factory.getOne(User)

// cập nhật thông tin người dùng đăng đăng nhập, trừ password
exports.updateMe = catchAsync(async(req, res,next) => {
    if(req.body.password || req.body.passwordConfirm) {
        return next(new appErr('this tours is not allowed to',400))
    }
    const filteredBody = fillObj(req.body,'name','password')
    const updateUser = await User.findByIdAndUpdate(req.body.id,filteredBody,{
        new:true,
        runValidators: true
    })
    res.status(200).json({
        status: "success",
        data: {
            user: updateUser
        }
    })

})

exports.deleteMe = catchAsync(async (req,res,next) =>{
    await User.findByIdAndUpdate(req.user.id,{active:false});

    res.status(200).json({
        status: "success",
        data: {
            message: "User deleted successfully"
        }
    })

})

exports.getMe = (req,res,next) =>{
    req.params.id = req.user.id
    next()
}