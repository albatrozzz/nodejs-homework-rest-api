const fs = require('fs/promises')
const path = require("path")
const { v4 } = require("uuid")

const contactsPath = path.join(__dirname, 'contacts.json')

const listContacts = async () => {
  const contacts = await fs.readFile(contactsPath)
  const contatcsList = JSON.parse(contacts)
  return contatcsList
}

const getContactById = async (contactId) => {
  const contactsList = await listContacts()
  const contact = contactsList.find(item => item.id === contactId)
  if (!contact){
      return null
  }
  return contact
}

const removeContact = async (contactId) => {
  const contactsList = await listContacts()
  const idx = contactsList.findIndex(item => item.id === contactId)
  if (idx === -1){
      return null
  }
  const deleteContact = contactsList.splice(idx, 1)
  await fs.writeFile(contactsPath, JSON.stringify(contactsList,null,4))
  return deleteContact
}

const addContact = async ({name, email, phone}) => {
  const contactsList = await listContacts()
  const idx = contactsList.findIndex(item => item.email === email)
  if (idx !== -1){
      return null
  }
  const newUser = {
      "id": v4(),
      name,
      email,
      phone
  }
  contactsList.push(newUser)
  await fs.writeFile(contactsPath, JSON.stringify(contactsList,null,4))
  return newUser
}

const updateContact = async (contactId, body) => {
  let contactData = {}
  try{
    const [contact] = await removeContact(contactId)
    contactData = {...contact}
  } catch (error){
    return null
  }
  const newContact = {...contactData, ...body}
  const contactsList = await listContacts()
  contactsList.push(newContact)
  await fs.writeFile(contactsPath, JSON.stringify(contactsList,null,4))
  return newContact
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
