const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const userSchemas = require('../Schemas/userSchema')
require('dotenv').config()
const User = new mongoose.model('User', userSchemas)
const jwt = require('jsonwebtoken')
const verifyJWT = require('../verifyJWT')

router.get('/', async (req, res) => {
    User.find({}, (error, result) => {
        if (error) {
            res.status(501).send({ message: "server side Error" })
        }
        else {
            res.status(200).send(result)
        }
    })
})
router.get('/:email',  (req, res) => {
    const email = req.params.email
    User.findOne({ email: email }, (error, result) => {
        if (error) {
            res.status(501).send({ message: "server Side Problem" })
        }
        else {
            res.status(200).send(result)
        }
    })
})
router.put('/:email', async (req, res) => {
    const email = req.params.email
    const newUser = new User(req.body)
    User.findOne({ email: email }, (err, data) => {
        if (data) {
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN)
            res.send({ message: "Data Alrady Available", token })
        }
        else {
            newUser.save((err) => {
                if (err) {
                    res.status(500).json({ error: "Server Side Error", err })
                }
                else {
                    const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN)
                    res.status(200).json({ message: "Data Inserted", token })
                }
            })
        }
    })
})
router.put('/addAdmin/:email', verifyJWT, (req, res) => {
    const email = req.params.email
    const userEmail = req.decoded
    User.findOne({ email: userEmail }, (error, data) => {
        if (data?.role === 'admin') {
            User.updateOne({ email: email }, {
                $set: {
                    role: "admin"
                }
            }, (err) => {
                if (err) {
                    res.status(500).json({ error: "Server Side Error" })
                }
                else {
                    res.status(200).json({ message: "Data Inserted" })
                }
            })
        }
        else {
            res.status(200).json({ message: "You Are Not user" })
        }
    })

})
router.put('/removeAdmin/:email', verifyJWT, (req, res) => {
    const email = req.params.email
    const userEmail = req.decoded
    User.findOne({ email: userEmail }, (error, data) => {
        if (data?.role === 'admin') {
            User.updateOne({ email: email }, {
                $set: {
                    role: "am-public"
                }
            }, (err) => {
                if (err) {
                    res.status(500).json({ error: "Server Side Error" })
                }
                else {
                    res.status(200).json({ message: "Data Inserted" })
                }
            })
        }
        else {
            res.status(200).json({ message: "You Are Not user" })
        }
    })
})
module.exports = router