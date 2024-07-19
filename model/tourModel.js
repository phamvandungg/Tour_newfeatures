const mongoose = require('mongoose');
const slugify = require('slugify');
const  User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name:{
        type: 'string',
        required:[true,'Không có name'],
        unique:true,
        trim:true,
        maxLenght:[40,"Dữ liệu quá 40 từ"],
        minLength:[10,"Dữ liệu dưới 10 từ"]
    },
    slug:String,
    duration :{
        type:Number,
       required:[true,'Không có durations']
    },
    maxGroupSize:{
        type:Number,
       required:[true,'Không có maxGroupSize']
    },
    difficulty:{
        type:String,
        required:[true,'Không có difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Không hợp lệ'
        }
    },
    // xếp hạng mặt định là 4.5
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'nhỏ hơn 1 ròi'],
        max:[5,'lớn hơn 5 ròi'],
        set: val => Math.round(val *10 ) / 10
       
    },
    ratingsQuantity:{
        type:Number,
        default:0,
    },
   
    price: {
        type:Number,
        required:[true,'Không có giá']
    },
    // ràng buộc giảm giá nhỏ hơn giá gốc
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return val < this.price;
            },
            message:'Giá giảm phải nhỏ hơn giá gốc'
        }
    }
  
    ,priceDiscount:  String,
    summary:{
        type:String,
        required:[true,'Không có summary'],
        trim:true
    },
    description: {
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'Không có imageCover']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false,
    },
    startLocation:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    location:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            address:String,
            description:String,
            day:Number
        }
    ],
    guides:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
           
        }
    ]
    
    
},

{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
}
)
// chỉ mục giúp truy vấn nhanh hơn
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere'})
//tạp ra trường tạm thời
tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7;
})
// trường ảo có thể tự cập nhật bằng pluputo
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField: 'tour',
    localField: '_id'
})
// gán trường trước khi lưu
tourSchema.pre('save',function(next){
    this.slug = slugify(this.name,{lower:true});
    next();
})
// kiểm tra xem id có trùng với id user chưa
tourSchema.pre('save',async function(next){
   const guidesPromise = this.guides.map(async id => await User.findById(id))
   this.guides = await Promise.all(guidesPromise);
   next();
})
// lấy dữ liệu nào có secretTour:false
tourSchema.pre(/^find/,function(next){
    this.find({secretTour:{$ne:true}})
    next();
})
//thực hiện khi dùng find
tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    })
    next();
})
//  hàm match lấy các dư liệu secretTour:false
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     next();
// })



const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;