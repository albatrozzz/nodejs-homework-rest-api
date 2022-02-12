
const {Schema, model} = require("mongoose")
const Joi = require("joi")

const contactSchema = Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    unique: true
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  }
}, {versionKey: false, timestamps: true})

const Contact = model("contact", contactSchema)

const joiAddContactSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).max(12).required()
})

const joiUpdateContactSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  phone: Joi.string().min(6).max(12)
}).or('name', 'email', 'phone')

const joiContactUpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required()
})

module.exports = {
  Contact,
  schemas: {
    add: joiAddContactSchema,
    update: joiUpdateContactSchema,
    favorite: joiContactUpdateFavoriteSchema
  }
}
