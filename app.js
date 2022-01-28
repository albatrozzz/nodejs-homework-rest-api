const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const contactsRouter = require('./routes/api/contacts')

const app = express()
// Login: DmitriyP
//Password: xrCTJ3UQEZXi81S7
// mongodb+srv://DmitriyP:xrCTJ3UQEZXi81S7@cluster0.g4rar.mongodb.net/db-contacts?retryWrites=true&w=majority

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  const {status = 500, message = "Server error"} = err;
  res.status(status).json({ message })
})

module.exports = app
