
const Jimp = require('jimp')

    const resize = (req, res, next) => {

        Jimp.read(req.file.path, (error, file) => {
            if (error){
            throw new createError(400, error.message)
            }
           file.resize(250,250).write(req.file.path)
           next()
        })
    }



    module.exports = resize