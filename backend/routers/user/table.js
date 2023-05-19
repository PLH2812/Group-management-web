const express = require("express");
const auth = require("../../middleware/auth").auth;
const Group = require("../../models/Group");
const Table = require("../../models/Table");
const Task = require("../../models/Task");

const router = express.Router();

router.post('/api/users/me/createTable/inGroup/:groupId', auth, async (req, res) => {
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
      res.status(500).send({error: error.message});
    }
  })
  
  router.get('/api/users/me/getTables/inGroup/:groupId', auth, async(req, res) =>{
    try {
        const group = await Group.findOne({_id: req.params['groupId']})
        const isInGroup = group.members.find(member => member.userId == req.user._id);
        if (!isInGroup){
          res.status(400).send({ message: "Bạn không ở trong group này!"})
        } else {
          const tables = await Table.find({"groupId": req.params['groupId']})
          res.status(200).send(tables);
        }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  })
  
  router.patch('/api/users/me/addUser/:userId/toTable/:tableId/:groupId', auth, async (req, res) => {
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
            res.status(200).send({message: 'thêm thành công!'})
          }
        }
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  })
  
  router.patch('/api/users/me/removeUser/:userId/fromTable/:tableId/:groupId', auth, async (req, res) => {
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
      res.status(500).send({error: error.message});
    }
  })
  
  router.post('/api/users/me/giveTaskToUser/:userId/fromTable/:tableId/', auth, async (req, res) => {
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
      res.status(500).send({error: error.message});
    }
  })

  module.exports = router;
