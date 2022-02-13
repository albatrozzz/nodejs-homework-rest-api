const idValidation = require('./idValidation')
const authenticate = require('./authenticate')
const upload = require('./upload')
const resize = require('./resize')
const avatarCheck = require('./avatarCheck')

module.exports = {
    idValidation,
    authenticate,
    upload,
    resize,
    avatarCheck
}