const express = require("express");
const calendar = require("../../utils/calendarSync")
const errorHandler = require("../../middleware/errorHandler")
const auth = require("../../middleware/auth").auth;
const Table = require("../../models/Table");
const Task = require("../../models/Task");
const User = require("../../models/User");
const mailer = require('../../utils/sendMail');
const { tryCatch } = require("../../utils/tryCatch");

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
        let task = new Task(req.body);
        task.tableId = req.params['tableId'];
        task.status = "OPEN";
        task.assignedTo = [];
        task.assignedTo = task.assignedTo.concat(req.body.assignee);
        await task.save();
        table.tasks = table.tasks.concat({taskId: task._id});
        await table.save();

        task.assignedTo.forEach(async (assignee) =>{
          let assigneeInfo = await User.findOne(assignee.userId);
          if (assigneeInfo) {
            if (assignee.refresh_token) {
              const oauth = calendar.configOAuth2(assigneeInfo.refresh_token);
            
              calendar.addTaskToCalendar(oauth, task);
              task.syncedToCalendar = true;

              await task.save();
            }
          }
        })

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
          await table.save();
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
        await task.save();

        const assignee = await User.findOne(task.assignedTo);
        const assigner = await User.findOne(table.owner.userId);
        const maillist = [
          assignee.email,
          assigner.email,
        ];
        mailer.sendMail(maillist, `Một task trong nhóm ${table.name} của bạn đã thay đổi`,
       `<p>Người dùng ${req.user.name} đã thay đổi task ${task.name} trong nhóm ${table.name} của bạn</p>`);
        
        res.status(200).send({message: 'Sửa task thành công!'})
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
        await task.save();
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
    const task = await Task.findOne({_id: req.params['taskId']});
    if (!task){
      res.status(404).send({message: 'Task không tồn tại!'})
    } else {
      const userInfo = {
        userId: req.user._id,
        name: req.user.name
      }
      task.assignedTo.concat(userInfo);

      if(req.user.refresh_token){
        const oauth = calendar.configOAuth2(req.user.refresh_token);

        calendar.addTaskToCalendar(oauth, task);
        task.syncedToCalendar = true;
      }
      await task.save();
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
      const task = await Task.findOne({
        _id: req.params['taskId'],
        tableId: req.params['tableId']
      })
      res.status(200).send({task})
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

router.post('/api/users/addTaskToCalendar/:taskId', tryCatch( async(req,res) => {
  if (!req.user.refresh_token) throw new Error(`Người dùng chưa liên kết với Google Calendar`);

  const task = await Task.findOne(req.params['taskId']);
  if (!task) throw new Error(`Task không tồn tại`);
  
  const oauth = calendar.configOAuth2(req.user.refresh_token);

  if (task.syncedToCalendar === true) return res.status(400).send("Task này đã được thêm vào Calendar rồi");

  calendar.addTaskToCalendar(oauth, task);
  task.syncedToCalendar = true;
  await task.save();

  return res.status(200).send("Thêm thành công");
}))

router.post('/api/users/addTasksToCalendar/', tryCatch( async(req,res) => {
  if (!req.user.refresh_token) throw new Error(`Người dùng chưa liên kết với Google Calendar`);

  const tasks = req.body.tasks;
  const oauth = calendar.configOAuth2(req.user.refresh_token);

  tasks.forEach(async (task) => {
    if (task.syncedToCalendar === false){
      calendar.addTaskToCalendar(oauth, task);
      task.syncedToCalendar = true;
      await task.save();
    }
  });

  return res.status(200).send("Thêm thành công");
}))

router.post('/api/users/addAllTasksToCalendar/' , tryCatch(async (req, res) => {
  if (!req.user.refresh_token) throw new Error(`Người dùng chưa liên kết với Google Calendar`);

  const tasks = await Task.getMyTasks();
  const oauth = calendar.configOAuth2(req.user.refresh_token);

  tasks.forEach(async (task) => {
    if (task.syncedToCalendar === false){
      calendar.addTaskToCalendar(oauth, task);
      task.syncedToCalendar = true;
      await task.save();
    }
  });

  return res.status(200).send("Thêm thành công");
}))

router.use(errorHandler);

module.exports = router;