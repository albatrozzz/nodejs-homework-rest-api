const express = require('express')
const contactsAPI = require('../../models/contacts.js')
const createError = require("http-errors")

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const contactsList = await contactsAPI.listContacts()
    res.json({contactsList})
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
  console.log(req.params.contactId)
  try {
    const contact = await contactsAPI.getContactById(req.params.contactId)
    if (!contact){
      throw new createError(404, "Not found")
    }
    res.json({ contact})
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.phone){
      throw new createError(400, "missing required name field")
    }
    const newContact = await contactsAPI.addContact(req.body)
    res.status(201).json({ newContact })
  } catch (error) {
    next(error)
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const response = await contactsAPI.removeContact(req.params.contactId)
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
    const updatedContact = await contactsAPI.updateContact(req.params.contactId, req.body)
    console.log(updatedContact)
    if (!updatedContact){
      throw new createError(404, "Not found")
    }
    res.json({ updatedContact })
  } catch (error) {
    next(error)
  }
})

module.exports = router
