const express = require("express");
const mailer = require('../../utils/sendMail');
const { default: mongoose } = require("mongoose");
const errorHandler = require("../../middleware/errorHandler")
const User = require("../../models/User");
const auth = require("../../middleware/auth").auth;
const Notification = require("../../models/Notification");
const Group = require("../../models/Group");
const Table = require("../../models/Table");
const Task = require("../../models/Task");
const ChatGroup = require("../../models/ChatGroup");
const { tryCatch } = require("../../utils/tryCatch");

const router = express.Router();


const isGroupOwner = async(uid, groupId) => {
  const id = mongoose.Types.ObjectId(groupId)
  const user = await Group.findOne(id,
  {
    "owner": { "$elemMatch": { "userId": uid } }
  }).exec();
  if(user.owner.length === 0) return false;
  return true;
}

router.get('/api/users/me/groups', auth, async(req, res, next) => {
    try {
      const myGroups = await Group.getMyGroups(req.user._id);
      res.status(200).send(myGroups);
    } catch (error) {
      next(error);
    }
  })
  
  router.post('/api/users/me/createGroup', auth, async (req, res, next) => {
    try {
      const ownerInfo = ({userId: req.user._id, name: req.user.name});
      req.body.owner = ownerInfo;
      const group = new Group(req.body);
      await group.save();
      let table = new Table;
      table.name = "To Do";
      table.description = "To Do table";
      table.owner = ownerInfo;
      table.groupId = group._id;
      await table.save();
      const chatGroup = new ChatGroup({
        name: `Nhóm chat của ${group.name}`,
        groupId: group._id
      });
      await chatGroup.save();
      res.status(200).send({ message: "Tạo nhóm thành công!", group});
    } catch (error) {
      next(error);
    }
  })

  router.post("/api/users/editGroup/:groupId", auth, async(req, res, next) => {
    try {
      const groupId = req.params.groupId;
      let group = await Group.findById(req.params.groupId);
      const isOwner = await isGroupOwner(req.user._id, groupId);
      if(!isOwner) {throw new Error("Bạn không phải chủ nhóm!")}

      group.name = req.body.name;
      group.description = req.body.description;
      group.privacy = req.body.privacy;
      await group.save();
      
      return res.status(200).send("Cập nhật thành cồng!");
    } catch (error) {
      next(error);
    }
  })
  
  router.delete('/api/users/me/deleteGroup/:_id', auth, async (req, res, next) => {
    try {
      let myGroups = await Group.getMyOwnGroups(req.user._id);
      let group = myGroups.find(g => g.id === req.params['_id']);
      if (!group){
        res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
      } else {
        const filter = {_id: req.params._id};
        await Group.findOneAndDelete(filter);
        await ChatGroup.findOneAndDelete({groupId: group._id});
        return res.status(200).send({message:"Xoá nhóm thành công!", deleted: group});
      }
    } catch (error) {
      next(error);
    }
  })
  
  router.post("/api/users/sendInvitationMail/:uid/:groupId", auth, async(req, res, next) => {
    try {
      const groupId = req.params.groupId;
      const group = await Group.findById(req.params.groupId);
      const groupName = group.name;
      const uid = req.params.uid;
      const user = await User.findById(uid)
      const isOwner = await isGroupOwner(req.user._id, groupId);
      if(!isOwner) {throw new Error("Bạn không phải chủ nhóm!")}
      mailer.sendMail(user.email, "Lời mời vào nhóm!",
       `<h1>Bạn đã được mời vào nhóm ${groupName}! </br></h1>
       <a href="${process.env.APP_URL}/invitation?uid=${uid}&groupId=${groupId}">Nhấn vào đây để chấp nhận</a>`);
      const notification = new Notification({
        userId: uid,
        title: `Bạn nhận được lời mời vào nhóm ${group.name}.`,
        description: `Người dùng ${req.user.name} đã mời bạn vào nhóm ${group.name}, hãy kiểm tra email để xác nhận.`
      })
      await notification.save();
      return res.status(200).send({message: "Gửi thành công!", notification});
    } catch (error) {
      next(error);
    }
  })

  router.patch('/api/users/me/addUser/:userId/toGroup/:groupId', auth, async (req, res, next) => {
    try {
      const member = await User.findOne({_id: req.params['userId']});
      if (!member) {
        res.status(404).send({error: "Không tìm thấy người dùng này!"});
      } else {
        const groupId = mongoose.Types.ObjectId(req.params.groupId);
        const uid = req.params.userId;
        const memberInfo = ({userId: member._id, name: member.name});
        const checkMember = await Group.findOne(groupId,
          {
            "members": { "$elemMatch": { "userId": uid } }
          }).exec();
        const checkOwner = await Group.findOne(groupId,
          {
            "owner": {"$elemMatch": {"userId": uid}}
          }).exec();
        const isInGroup = ((checkMember.members.length > 0) || (checkOwner.owner.length > 0))
          
        if (!isInGroup){
          const update = await Group.findByIdAndUpdate(groupId,{
            $push: {
              members: memberInfo
            }});
          update.save();
          res.status(200).send({message: "Thêm thành công!"});
        } else {res.status(400).send({message: "Người dùng đã ở trong nhóm!"})}
      }
    } catch (error) {
      next(error);
    }
  })
  
  router.patch('/api/users/me/removeUser/:userId/fromGroup/:groupId', auth, async (req, res, next) => {
    try {
      const myGroups = await Group.getMyOwnGroups(req.user._id);
      const group = myGroups.find(g => g.id === req.params['groupId']);
      if (!group){
        res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
      } else {
        if (req.user._id == req.params.user._id) {
          return res.status(400).send({ message: "Bạn không thể xoá chủ nhóm ra khỏi nhóm!"}
        )};
        const member = await User.findOne({_id: req.params['userId']});
        if (!member) {
          res.status(404).send({error: "Không tìm thấy người dùng này!"});
        } else {
          const tables = await Table.find({groupId: req.params['groupId']});
          tables.forEach(async function(table){
            const tasks = await Task.find({"assignedTo.userId": req.params['userId'], "tableId": table._id })
            tasks.forEach(function(task){
                task.assignedTo = null;
                task.save();
            })
            table.members = table.members.filter(function(member) { return member.userId !== req.params['userId']})
            table.save();
          })
          group.members = group.members.filter(function(mem) { return mem.userId != member._id; }); 
          group.save();
          const notification = new Notification({
            userId: member._id,
            title: `Bạn đã bị xoá khỏi nhóm ${group.name}.`,
            description: `Bạn đã bị xoá khỏi nhóm ${group.name}.`
          })
          await notification.save();
          res.status(200).send({message: "Đã xoá người dùng khỏi nhóm!", notification});
        }
      }
    } catch (error) {
      next(error);
    }
  })

  router.get('/api/users/me/getMembers/fromGroup/:groupId', auth, tryCatch(async(req,res) => {
    const groupId = mongoose.Types.ObjectId(req.params['groupId'])
    let group = await Group.findOne(groupId).lean();
    if (!group) {throw new Error('Nhóm không tồn tại!')};
    for (let index = 0; index < group.members.length; index++) {
      let id = group.members[index].userId;
      const user = await User.findById(id).lean();
      group.members[index].avatarUrl = user.avatarUrl;
    }
    for (let index = 0; index < group.owner.length; index++) {
      let ownerId = group.owner[index].userId;
      const owner = await User.findById(ownerId).lean();
      group.owner[index].avatarUrl = owner.avatarUrl;
    }
    const result = {members: group.members, owner: group.owner};
    return res.status(200).send(result);
  }))

  router.use(errorHandler)

  module.exports = router;
