const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        // Get token from header
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized to access this route");
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Get user from token
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(404);
            throw new Error("Not user found with this id");
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized to access this route");
    }

})

module.exports = { protect };