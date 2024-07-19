const dotenv = require('dotenv');
dotenv.config({path: "./config.env"})
const mongoose = require('mongoose');
const fs =  require('fs');
const Tour = require('./../../model/tourModel')
const Review = require('./../../model/reviewModel')
const User = require('./../../model/userModel')

const DB = process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD))
mongoose.connect(DB,{
   
}).then(()=> {
    console.log('Kết nối mongoose thành công');
}).catch((err) =>{
    console.log('Kết nối mongoose thất bại');
    console.log(err);
})
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf8'))

const GetTours = async (req, res) => {
    try {
        await Tour.create(tours);
        await User.create(users);
        await Review.create(reviews);
        console.log("Import thành công");
       
        }
        catch (err) {
            if (err.code === 11000) {
                console.error('Lỗi trùng lặp khóa:', err.keyValue);
            } else {
                console.error('Lỗi khác:', err);
            }
        }
    process.exit();
}

const DeleteTours = async (req, res) => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Xóa thành công");
       
        }
    catch(err) {
       console.log(err);
    }
    process.exit();
}

if(process.argv[2] === '--import'){
    GetTours();
}else if(process.argv[2] === '--delete'){
    DeleteTours();
}

console.log(process.argv);