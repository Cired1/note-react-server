const express = require("express");
const router = express.Router();
const {
    getNotes,
    createNote,
    updateNote,
    deleteNote
} = require("../controllers/noteController");

const { protect } = require("../middleware/authMiddleware")

router.get("/", protect, getNotes);
router.post("/", protect, createNote);
router.put("/:noteId", protect, updateNote);
router.delete("/:noteId", protect, deleteNote);

module.exports = router;