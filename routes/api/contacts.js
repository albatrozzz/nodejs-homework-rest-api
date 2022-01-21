const express = require('express')
const contactsAPI = require('../../models/contacts.js')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const contactsList = await contactsAPI.listContacts()
    res.json({contactsList})
  } catch (error) {
    console.log(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
  console.log(req.params.contactId)
  try {
    const contact = await contactsAPI.getContactById(req.params.contactId)
    res.json({ contact})
  } catch (error) {
    console.log(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const newContact = await contactsAPI.addContact(req.body)
    res.status(201).json({ newContact })
  } catch (error) {
    console.log(error)
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const response = await contactsAPI.removeContact(req.params.contactId)
    res.json({ message: 'contact deleted' })
  } catch (error) {
    console.log(error)
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const updatedContact = await contactsAPI.updateContact(req.params.contactId, req.body)
    res.json({ updatedContact })
  } catch (error) {
    console.log(error);
  }
})

module.exports = router
