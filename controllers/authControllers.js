const User = require('./../model/userModel');
const jwt = require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/errTours')
const sendEmail = require('./../utils/email')
const crypto = require('crypto')
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}
const createSendToken = (user,statusCode, res) => {
    const token = signToken(user._id);
    const cookiesOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true
    }
    if(process.env.NODE_ENV === 'production') cookiesOptions.secure = true;
    res.cookie('jwt',token,cookiesOptions);
    //không gởi password về người dùng
    user.password = undefined;
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user: user
        }
    })
}
exports.createUser = catchAsync(async (req,res,next) =>{

    const newUser = await User.create(req.body);
    createSendToken(newUser,201,res)
})

exports.loginUser = catchAsync(async (req,res,next) =>{
    const {email, password} = req.body;
    if(!email || !password) {
         next(new AppError("Please provide email and password", 400))
    }
    const user = await User.findOne({email}).select('+password');
    if (!user) {
        return next(new AppError("Invalid email or password", 401));
    }
   
    if(!user.correctPassword(password,user.password)) {
        next(new AppError("Invalid email or password", 401))
    }
  
    const token = signToken(user.id);
    res.status(200).json({
        status: "success",
        token
    })
})

exports.protect = catchAsync(async(req, res, next) =>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.token) {
        token = req.cookies.token;
    }
    if(!token) {
        return next(new AppError("You are not logged in", 401))
    }
    // xác thực token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if(!user) {
        return next(new AppError("User no longer exists", 401))
    }
    if(user.changePasswordAfter(decoded.iat)) {
        return next(new AppError("User recently changed password,Please log gin again", 401))
    }
    req.user = user;
    next();
})
// phân quyền
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(new AppError("You do not have permission to perform this action", 403))
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError("No user found with that email", 404))
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Please click on the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and no changes will be made.`;
    try{
    await sendEmail({
        email: user.email,
        subject: "Password reset link",
        message
    })
    res.status(200).json({
        status: "success",
        message: "Reset password link sent to your email"
    })}catch(err){
        console.log('lỗi:',err);
        user.passwordResetToken = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("There was an error sending email. Please try again later.", 500))
        

    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
     .createHash('sha256')
     .update(req.params.token)
     .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiresAt: {$gt: Date.now()}
    });
    if(!user) {
        return next(new AppError("Invalid token or token has expired", 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    const token  = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    })
 
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.correctPassword(req.body.passwordConfirm, user.password))) {
        return next(new AppError("Current password is incorrect", 401))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user,201,res);
}
)