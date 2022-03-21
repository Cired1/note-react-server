const mongoose = require("mongoose");

const noteSchema = mongoose.Schema({
    title: {
        type: String,
        maxlength: 100,
        required: [true, "Please add a title"]
    },
    content: {
        type: String,
        required: [true, "Note is empty"],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
}, {
    timestamps: true,
})

module.exports = mongoose.model("Note", noteSchema);