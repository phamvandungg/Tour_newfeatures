class errTours extends Error {
    constructor(message,statusCode){
        // thường kế messages từ cha là err
        super(message);
        this.statusCode = statusCode;
        
        this.status = `${statusCode}`.startsWith('4')?'fail':'error';
        // sử dụng được
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor);
    }
}
module.exports = errTours;