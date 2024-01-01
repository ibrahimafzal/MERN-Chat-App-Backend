const User = require("../models/userModel")
const expressAsyncHandler = require("express-async-handler")
const generateToken = require("../config/generateToken")


// Login
const loginController = expressAsyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })

        if (user && (await user.matchPassword(password))) {
            res.status(201).json({
                _id: user?._id,
                name: user?.name,
                email: user?.email,
                mobile: user?.mobile,
                pic: user?.pic,
                token: generateToken(user?._id)
            })
        }
    } catch (error) {
        console.log(error)
        throw new Error("Invalid Email or Password ")
    }
})


// Register
const registerController = expressAsyncHandler(async (req, res) => {
    try {
        const { name, email, mobile, password, pic } = req.body

        if (!name || !email || !mobile || !password) {
            res.sendStatus(400)
            throw new Error("All necessary inputs fields have not been filled")
        }

        // check user is already exist or not
        const existUser = await User.findOne({ email })
        if (existUser) {
            throw new Error("Email already Exists")
        }

        // check mobile number is already used or not
        const existMobileNumber = await User.findOne({ mobile })
        if (existMobileNumber) {
            res.sendStatus(406)
            throw new Error("This Mobile number already used.");
        }

        // create user
        const createdUser = await User.create({ name, email, mobile, password, pic })
        if (createdUser) {
            res.status(201).json({
                _id: createdUser?._id,
                name: createdUser?.name,
                email: createdUser?.email,
                mobile: createdUser?.mobile,
                pic: createdUser?.pic,
                token: generateToken(createdUser?._id)
            })
        } else {
            res.status(400)
            throw new Error("Registration Error")
        }

    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
})

const fetchAllUsers = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } }
            ]
        } : {}

    const users = await User.find(keyword).find({
        _id: { $ne: req.user._id }
    })

    res.send(users)
})


module.exports = { loginController, registerController, fetchAllUsers }