const asyncHandler = require("express-async-handler");
const Note = require("../models/noteModel");

const getNotes = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const notes = await Note.find({ userId: id });
    res.status(200).json({
        success: true,
        data: notes
    });
})

const getNote = asyncHandler(async (req, res) => {
    const { noteId: id } = req.params;
    const note = await Note.findById(id);
    res.status(200).json({
        success: true,
        data: note
    });
})

const createNote = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const { id } = req.user;

    if (!title || !content) {
        res.status(400);
        throw new Error("Please add all text fields");
    }

    const note = await Note.create({
        title,
        content,
        userId: id
    })

    if (note) {
        res.status(200).json({
            success: true,
            message: "A new note has been created",
            data: note
        });
    } else {
        res.status(500);
        throw new Error("Server Error")
    }


})

const updateNote = asyncHandler(async (req, res) => {
    const { noteId: id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
        res.status(400);
        throw new Error("Note not found");
    }

    //Check for user
    if (!req.user) {
        res.status(401);
        throw new Error("User not found");
    }

    //Make sure the logged in user matches the note user
    if (note.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }

    const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
        success: true,
        message: "Note has been updated",
        data: updatedNote
    });
})

const deleteNote = asyncHandler(async (req, res) => {
    const { noteId: id } = req.params;

    const note = await Note.findById(id);

    if (!note) {
        res.status(400);
        throw new Error("Note not found");
    }

    //Check for user
    if (!req.user) {
        res.status(401);
        throw new Error("User not found");
    }

    //Make sure the logged in user matches the note user
    if (note.userId.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }

    await note.remove();

    res.status(200).json({
        success: true,
        message: "Note deleted",
        data: id
    });
})

module.exports = {
    getNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote
}