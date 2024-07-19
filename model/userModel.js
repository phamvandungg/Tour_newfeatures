const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Không có name"]
      
    },
    email:{
        type:String,
        required:[true,"Không có email"],
        unique:true,
        lowercase:true,
        maxLenght:[40,"Dữ liệu quá 40 từ"],
        minLength:[10,"Dữ liệu dưới 10 từ"],
        validate:[validator.isEmail,'email đã tồn tại']
    },
    photo:String,
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,"Không có password"],
        minLength:[8,"Dữ liệu dưới 8 từ"]
    },
    passwordConfirm:{
        type:String,
        validate:{
            validator:function(el){
                return el === this.password;
            },
            message:"Mật khẩu không trùng khớp"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpiresAt: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
   
}   
)
// mã hóa mật khẩu trước khi đưa vào
userSchema.pre('save', async function(next){
   if(!this.isModified('password')) return next();
   
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}})
    next();
})
//
userSchema.pre('save', async function(next){
    if(!this.isModified('password') || this.password === this.passwordConfirm) return next();
    this.passwordChangedAt = Date.now() -1000;
    next();
 
})

// so sánh
userSchema.methods.correctPassword = async function(canPassword,userPassword){
    return await bcrypt.compare(canPassword,userPassword);
}

// kiểm tra đã thây đổi mật khẩu hay chưa ^^ ko được dùng async cho hàm này
userSchema.methods.changePasswordAfter =  function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changeTimestamp;
    } 
    return false;
};
// tạo token gởi về cho req để thay đổi mk
userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
    console.log({resetToken},this.passwordResetExpiresAt);
    return resetToken;
}

const User = mongoose.model("User",userSchema);

module.exports = User;