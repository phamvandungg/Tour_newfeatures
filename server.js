const app = require('./app')
const dotenv = require('dotenv');
dotenv.config({path: "./config.env"})
const mongoose = require('mongoose');

const DB = process.env.DATABASE.replace('<PASSWORD>', encodeURIComponent(process.env.DATABASE_PASSWORD))
mongoose.connect(DB,{
}).then(()=> {
    console.log('Kết nối mongoose thành công');
})

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`Kết nối server ${port} `);
});


// process.on('unhandledRejection', (err) => {
//     console.log(err.name,err.message);
//     console.log('lỗi kết nối server');
//     server.close(() => {
//         process.exit(1);
//     })
// })
// process.on('uncaughtException', (err) =>{
//     console.log(err.name,err.message);
//     process.exit(1);
// })
