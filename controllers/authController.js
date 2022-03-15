const asyncHandler = require("express-async-handler");
const User = require("../models/userModel")

const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    //Check if all fields have data
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
    }

    //Check if user exists
    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400);
        console.log(userExists);
        throw new Error("User already exists");
    }

    //Check if email exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        res.status(400);
        throw new Error("Email already registered");
    }

    const user = await User.create({
        username, email, password
    })

    if (user) {
        sendToken(user, 201, res);
        /* res.status(201).json({
            success: true,
            user
        }) */
    } else {
        res.status(500);
        throw new Error("Server error");
    }
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide an email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid credentials");
    }

    if (user) {
        sendToken(user, 200, res);
        /* res.status(200).json({
            success: true,
            token: "asdsdw2"
        }) */
    } else {
        res.status(500);
        throw new Error("Server error");
    }

})

const forgotPassword = asyncHandler(async (req, res) => {

})

const resetPassword = asyncHandler(async (req, res) => {

})

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({ success: true, token })
}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};