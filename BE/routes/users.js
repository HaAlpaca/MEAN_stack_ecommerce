const { User } = require('../models/user')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
// get 
router.get('/', async (req, res) => {
    const userList = await User.find()
    // .select('-passwordHash')
    if (!userList) return res.status(500).json({ success: false })
    return res.status(200).send(userList)
})

// get single user
router.get("/:id", async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
        res.status(500).json({
            message: "The user with id was not found.",
        });
    }
    res.status(200).send(user);
});

// register user
router.post("/register", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
    });
    user = await user.save();
    if (!user)
        return res.status(404).send("the user can't not be created!");
    res.send(user);
});

// login with token
router.post('/login', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    })
    if (!req.body.password) return res.status(400).send("password not found")
    if (!user) return res.status(400).send("User not found!")

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const secret = process.env.secret
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret, { expiresIn: '1d' })
        return res.status(200).send({
            user: user.email,
            token: token
        })
    } else {
        return res.status(400).send("Wrong Password")
    }
})

// update

router.put(`/:id`, async (req, res) => {
    let newPassword
    // check product id
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send("Wrong Product Id Format")
    } else {
        const userExist = await User.findById(req.params.id)
        if (!userExist) return res.status(400).send('Invalid User')
            if(req.body.password) {
                newPassword = bcrypt.hashSync(req.body.password, 10)
            } else {
                newPassword = userExist.passwordHash
            }
    }


    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country
        },
        { new: true }
    )
    if (!user) return res.status(400).send('User can not be updated')
    res.send(user)
})

// delete

router.delete("/:id", (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: "the user is deleted!",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "user not found",
                });
            }
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                error: err,
            });
        });
});

// counting user 
router.get(`/get/count`, async (req, res) => {
    const countUser = await User.countDocuments({})
    if (!countUser) return res.status(500).send({ success: false })

    res.status(200).send({
        countUser: countUser
    })
})

module.exports = router