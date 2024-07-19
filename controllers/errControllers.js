const AppError = require('./../utils/errTours');

const handleDBError = (err) => {
    const message = `Không có ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const message = 'Trùng lặp giá trị';
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Lỗi xác thực: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error('ERROR 💥', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

const handleJsonwebTokenErrorDB = (err) => {
    const message = 'Invalid token. Please log in again.';
    return new AppError(message, 401);
};
const handleTokenExpiredErrorDB = (err) => {
    const message = 'Token has expired. Please log in again.';
    return new AppError(message, 401);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err };
    if (err.message){ 
        error.message = err.message;
        error.stack = err.stack;
    } // Giữ nguyên thông báo lỗi gốc
    console.log('Current Environment:', process.env.NODE_ENV); 
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'CastError') error = handleDBError(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonwebTokenError') error = handleJsonwebTokenErrorDB(error);
        if(error.name === 'TokenExpiredError') error = handleTokenExpiredErrorDB(error);
        sendErrorProd(error, res);
        
    }
};
