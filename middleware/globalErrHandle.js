const globalErrHandler = (err, req, res, next) => {
    //stack
    //message
    //status
    const stack = err.stack
    const message = err.message
    const status = err.status ? errr.status : "failed";
    const statusCode = err?.statusCode ? err.statusCode :500;
    //send response
    res.status(statusCode).json({
        message,
        status,
        stack,
    });
};

module.exports = globalErrHandler