const mongoose = require('mongoose')
const createError = require("http-errors")


const idValidation = (id) => {
    console.log(id)
    const idValidation = mongoose.Types.ObjectId.isValid(id)
    if (!idValidation){
      throw new createError(400, "Invalid ID")
    }
}

module.exports = idValidation

