const expressAsyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");

const allMessages = expressAsyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email mobile pic")
            .populate("chat")
        res.json(messages)
    } catch (error) {
        res.sendStatus(400)
        console.log(error)
        throw new Error(error.message)
    }
})

const deleteMessage = expressAsyncHandler(async (req, res) => {
    const msgId = req.params.id
    try {
        let message = await Message.findByIdAndDelete(msgId);

        if (!message) return res.status(404).json({ message: 'No message found' });
        // Decrement the count of messages in the chat model
        await Chat.findOneAndUpdate({ _id: message.chat }, { $inc: { totalMsgCount: -1 } }).
            then((doc) => {
                if (!doc) return res.status(500).json('Chat not found')
            })

        res.json({ message: 'Deleted successfully!' })
    } catch (error) {
        res.sendStatus(400)
        throw new Error(error.message)
    }
})

const sendMessages = expressAsyncHandler(async (req, res) => {
    const { content, chatId } = req.body

    if (!content || !chatId) {
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    try {
        var message = await Message.create(newMessage)

        message = await message.populate("sender", "name email mobile pic")
        message = await message.populate("chat")
        message = await User.populate(message, {
            path: "chat.users",
            select: "name email mobile pic"
        })

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        res.json(message)

    } catch (error) {
        res.sendStatus(400)
        throw new Error(error.message)
    }
})

module.exports = { allMessages, sendMessages, deleteMessage }