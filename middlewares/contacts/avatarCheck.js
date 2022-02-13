const createError = require('http-errors')

const avatarCheck = (req, res, next) => {
    if(!req.file){
        throw new createError(400, "Only image can be uploaded")
    }
    next()
}

module.exports = avatarCheck