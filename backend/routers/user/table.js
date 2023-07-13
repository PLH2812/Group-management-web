const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const { default: mongoose } = require("mongoose");
const auth = require("../../middleware/auth").auth;
const Group = require("../../models/Group");
const Table = require("../../models/Table");
const Task = require("../../models/Task");
const { tryCatch } = require("../../utils/tryCatch");

const router = express.Router();

router.post('/api/users/me/createTable/inGroup/:groupId', auth, async (req, res, next) => {
    try {
      const myGroups = await Group.getMyOwnGroups(req.user._id);
      const group = myGroups.find(g => g.id === req.params['groupId']);
      if (!group){
        res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
      } else {
        const ownerInfo = ({userId: req.user._id, name: req.user.name});
        const table = new Table(req.body);
        table.owner = table.owner.concat(ownerInfo);
        table.groupId = req.params['groupId'];
        table.save();
        res.status(200).send({message: "tạo thành công!"})
      }
    } catch (error) {
      next(error);
    }
  })
  
  router.get('/api/users/me/getTables/inGroup/:groupId/', auth, async(req, res, next) =>{
    try {
        const uid = req.user._id;
        const groupId = mongoose.Types.ObjectId(req.params['groupId'])
        const checkMember = await Group.findOne(groupId,
          {
            "members": { "$elemMatch": { "userId": uid } }
          }).exec();
        const checkOwner = await Group.findOne(groupId,
          {
            "owner": {"$elemMatch": {"userId": uid}}
          }).exec();
        const isInGroup = ((checkMember.members.length > 0) || (checkOwner.owner.length > 0))
        if (!isInGroup) {
          res.status(400).send({ message: "Bạn không ở trong group này!"})
        } else {
          const tables = await Table.find({"groupId": req.params['groupId']})
          res.status(200).send(tables);
        }
    } catch (error) {
      next(error);
    }
  })
  
  router.patch('/api/users/me/addUser/:userId/toTable/:tableId/:groupId', auth, async (req, res, next) => {
    try {
      const myGroups = await Group.getMyOwnGroups(req.user._id);
      const group = myGroups.find(g => g.id == req.params['groupId']);
      if (!group){
        res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
      } else {
        const user = await group.members.find(member => member.userId === req.params['userId']);
        if (!user) {
          res.status(404).send({error: 'Người dùng này không có trong nhóm'})
        } else {
          const table = await Table.findOne({_id: req.params['tableId']});
          if (!table){
            res.status(404).send({error: 'Bảng không tồn tại!'})
          } else {
            const memberInfo = ({userId: user.userId, name: user.name});
            table.members = table.members.concat(memberInfo);
            table.save();
            res.status(200).send({message: 'Thêm thành công!'})
          }
        }
      }
    } catch (error) {
      next(error);
    }
  })
  
  router.patch('/api/users/me/removeUser/:userId/fromTable/:tableId/:groupId', auth, async (req, res, next) => {
    try {
      const myGroups = await Group.getMyOwnGroups(req.user._id);
      const group = myGroups.find(g => g.id === req.params['groupId']);
      if (!group){
        res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
      } else {
        if (req.user._id == req.params.user._id) { 
          return res.status(400).send({ message: "Bạn không thể xoá chủ nhóm ra khỏi nhóm!"}
        )};
        const table = await Table.findOne({_id: req.params['tableId']});
        if (!table){
          res.status(404).send({error: 'Bảng không tồn tại!'})
        } else {
          const user = await table.members.find(member => member.userId === req.params['userId']);
          if (!user) {
            res.status(404).send({error: 'Người dùng này không có trong table'})
          } else {
            const tasks = await Task.find({"assignedTo.userId": req.params['userId'], "tableId": table._id })
            tasks.forEach(function(task){
                task.assignedTo = null;
                task.save();
            })
            table.members = table.members.filter(function(member) { return member.userId !== user.userId})
            table.save();
            res.status(200).send({message: 'Xoá người dùng khỏi table thành công!'})
          }
        }
      }
    } catch (error) {
      next(error);
    }
  })
  
  router.post('/api/users/me/giveTaskToUser/:userId/fromTable/:tableId/', auth, async (req, res, next) => {
    try {
      const table = await Table.findOne({_id: req.params['tableId']});
      if (!table){
        res.status(400).send({ error: "Table không tồn tại!"});
      } else {
        const myTables = await Table.getMyOwnTables(req.user._id);
        const isOwner = myTables.find(t => t.id === req.params['tableId']);
        if (!isOwner){
          res.status(404).send({error: 'Bạn không phải chủ nhóm!'})
        } else {
          const user = table.members.find(member => member.userId === req.params['userId']);
          if (!user) {
            res.status(404).send({error: 'Người dùng này không có trong table'})
          } else {
            const task = new Task(req.body);
            const memberInfo = ({
              userId: user.userId,
              name: user.name
            });
            task.tableId = req.params['tableId'];
            task.assignedTo = memberInfo;
            task.status = "UNSUBMITTED"
            task.save();
            table.tasks = table.tasks.concat({taskId: task._id});
            table.save();
            res.status(200).send({message: 'Thêm task thành công!'})
          }
        }
      }
    } catch (error) {
      next(error);
    }
  })

  router.delete('/api/users/me/deleteTable/:tableId', auth, tryCatch(async(req,res) => {
    await Table.findByIdAndDelete(req.params.tableId)
    return res.status(200).send("Đã xoá table thành công!");
  }))

  router.get('/api/users/me/getMembers/fromTable/:tableId', auth, tryCatch(async(req,res) => {
    const tableId = mongoose.Types.ObjectId(req.params['tableId'])
    const table = await Table.findOne(tableId);
    if (!table) {throw new Error('Table không tồn tại!')};
    const result = {members: table.members, owner: table.owner};
    return res.status(200).send(result);
  }))

  router.use(errorHandler);

  module.exports = router;
