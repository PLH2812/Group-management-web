const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const ChatGroup = require("../../models/ChatGroup")
const User = require("../../models/User");
const { default: mongoose } = require("mongoose");
const auth = require("../../middleware/auth").auth;

const router = express.Router();

const isChatSender = async (uid, groupId, chatId) => {
  const id = mongoose.Types.ObjectId(groupId)
  const user = await ChatGroup.findOne(id,
  {
    "messages": { "$elemMatch": { "_id": chatId } },
    "sender": { "$elemMatch": { "senderId": uid } }
  }).exec();
  if (user.messages.length === 0) return false;
  return true;
}

router.get("/api/users/getChatGroup/:taskId", auth, async (req, res, next) => {
  try {
    const chatGroup = await ChatGroup.findOne({
      taskId : req.params.taskId
    }).exec();
    if (!chatGroup) {throw new Error("Nhóm chat không tồn tại!")}
    return res.status(200).send(chatGroup);
  } catch (error) {
    next(error);
  }
})

router.post("/api/users/createChatGroup", auth, async (req, res, next) => {
    try {
      let chatGroup = new ChatGroup(req.body);
      chatGroup.save();
      return res.status(200).send("Tạo thành công!");
    } catch (error) {
      next(error);
    }
});

router.post("/api/users/sendChat/:taskId", auth, async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const uid = req.user._id;
    const message = {
      messageContent: req.body.messageContent,
      sender: {
        senderId: uid,
        name: req.user.name
      }
    }
    const filter = {taskId: taskId};
    await ChatGroup.findOneAndUpdate(filter,{
      $push: { messages: message },
      $inc: {total_messages: 1} 
    }).exec();
    return res.status(200).send({message: "Gửi thành cồng!"});
  } catch (error) {
    next(error);
  }
});

router.get("/api/users/getChat/:taskId", auth, async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const chatGroup = await ChatGroup.findOne({taskId: taskId});
    if (!chatGroup) {throw new Error("Nhóm chat không tồn tại!")}
    const messages = chatGroup.messages;
    return res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
})

router.patch("/api/users/deleteChat/:taskId/:chatId", auth, async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const chatGroup = await ChatGroup.findOne({taskId: taskId});
    const chatId = req.params.chatId;
    const uid = req.user._id;
    const isSender = await isChatSender(uid, chatGroup._id, chatId);
    if (!isSender) { throw new Error("Bạn không có quyền xoá!")}
    await ChatGroup.findOneAndUpdate({taskId: taskId},{
      $pull: {messages: {"_id": chatId}}
    }).exec();
    return res.status(200).send("Đã xoá thành công!");
  } catch (error) {
    next(error);
  }
})

router.use(errorHandler)

module.exports = router;