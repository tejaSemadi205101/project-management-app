class ApiError extends Error {
    constructor(
        statusCode,
        message = 'Internal server error',
        errors = [],
        stack = ''
    ){
        super(message),
        this.statusCode = statusCode,
        this.errors = errors,
        this.data = null,
        this.succes = false,
        this.stack = stack

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}