const asyncHandler = require("express-async-handler");

const getNotes = asyncHandler(async (req, res) => {
    res.send("Ruta privada");
})

module.exports = {
    getNotes
}