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
    "messages": { "$elemMatch": { "_id": chatId, "senderId": uid } }
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

router.post("/api/users/sendChat/:chatGroupId", auth, async (req, res, next) => {
  try {
    const chatGroupId = req.params.chatGroupId;
    const message = {
      messageContent: req.body.messageContent,
      senderId: uid
    }
    const chatGroup = await ChatGroup.findByIdAndUpdate(chatGroupId,{
      $push: { messages: message },
      $inc: {total_messages: 1} 
    });
    chatGroup.save();
    return res.status(200).send("Gửi thành cồng!");
  } catch (error) {
    next(error);
  }
});

router.get("/api/users/getChat/:chatGroupId", auth, async (req, res, next) => {
  try {
    const chatGroupId = req.params.chatGroupId;
    const chatGroup = await ChatGroup.findById(chatGroupId);
    if (!chatGroup) {throw new Error("Nhóm chat không tồn tại!")}
    const messages = chatGroup.messages;
    return res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
})

router.patch("/api/users/deleteChat/:chatGroupId/:chatId", auth, async (req, res, next) => {
  try {
    const chatGroupId = req.params.chatGroupId;
    const chatId = req.params.chatId;
    const uid = req.user._id;
    const isSender = await isChatSender(uid, chatGroupId, chatId);
    if (!isSender) { throw new Error("Bạn không có quyền xoá!")}
    const chatGroup = await ChatGroup.findByIdAndUpdate(chatGroupId,{
      $pull: {messages: {"_id": chatId}}
    });
    chatGroup.save();
    return res.status(200).send("Đã xoá thành công!");
  } catch (error) {
    next(error);
  }
})

router.use(errorHandler)

module.exports = router;