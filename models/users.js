const {Schema, model} = require("mongoose")
const Joi = require("joi")

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = Schema({
    password: {
        type: String,
        required: [true, 'Password is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
      },
      subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
      },
      token: {
        type: String,
        default: null,
      },
}, {versionKey: false, timestamps: true})

const User = model("user", userSchema)

const registerJoiSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
})

const updateSubscriptionJoiSchema = Joi.object({
  subscription: Joi.string().required()
}).or("starter", "pro", "business")

module.exports = {
    User,
    auth: registerJoiSchema,
    update: updateSubscriptionJoiSchema,
}