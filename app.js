const express = require('express');
const app = express();
const morgan = require('morgan');
const  helmet = require('helmet');
const  mongoSantixe = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const tourRouter = require("./routes/tourRouter");
const userRouter = require("./routes/userRouter");
const reviewRouter = require("./routes/reviewRouter");
const Apperr = require("./utils/errTours");
const  rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const errControllers = require("./controllers/errControllers");
if(process.env.NODE_ENV !== "development") {
    app.use(morgan('dev'));
}
// tạo các render gọi ra giao diện
app.set('view engine', 'pug');
// đường dẫn tới trang chủ trong folder views
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname,'public')));



app.use(express.json({limit: '10kb' })); 
app.use(cookieParser());

// hạn chế lỗ hỏng bảo mật
app.use(helmet());
// giới hạn truy cập trong 1 khoản thời gian
const rate = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
})

app.use(mongoSantixe());
app.use(xss());

app.use(hpp({
    whitelist: ['duration','ratingsQuantity','maxGroupSize','difficulty','price'] 
}));
app.use('/api',rate);
app.use((req, res, next) => {
    console.log("Chào mừng đến với midlewe");
    next();
})
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
   
})

app.get('/',(req,res)=>{
    res.status(200).render('base')
})


app.use("/api/v1/tours",tourRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/reviews",reviewRouter);


// loại bỏ các đường api ko đúng và báo lỗi
app.all("*",(req,res,next) => {
    next(new Apperr(`Khong nhận được đừng dẫn ${req.originalUrl}`,404));
    })

app.use(errControllers)


module.exports = app;