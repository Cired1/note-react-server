const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const { nextTick } = require("process");

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
    } else {
        res.status(500);
        throw new Error("Server error");
    }

})

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email })

    if (!user) {
        res.status(404);
        throw new Error("Email could not be sent");
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a> 
    `

    try {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: message
        })

        res.status(200).json({
            success: true,
            data: "Email sent"
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(500);
        throw new Error("Email could not be send")
    }


})

const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        res.status(400);
        throw new Error("Invalid Reset Token");
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
        success: true,
        data: "Password Reset Succes"
    })

})

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({
        success: true,
        token
    })
}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};