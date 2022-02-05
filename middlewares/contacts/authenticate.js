const createError = require("http-errors")
const jwt = require("jsonwebtoken")

const {User} = require('../../models/users')

const {SECRET_CODE} = process.env

const authenticate = async (req, res, next) => {
    try {
        const {authorization = ''} = req.headers
        const [bearer, token] = authorization.split(" ")
        if (bearer !== "Bearer"){
            throw new createError(401, "Not authorized")
        }
        const {id} = jwt.verify(token, SECRET_CODE)
        const user = await User.findById(id)
        if(!user || !user.token){
            throw new createError(401, "Not authorized")
        }
        req.user = user
        next()
    } catch(error){
        next(error)
    }
}


module.exports = authenticate