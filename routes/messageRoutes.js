const { protect } = require("../middleware/authMiddleware")
const express = require("express")
const { allMessages, sendMessages, deleteMessage } = require("../controllers/messageController")
const router = express.Router()

router.delete("/deleteMessage/:id", protect, deleteMessage)
router.post("/", protect, sendMessages)
router.get("/:chatId", protect, allMessages)

module.exports = router
