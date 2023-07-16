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

router.get("/api/users/getChatGroup/:taskId/:groupId", auth, async (req, res, next) => {
  try {
    var chatGroup
    if (req.params.taskId != 1){
      chatGroup = await ChatGroup.findOne({
        taskId : req.params.taskId
      }).exec();
    } else {
      chatGroup = await ChatGroup.findOne({
        groupId : req.params.groupId
      }).exec();
    }
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

router.patch("/api/users/updateChatName/:groupId", auth, async (req, res, next) => {
  try {
    const filter = {groupId: req.params.groupId};
    const update = {name: req.body.name};
    const chat = await ChatGroup.findOneAndUpdate(filter, update);
    if (!chat) throw new Error("Không tìm thấy nhóm chat");
    return res.status(200).send("Tạo thành công!");
  } catch (error) {
    next(error);
  }
})

router.post("/api/users/sendChat/:taskId/:groupId", auth, async (req, res, next) => {
  try {
    const uid = req.user._id;
    const message = {
      messageContent: req.body.messageContent,
      sender: {
        senderId: uid,
        name: req.user.name
      }
    }
    if (req.params.taskId != 1){
      const filter = {taskId: req.params.taskId};
      await ChatGroup.findOneAndUpdate(filter,{
        $push: { messages: message },
        $inc: {total_messages: 1} 
      }).exec();
    } else {
      const filter = {groupId: req.params.groupId};
      await ChatGroup.findOneAndUpdate(filter,{
        $push: { messages: message },
        $inc: {total_messages: 1} 
      }).exec();
    }
    return res.status(200).send({message: "Gửi thành cồng!"});
  } catch (error) {
    next(error);
  }
});

router.get("/api/users/getChat/:taskId/:groupId", auth, async (req, res, next) => {
  try {
    if (req.params.taskId != 1){
      var chatGroup = await ChatGroup.findOne({taskId: req.params.taskId});
    } else {
      var chatGroup = await ChatGroup.findOne({groupId: req.params.groupId});
    }
    if (!chatGroup) {throw new Error("Nhóm chat không tồn tại!")}
    const messages = chatGroup.messages;
    for (let index = 0; index < messages.length; index++) {
      const user = await findById(messages[index].sender.senderId);
      if (user.avatarUrl !== null){messages[index].sender.avatarUrl = user.avatarUrl}
    }
    return res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
})

router.patch("/api/users/deleteChat/:taskId/:groupId/:chatId", auth, async (req, res, next) => {
  try {
    const uid = req.user._id;
    if (req.params.taskId != 1){
      const chatGroup = await ChatGroup.findOne({taskId: req.params.taskId});
      const chatId = req.params.chatId;
      const isSender = await isChatSender(uid, chatGroup._id, chatId);
      if (!isSender) { throw new Error("Bạn không có quyền xoá!")}
      await ChatGroup.findOneAndUpdate({taskId: req.params.taskId},{
        $pull: {messages: {"_id": chatId}}
      }).exec();
    } else {
      const chatGroup = await ChatGroup.findOne({groupId: req.params.groupId});
      const chatId = req.params.chatId;
      const isSender = await isChatSender(uid, chatGroup._id, chatId);
      if (!isSender) { throw new Error("Bạn không có quyền xoá!")}
      await ChatGroup.findOneAndUpdate({groupId: req.params.groupId},{
        $pull: {messages: {"_id": chatId}}
      }).exec();
    }
    return res.status(200).send("Đã xoá thành công!");
  } catch (error) {
    next(error);
  }
})

router.use(errorHandler)

module.exports = router;