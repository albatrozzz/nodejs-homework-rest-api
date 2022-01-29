const express = require('express')
const {Contact, schemas} = require('../../models/contacts.js')
const createError = require("http-errors")
const Joi = require('joi')

const router = express.Router()


router.get('/', async (req, res, next) => {
  try {
    const contactsList = await Contact.find({})
    res.json({contactsList})
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.contactId)
    if (!contact){
      throw new createError(404, "Not found")
    }
    res.json({ contact})
  } catch (error) {
    if(error.message.includes("Cast to ObjectId failed")){
      error.status = 404;
    }
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.phone){
      throw new createError(400, "missing required name field")
    }
    const {error} = schemas.add.validate(req.body);
    if(error){
        throw new createError(400, error.message)
    }
    const newContact = await Contact.create(req.body)
    res.status(201).json({ newContact })
  } catch (error) {
    if(error.message.includes("validation failed")){
      error.status = 400;
    }
    next(error)
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const response = await Contact.findByIdAndDelete(req.params.contactId)
    if (!response){
      throw new createError(404, "Not found")
    }
    res.json({ message: 'contact deleted' })
  } catch (error) {
    next(error)
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    if (!req.body.name && !req.body.email && !req.body.phone){
      throw new createError(400, "missing fields")
    }
    const {error} = schemas.add.validate(req.body);
    if(error){
        throw new createError(400, error.message)
    }
    const updatedContact = await Contact.findByIdAndUpdate(req.params.contactId, req.body, {new: true})
    if (!updatedContact){
      throw new createError(404, "Not found")
    }
    res.json({ updatedContact })
  } catch (error) {
    next(error)
  }
})

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    if(!req.body.favorite){
      throw new createError(400, "missing field favorite")
    }
    const {error} = schemas.favorite.validate(req.body)
    if(error){
      throw new createError(400, error.message)
    }
    const result = await Contact.findByIdAndUpdate(req.params.contactId, req.body, {new: true})
    if(!result){
      throw new createError(404, "Not found")
    }
    res.json({result})
  } catch (error){
    next (error)
  }
})

module.exports = router
