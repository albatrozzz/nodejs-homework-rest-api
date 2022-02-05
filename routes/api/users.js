const express = require('express')
const {User, auth, update} = require('../../models/users')
const createError = require("http-errors")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const {authenticate} = require('../../middlewares')

const router = express.Router()

const {SECRET_CODE} = process.env

router.post('/signup', async (req, res, next) => {
    try {
        console.log(req.body)
        const {error} = auth.validate(req.body)
        if(error){
            throw new createError(400, error.message)
        }
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(user){
            throw new createError(409, "Email in use")
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        const newUser = await User.create({
            email, 
            password: hashPassword,
        })
        console.log(newUser)
        res.status(201).json({ user: {
            email,
            subscription: newUser.subscription
        }})
    } catch (error){
        next(error)
    }
})


router.post('/login', async (req, res, next) => {
    try {
        const {error} = auth.validate(req.body)
        if(error){
            throw new createError(400, error.message)
        }
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            throw new createError(401, "Email or password is wrong")
        }
        const comparePassword = await bcrypt.compare(password, user.password)
        if(!comparePassword){
            throw new createError(401, "Email or password is wrong")
        }
        const payload = {
            id: user._id
        }
        const token = jwt.sign(payload, SECRET_CODE, {expiresIn: "4h"})
        await User.findByIdAndUpdate(user._id, {token})
        res.json({
            token,
            user: {
                email,
                subscription: user.subscription
            }
        })
    } catch (error){
        next(error)
    }
})

router.get('/logout', authenticate, async(req, res, next) => {
    const {_id} = req.user
    await User.findByIdAndUpdate(_id, { token: "" })
    res.status(204)
})

router.get('/current', authenticate, async(req, res, next) => {
    res.json({
        email: req.user.email, 
        subscription: req.user.subscription
    })
})


router.patch('/', authenticate, async (req, res, next) => {
    try {
        const {error} = update.validate(req.body)
        if(error){
            throw new createError(400, error.message)
          }
        const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {new: true})
        res.json({
            email: updatedUser.email,
            subscription: updatedUser.subscription
        })
    } catch (error) {
        next(error)
    }
})


module.exports = router