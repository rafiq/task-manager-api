const express = require("express")
const multer = require("multer")
const sharp = require("sharp")
const User = require("../models/user")
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendGoodbyeEmail } = require("../emails/account")
const router = new express.Router()

router.post("/users", async (req,res) => {
    const user = new User(req.body);
    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email,user.name)
        res.status(201)
        res.send({user, token})
    } catch (error) {
        res.status(400)
        res.send(error)
    }
})

router.post("/users/login", async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (error) {
        res.status(400)
        res.send()
    }
})

router.post("/users/logout", auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (error) {
        res.status(500)
        res.send()
    }
})

router.post("/users/logoutAll", auth, async (req,res) => {
    try {
        req.user.tokens = [];
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500)
        res.send()
    }
})

router.get("/users/me", auth, async (req,res) => {
    res.send(req.user)
})

router.get("/users", (req,res) => {
    User.find({}).then(users => {
        res.send(users);
    }).catch(e => {
        res.status(500)
        res.send(e);
    })
})

router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        res.status(400)
        return res.send({ "error": "Invalid updates" })
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400)
        res.send(error)
    }
})

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500)
        res.send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpeg|png|jpg)$/)) {
            return cb(new Error("Please upload images only"))
        }

        cb(undefined, true);
    }
})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next) => {
    res.status(400)
    res.send({ error: error.message})
})

router.delete("/users/me/avatar", auth, async (req,res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400)
    res.send({ error: error.message })
})

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-Type", "image/png")
        res.send(user.avatar)
    } catch (error) {
        res.status(400)
        res.send()
    }
})

module.exports = router