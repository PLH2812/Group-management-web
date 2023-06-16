const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const auth = require("../../middleware/auth").auth;
const Table = require("../../models/Table");
const Task = require("../../models/Task");

const router = express.Router();

router.post('/api/users/me/createTask/fromTable/:tableId/', auth, async (req, res, next) => {
  try {
    const tableId = req.params['tableId'];
    const table = await Table.findOne({tableId});
    if (!table){
      res.status(400).send({ error: "Table không tồn tại!"});
    } else {
      const myTables = await Table.getMyOwnTables(req.user._id);
      const isOwner = myTables.find(t => t.id === req.params['tableId']);
      if (!isOwner){
        res.status(404).send({error: 'Bạn không phải chủ nhóm!'})
      } else {
        const task = new Task(req.body);
        task.tableId = req.params['tableId'];
        task.status = "UNSUBMITTED";
        task.save();
        table.tasks = table.tasks.concat({taskId: task._id});
        table.save();
        res.status(200).send({message: 'Thêm task thành công!'})
      }
    }
  } catch (error) {
    next(error);
  }
})

router.delete('/api/users/me/deleteTask/:taskId/fromTable/:tableId/', auth, async (req, res, next) => {
  try {
    const tableId = req.params['tableId'];
    const table = await Table.findOne({tableId});
    if (!table){
      res.status(400).send({ error: "Table không tồn tại!"});
    } else {
      const myTables = await Table.getMyOwnTables(req.user._id);
      const isOwner = myTables.find(t => t.id === req.params['tableId']);
      if (!isOwner){
        res.status(404).send({error: 'Bạn không phải chủ nhóm!'})
      } else {
        let task = await Task.findOne({_id: req.params['taskId']})
        if (!task) {
          res.status(404).send({error: 'Task không tồn tại!'})
        } else {
          task = await Task.findByIdAndDelete(task._id)
          table.tasks = table.tasks.filter((task)=> { return task.taskId !== req.params['taskId']});
          table.save();
          res.status(200).send({message: 'Xoá task thành công!'})
        }
      }
    }
  } catch (error) {
    next(error);
  }
})

router.patch('/api/users/me/editTask/:taskId/fromTable/:tableId/', auth, async (req, res, next) => {
  try {
    const tableId = req.params['tableId'];
    const table = await Table.findOne({tableId});
    if (!table){
      res.status(400).send({ error: "Table không tồn tại!"});
    } else {
      const myTables = await Table.getMyOwnTables(req.user._id);
      const isOwner = myTables.find(t => t.id === req.params['tableId']);
      if (!isOwner){
        res.status(404).send({error: 'Bạn không phải chủ nhóm!'})
      } else {
        const task = await Task.findOne({_id: req.params['taskId']})
        if (!task) {
          res.status(404).send({error: 'Task không tồn tại!'})
        } else {
          const task = await Task.findByIdAndUpdate(req.params['taskId'], {
            name: req.body.name,
            description: req.body.description,
            status: req.body.status,
            assignedTo: req.body.assignedTo,
            startDate: req.body.startDate,
            endDate: req.body.endDate
          })
          task.save();
          res.status(200).send({message: 'Sửa task thành công!'})
        }
      }
    }
  } catch (error) {
    next(error);
  }
})

router.patch('/api/users/me/submitTask/:taskId/', auth, async(req, res, next) => {
  try {
    const task = await Task.findOne({_id: req.params['taskId']});
    const isMyTask = (task.assignedTo.userId == req.user._id);
    if (!isMyTask){
      res.status(400).send({ error: "Đây không phải task của bạn!"});
    } else {
      if (Date.now() < task.endDate){
        task.submission = req.body.submission;
        task.status = "SUBMITTED";
        task.save();
        res.status(200).send({message: 'Submit task thành công!'})
      } else {
        res.status(400).send({message: 'Đã hết hạn submit!'})
      }
      
    }
  } catch (error) {
    next(error);
  }
})

router.patch('/api/users/me/pickTask/:taskId/fromTable/:tableId/', auth, async(req, res, next) => {
  try {
    const myTables = await Table.getMyTables(req.user._id);
    const task = await Task.findOne({_id: req.params['taskId']});
    if (!task){
      res.status(404).send({message: 'Task không tồn tại!'})
    } else {
      const userInfo = {
        userId: req.user._id,
        name: req.user.name
      }
      task.assignedTo = userInfo;
      task.save();
      res.status(200).send({message: 'Đã nhận task thành công!'})
    }
  } catch (error) {
    next(error);
  }
})

router.get('/api/users/me/getTasks/fromTable/:tableId', auth, async (req, res, next) => {
  try {
    const tableId = req.params['tableId'];
    const table = await Table.findOne({tableId});
    if (!table){
      res.status(400).send({ error: "Table không tồn tại!"});
    } else {
      const tasks = await Task.find({tableId: req.params['tableId']});
      res.status(200).send({tasks});
    }
  } catch (error) {
    next(error);
  }
})

router.get('/api/users/me/getTask/:taskId/fromTable/:tableId', auth, async (req, res, next) => {
  try {
    const tableId = req.params['tableId'];
    const table = await Table.findOne({tableId});
    if (!table){
      res.status(400).send({ error: "Table không tồn tại!"});
    } else {
      const myTables = await Table.getMyOwnTables(req.user._id);
      const isOwner = myTables.find(t => t.id === req.params['tableId']);
      if (!isOwner){
        res.status(404).send({error: 'Bạn không phải chủ nhóm!'})
      } else {
        const task = await Task.findOne({
          _id: req.params['taskId'],
          tableId: req.params['tableId']
        })
        res.status(200).send({task})
      }
    }
  } catch (error) {
    next(error);
  }
})

router.get('/api/users/me/getMyTasks/', auth, async (req, res, next) => {
  try {
    const myTasks = await Task.getMyTasks(req.user._id);
    res.status(200).send({myTasks});
  } catch (error) {
    next(error);
  }
})

router.get('/api/users/me/getMyTask/:taskId', auth, async (req, res, next) => {
  try {
      const myTasks = await Task.getMyTasks(req.user._id);
      myTasks = myTasks.filter((task) => {return task._id === req.params['taskId']});
      res.status(200).send({myTasks});
    } catch (error) {
    next(error);
  }
})

router.get('/api/users/me/getMyTasks/fromTable/:tableId', auth, async (req, res, next) => {
  try {
    const tableId = req.params['tableId'];
    const table = await Table.findOne({tableId});
    if (!table){
      res.status(400).send({ error: "Table không tồn tại!"});
    } else {
      const myTasks = await Task.getMyTasks(req.user._id);
      myTasks = myTasks.filter((task) => {return task.tableId === req.params['tableId']});
      res.status(200).send({myTasks});
    }
  } catch (error) {
    next(error);
  }
})

router.use(errorHandler);

module.exports = router;