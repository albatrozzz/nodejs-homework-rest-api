const express = require('express')
const {User, auth, update, emailValidation} = require('../../models/users')
const createError = require("http-errors")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
const path = require('path')
const fs = require("fs/promises")
const nodemailer = require('nodemailer')
const {v4} = require('uuid')


const {authenticate, upload, resize, avatarCheck} = require('../../middlewares')
const { HttpError } = require('http-errors')
const Mail = require('nodemailer/lib/mailer')

const router = express.Router()

const {SECRET_CODE, META_PASSWORD} = process.env
const domain = 'http://localhost:3000'

const nodemailerConfig = {
    host: "smtp.meta.ua",
    port: 465,
    secure: true,
    auth: {
        user: "pavlyuk.ds91@meta.ua",
        pass: META_PASSWORD
    }
}
const transporter = nodemailer.createTransport(nodemailerConfig)

router.post('/signup', async (req, res, next) => {
    try {
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
        const avatar = gravatar.url(email, {protocol: 'http'})
        const verificationToken = v4()
        const mail = {
            to: email,
            from: "pavlyuk.ds91@meta.ua",
            subject: "Подтверждение регистрации",
            html: `
                <p>Вы получили это письмо, потому что зарегистрировались на начем Чудо-сервисе</p>
                <a href="${domain}/users/verify/${verificationToken}">Для подтверждения почты перейдите по этой ссылке</a>`
        }
        
        try {
            await transporter.sendMail(mail)
        } catch (error) {
            throw new createError(500, "Ошибка отправки письма")
        }
        const newUser = await User.create({
            email, 
            password: hashPassword,
            avatarURL: avatar,
            verificationToken,
        })

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
        if (!user.verify){
            throw new createError(400, "Email not verificated")
        }
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


const avatarsDir = path.join(__dirname, "../../", "public", "avatars")


router.patch('/avatars', authenticate, upload.single("avatar"), avatarCheck, resize, async (req, res, next) => {
    const {_id} = req.user
    const {path: tempUpload, filename} = req.file
    try {
        const [extention] = filename.split(".").reverse()
        const newFileName = `${_id}.${extention}`
        const resultUpload = path.join(avatarsDir, newFileName)
        await fs.rename(tempUpload, resultUpload)
        const avatarURL = path.join(domain, "public", "avatars", newFileName)
        await User.findByIdAndUpdate(_id, {avatarURL})
        res.json({
            avatarURL
        })
    } catch (error) {
        next(error)
    }
})

router.get('/verify/:verificationToken', async (req, res, next) => {
    const {verificationToken} = req.params
    try {
        const user = await User.findOneAndUpdate(
            {verificationToken},
            {verify: true, verificationToken: null},
            {new: true}
        )
        if (!user) {
            throw new createError(404, "User not found")
        }
        res.json({message: "Verification successful"})
    } catch (error){
        next(error)
    }
})

router.post('/verify', async (req, res, next) => {
    const {email} = req.body
    if (email){
        throw new createError (400, "missing required field email")
    }
    const {error} = emailValidation.validate(email)
    if (error){
        throw new createError(400, error.message)
    }
    try {
        const user = await User.findOne({email})
        if (!user){
            throw new createError(404, 'Not found')
        }
        if (user.verify){
            throw new createError(400, "Verification has already been passed")
        }
        const mail = {
            to: email,
            from: "pavlyuk.ds91@meta.ua",
            subject: "Подтверждение регистрации",
            html: `
            <p>Вы получили это письмо, потому что зарегистрировались на начем Чудо-сервисе</p>
            <a href="${domain}/users/verify/${user.verificationToken}">Для подтверждения почты перейдите по этой ссылке</a>`
        }
        try {
            await transporter.sendMail(mail)
        } catch (error) {
            throw new createError(500, "Ошибка отправки письма")
        }
        res.json({message: "Verification email sent"})
    } catch (error) {
        next(createError)
    }
})


module.exports = router