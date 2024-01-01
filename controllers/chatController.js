const expressAsyncHandler = require("express-async-handler")
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        return res.sendStatus(400)
    }

    try {
        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: userId } } }
            ]
        }).populate("users", "-password").populate("latestMessage")

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name email mobile pic"
        })

        if (isChat.length > 0) {
            res.status(200).json(isChat[0])
        }

        const chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]

        }

        const createdChat = await Chat.create(chatData)
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")
        res.status(200).json(fullChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const fetchChats = expressAsyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "latestMessage.sender latestMessage.timestamps",
                    select: "name email mobile pic"
                })
                res.status(200).send(results)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const fetchGroups = expressAsyncHandler(async (req, res) => {
    try {
        const allGroups = await Chat.where("isGroupChat").equals(true)
        res.status(200).send(allGroups)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" });
    }

    var users = JSON.parse(req.body.users)

    if (users.length < 2) {
        return res.status(400)
            .send("More than 2 persons are required to create a group chat")
    }
    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        })

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const renameGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
    if (!updatedChat) {
        return res.status(404).json({ message: 'No Group Found' })
    } else {
        res.json(updatedChat)
    }
})


const groupExit = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!removed) {
        res.status(404)
        throw new Error("Chat not found")
    } else {
        res.json(removed)
    }
})

const addToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const added = await Chat.findByIdAndUpdate(chatId, {
        $push: { users: userId }
    }, { new: true }
    )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

    if (!added) {
        res.sendStatus(404)
        throw new Error("Chat not found")
    } else {
        res.json(added)
    }


})

const deleteChat = async (req, res) => {
    const chatId  = req.params.id;

    try {
        // Find the chat by ID and delete it
        const deletedChat = await Chat.findByIdAndDelete(chatId);

        if (!deletedChat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.status(200).json(deletedChat);
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ message: 'Error deleting chat' });
    }
};


module.exports = {
    accessChat,
    fetchChats,
    fetchGroups,
    createGroupChat,
    renameGroup,
    groupExit,
    addToGroup,
    deleteChat
}
