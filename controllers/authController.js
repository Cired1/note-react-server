const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");

const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    //Check if all fields have data
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("Please add all fields");
    }

    if (username.length < 5 || username.length > 20) {
        res.status(400);
        throw new Error("Username should be between 5-20 characters");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password should be at least 6 characters");
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

    if (!email) {
        res.status(400);
        throw new Error("Please provide an email");
    }

    const user = await User.findOne({ email })

    if (!user) {
        res.status(404);
        throw new Error("Email could not be sent");
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

    const message = `
        <h1>You have requested a password reset</h1>
        <p>Please go to this <a href=${resetUrl} clicktracking=off>Link</a> to reset your password</p>
    `

    try {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: message
        })

        res.status(200).json({
            success: true,
            message: "We have sent an email with the instruction for recover your account"
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
    const { password: newPassword } = req.body;

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        res.status(400);
        throw new Error("Invalid Reset Token");
    }

    if (!newPassword) {
        res.status(400);
        throw new Error("Provide a password");
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
        success: true,
        message: "Password has been changed succesfully"
    })

})

const sendToken = (user, statusCode, res) => {
    const { username } = user;
    const token = user.getSignedToken();
    res.status(statusCode).json({
        success: true,
        message: `Welcome ${username}`,
        token
    })
}

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};