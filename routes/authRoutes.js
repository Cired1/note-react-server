const express = require("express");
const router = express.Router();
const {
    register,
    login,
    resetPassword,
    forgotPassword
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;