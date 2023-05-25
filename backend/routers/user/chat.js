const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const ChatGroup = require("../../models/ChatGroup")
const User = require("../../models/User");
const { default: mongoose } = require("mongoose");
const auth = require("../../middleware/auth").auth;

const router = express.Router();

const isGroupMember = async (uid, groupId) => {
  const id = mongoose.Types.ObjectId(groupId)
  const user = await ChatGroup.findOne(id,
  {
    "members": { "$elemMatch": { "userId": uid } }
  }).exec();
  if(user.members.length === 0) return false;
  return true;
}

const isGroupOwner = async (uid, groupId) => {
  const id = mongoose.Types.ObjectId(groupId)
  const user = await ChatGroup.findOne(id,
  {
    "members": { "$elemMatch": { "userId": uid, "isOwner": true } }
  }).exec();
  if (user.members.length === 0) return false;
  return true;
}

const isChatSender = async (uid, groupId, chatId) => {
  const id = mongoose.Types.ObjectId(groupId)
  const user = await ChatGroup.findOne(id,
  {
    "messages": { "$elemMatch": { "_id": chatId, "senderId": uid } }
  }).exec();
  if (user.messages.length === 0) return false;
  return true;
}


router.get("/api/users/getMyChatGroups", auth, async (req, res, next) => {
  try {
    const uid = req.user._id;
    const myChatGroups = await ChatGroup.find({
      "members": {"$elemMatch": {"userId": uid}}
    }).exec();
    if (myChatGroups.length === 0) {return res.status(200).send("Bạn hiện không ở trong nhóm chat nào cả!")}
    return res.status(200).send(myChatGroups);
  } catch (error) {
    next(error);
  }
})

router.post("/api/users/createChatGroup", auth, async (req, res, next) => {
    try {
      const owner = {
        "userId": req.user._id,
        "name": req.user.name,
        "isOwner": true
      }
      req.body.members = [];
      req.body.members.push(owner);
      let chatGroup = new ChatGroup(req.body);
      chatGroup.save();
      return res.status(200).send("Tạo thành công!");
    } catch (error) {
      next(error);
    }
});

router.post("/api/users/addMember/:chatGroupId/:memberId", auth, async (req, res, next) => {
  try {
    const uid = req.user._id;
    const chatGroupId = req.params.chatGroupId;
    const isOwner = await isGroupOwner(uid, chatGroupId);
    if(!isOwner) {throw new Error("Bạn không phải chủ nhóm chat!")}
    const memberId = req.params.memberId;
    const isMember = await isGroupMember(memberId, chatGroupId)
    if(isMember) {throw new Error("Thành viên này đã ở trong nhóm chat rồi!")}
    const member = await User.findById(memberId);
    const chatGroup = await ChatGroup.findByIdAndUpdate(chatGroupId,{
      $push: { members: {
        "userId": member._id,
        "name": member.name
      }}
    });
    chatGroup.save();
    return res.status(200).send("Thêm thành công!");
  } catch (error) {
    next(error);
  }
})

router.patch("/api/users/removeMember/:chatGroupId/:memberId", auth, async (req, res, next) => {
  try {
    const uid = req.user._id;
    const chatGroupId = req.params.chatGroupId;
    const isOwner = await isGroupOwner(uid, chatGroupId);
    if(!isOwner) {throw new Error("Bạn không phải chủ nhóm chat!")}
    const memberId = req.params.memberId;
    const isMember = await isGroupMember(memberId, chatGroupId)
    if(!isMember) {throw new Error("Thành viên này không ở trong nhóm chat!")}
    const memberIsOwner = (memberId == uid)
    if(memberIsOwner) {throw new Error("Bạn không thể xoá chủ nhóm!")}
    const chatGroup = await ChatGroup.findByIdAndUpdate(chatGroupId,{
      $pull: { members: {
        "userId": memberId
      }}
    });
    chatGroup.save();
    return res.status(200).send("Xoá thành công!");
  } catch (error) {
    next(error);
  }
})

router.patch("/api/users/deleteChatGroup/:chatGroupId", auth, async(req, res, next)=>{
  try {
    const uid = req.user._id;
    const chatGroupId = req.params.chatGroupId;
    const isOwner = await isGroupOwner(uid, chatGroupId);
    if(!isOwner) {throw new Error("Bạn không phải chủ nhóm chat!")}
    await ChatGroup.findByIdAndDelete(chatGroupId);
    return res.status(200).send("Xoá thành công!");
  } catch (error) {
    next(error);
  }
});

router.post("/api/users/sendChat/:chatGroupId", auth, async (req, res, next) => {
  try {
    const chatGroupId = req.params.chatGroupId;
    const uid = req.user.id;
    const isMember = await isGroupMember(uid, chatGroupId);
    if (!isMember) throw new Error("Bạn không phải là thành viên nhóm chat!");
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
    const uid = req.user.id;
    const isMember = await isGroupMember(uid, chatGroupId);
    if (!isMember) throw new Error("Bạn không phải là thành viên nhóm chat!");
    const chatGroup = await ChatGroup.findById(chatGroupId);
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
    const uid = req.user.id;
    const isOwner = await isGroupOwner(uid, chatGroupId);
    const isSender = await isChatSender(uid, chatGroupId, chatId);
    if (!isOwner || !isSender) { throw new Error("Bạn không có quyền xoá!")}
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