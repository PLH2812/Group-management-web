const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const User = require("../../models/User");
const auth = require("../../middleware/auth").auth;
const Group = require("../../models/Group");
const Table = require("../../models/Table");
const Task = require("../../models/Task");

const router = express.Router();

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
      group.save();
      res.status(200).send({ message: "Tạo nhóm thành công!"});
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
        group = Group.findByIdAndDelete(req.params['_id'], function (err, group) {
          if (err){
            console.log(err)
        }
          else{
            res.status(200).send({ message: "Xoá nhóm thành công!", deleted: group});
        }
        });
      }
    } catch (error) {
      next(error);
    }
  })
  
  router.patch('/api/users/me/addUser/:userId/toGroup/:groupId', auth, async (req, res, next) => {
    try {
      const myGroups = await Group.getMyOwnGroups(req.user._id);
      const group = myGroups.find(g => g.id === req.params['groupId']);
      if (!group){
        res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
      } else {
        const member = await User.findOne({_id: req.params['userId']});
        if (!member) {
          res.status(404).send({error: "Không tìm thấy người dùng này!"});
        } else {
          const memberInfo = ({userId: member._id, name: member.name});
          const existed = group.members.find(member => member.userId == req.params['userId']);
          
          if (!existed){
            group.members = group.members.concat(memberInfo);
            group.save();
            res.status(200).send({message: "Thêm thành công!"});
          } else {res.status(400).send({message: "Người dùng đã ở trong nhóm!"})}
        }
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
          res.status(200).send({message: "Đã xoá người dùng khỏi nhóm!"});
        }
      }
    } catch (error) {
      next(error);
    }
  })

  router.use(errorHandler)

  module.exports = router;
