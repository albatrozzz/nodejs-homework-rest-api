const multer = require("multer")
const path = require('path')

const tmpDir = path.join(__dirname, "../../", "tmp")

const multerConfig = multer.diskStorage({
    destination: tmpDir,
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.includes('image')){
        cb(null, false)
        return
    }
    cb(null, true)
}

const upload = multer({
    storage: multerConfig,
    fileFilter
})


module.exports = upload