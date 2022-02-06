const express = require('express')
const {Contact, schemas} = require('../../models/contacts')
const createError = require("http-errors")
const {idValidation, authenticate} = require('../../middlewares')

const router = express.Router()


router.get('/', authenticate,  async (req, res, next) => {
  try {
    const {page = 1, limit = 10, favorite} = req.query
    const pageNumber = Number(page)
    const limitValue = Number(limit)
    if (!pageNumber || !limitValue){
      throw new createError(400, "Bad request")
    }
    const skip = (page - 1) * limit
    if (skip < 0){
      throw new createError(404, "Not found")
    }
    const {_id} = req.user
    let searchQuery = {
      owner: _id
    }
    if (favorite){
      searchQuery = {
        owner: _id,
        favorite
      }
    }
    const contactsList = await Contact.find(searchQuery,
      "-createdAt -updatedAt",
      {skip, limit: +limit}
      ).populate("owner", "email")
    res.json({contactsList})
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', authenticate, async (req, res, next) => {
  try {

    idValidation(req.params.contactId)

    const [contact] = await Contact.find({
      _id: req.params.contactId,
      owner: req.user._id
    })
    if (!contact){
      throw new createError(404, "Not found")
    }
    res.json({ contact})
  } catch (error) {
    next(error)
  }
})

router.post('/', authenticate, async (req, res, next) => {
  try {
    const {error} = schemas.add.validate(req.body);
    if(error){
        throw new createError(400, error.message)
    }
    const data = {...req.body, owner: req.user._id}
    const newContact = await Contact.create(data)
    res.status(201).json({ newContact })
  } catch (error) {
    if(error.message.includes("is required")){
      error.message = "missing required name field"
    }
    next(error)
  }
})

router.delete('/:contactId', authenticate, async (req, res, next) => {
  try {
    idValidation(req.params.contactId)
    const response = await Contact.findOneAndDelete({
      _id: req.params.contactId,
      owner: req.user._id
    })
    if (!response){
      throw new createError(404, "Not found")
    }
    res.json({ message: 'contact deleted' })
  } catch (error) {
    next(error)
  }
})

router.put('/:contactId', authenticate, async (req, res, next) => {
  try {
    const {error} = schemas.update.validate(req.body);
    if(error){
        throw new createError(400, error.message)
    }
    idValidation(req.params.contactId)
    const updatedContact = await Contact.findOneAndUpdate({
      _id: req.params.contactId,
      owner: req.user._id
    }, req.body, {new: true})
    if (!updatedContact){
      throw new createError(404, "Not found")
    }
    res.json({ updatedContact })
  } catch (error) {
    next(error)
  }
})

router.patch('/:contactId/favorite', authenticate, async (req, res, next) => {
  try {
    const {error} = schemas.favorite.validate(req.body)
    if(error){
      throw new createError(400, error.message)
    }
    idValidation(req.params.contactId)
    const result = await Contact.findOneAndUpdate({
      _id: req.params.contactId,
      owner: req.user._id
    }, req.body, {new: true})
    if(!result){
      throw new createError(404, "Not found")
    }
    res.json({result})
  } catch (error){
    if (error.message.includes("is required")){
      error.message = "missing field favorite"
    }
    next (error)
  }
})

module.exports = router
