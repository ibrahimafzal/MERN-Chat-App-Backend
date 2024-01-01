const { protect } = require("../middleware/authMiddleware")
const {
    accessChat,
    fetchChats,
    createGroupChat,
    groupExit,
    fetchGroups,
    addToGroup,
    renameGroup,
    deleteChat
} = require("../controllers/chatController")

const express = require("express")
const router = express.Router()

router.post("/", protect, accessChat)
router.get("/", protect, fetchChats)
router.post("/createGroup", protect, createGroupChat)
router.get("/fetchGroups", protect, fetchGroups)
router.put("/groupExit", protect, groupExit)
router.put("/rename", protect, renameGroup)
router.put("/addToGroup", protect, addToGroup)
router.delete("/deleteChat/:id", protect, deleteChat)

module.exports = router
