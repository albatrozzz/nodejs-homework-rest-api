
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
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, {versionKey: false, timestamps: true})

const Contact = model("contact", contactSchema)

const joiContactSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email(),
  phone: Joi.string().min(6).max(12)
})

const joiContactUpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required()
})

module.exports = {
  Contact,
  schemas: {
    add: joiContactSchema,
    favorite: joiContactUpdateFavoriteSchema
  }
}
