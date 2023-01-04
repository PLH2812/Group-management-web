const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth").auth;
const checkStatus = require("../middleware/checkUserStatus");
const Group = require("../models/Group");
const Table = require("../models/Table");
const Task = require("../models/Task");

const router = express.Router();

router.post("/api/users/register", async (req, res) => {
  // Create a new user
  try {
    const user = new User(req.body);
    const unavailable = await User.findOne({email: user.email});
    if (!unavailable){
      user.role = process.env.ROLE_USER;
      user.status = process.env.USER_STATUS_ACTIVE;
      await user.save();
    } else {
      res.status(400).send({error: 'Người dùng đã tồn tại!'});
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/api/users/login', checkStatus, async(req, res) => {
    //Login a registered user
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).send({error: 'Đăng nhập thất bại!'});
        }
        const token = await user.generateAuthToken();
        res
        .cookie("JWT", token, {
          httpOnly: true,
          secure: process.env.PROJECT_STATUS !== "DEVELOPING",
          sameSite: 'lax'
        })
        .status(200)
        .send({message: 'Đăng nhập thành công'})
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/api/users/getUser/:userEmail', async(req,res) => {
  try {
    const user = await User.findOne({email: req.params['userEmail']});
    if (!user) {
      return res.status(404).send({error: 'Không tìm thấy kết quả nào!'});
    }
    else {
      res.status(200).send({
        _id: user._id,
        email: user.email,
        name: user.name
      })
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.get('/api/users/me', auth, async(req, res) => {
    // View logged in user profile
    const data = {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name
    };
    res.send(data);
})

router.patch('/api/users/me', auth, async(req, res) => {
    // Update user profile
    try {
      const data = req.body;
      req.user.email = data.email;
      req.user.name = data.name;
      await req.user.save();
      res.status(200).send({ message: "Cập nhật thành cồng!"});
    } catch (error) {
      res.status(500).send(error);
    }
})

router.post("/api/users/me/logout", auth, async (req, res) => {
    // Log user out of the application
    try {
      req.user.tokens = req.user.tokens.filter(token => {
        return token.token != req.token;
      });
      await req.user.save();
      res.clearCookie("JWT").status(200).send({ message: "Đăng xuất thành cồng!"});
    } catch (error) {
      res.status(500).send(error);
    }
});

router.post('/api/users/me/logoutall', auth, async(req, res) => {
  // Log user out of all devices
  try {
      req.user.tokens.splice(0, req.user.tokens.length);
      await req.user.save();
      res.clearCookie("JWT").status(200).send({ message: "Đăng xuất thành cồng!"});
  } catch (error) {
      res.status(500).send(error);
  }
});

// Group activities start
router.get('/api/users/me/groups', auth, async(req, res) => {
  try {
    const myGroups = await Group.getMyGroups(req.user._id);
    res.status(200).send(myGroups);
  } catch (error) {
    res.status(500).send(error);
  }
})

router.post('/api/users/me/createGroup', auth, async (req, res) => {
  try {
    const ownerInfo = ({userId: req.user._id, name: req.user.name});
    req.body.owner = ownerInfo;
    const group = new Group(req.body);
    group.save();
    res.status(200).send({ message: "Tạo nhóm thành công!"});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.delete('/api/users/me/deleteGroup/:_id', auth, async (req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

router.patch('/api/users/me/addUser/:userId/toGroup/:groupId', auth, async (req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

router.patch('/api/users/me/removeUser/:userId/fromGroup/:groupId', auth, async (req, res) => {
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
        const tables = await Table.find({groupId: req.params['groupId']});
        tables.forEach(async function(table){
          const tasks = await Task.find({"assignedTo.userId": req.params['userId'], "tableId": table._id })
          tasks.forEach(function(task){
              task.assignedTo = null;
              task.save();
          })
          table.members = table.members.filter(function(member) { return member.userId !== user.userId})
          table.save();
        })
        group.members = group.members.filter(function(mem) { return mem.userId != member._id; }); 
        group.save();
        res.status(200).send({message: "Đã xoá người dùng khỏi nhóm!"});
      }
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

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
    const group = myGroups.find(g => g.id === req.params['groupId']);
    if (!group){
      res.status(400).send({ error: "Bạn không phải chủ nhóm!"});
    } else {
      const user = await group.members.find(member => member.userId === req.params['userId']);
      if (!user) {
        res.status(404).send({error: 'Người dùng này không có trong nhóm'})
      } else {
        const tableId = req.params['tableId'];
        const table = await Table.findOne({tableId});
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
      const tableId = req.params['tableId'];
      const table = await Table.findOne({tableId});
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

router.post('/api/users/me/createTask/fromTable/:tableId/', auth, async (req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

router.delete('/api/users/me/deleteTask/:taskId/fromTable/:tableId/', auth, async (req, res) => {
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
          task = await Task.findByIdAndDelete(task._id)
          table.tasks = table.tasks.filter((task)=> { return task.taskId !== req.params['taskId']});
          table.save();
          res.status(200).send({message: 'Xoá task thành công!'})
        }
      }
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.patch('/api/users/me/editTask/:taskId/fromTable/:tableId/', auth, async (req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

router.patch('/api/users/me/submitTask/:taskId/', auth, async(req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

router.patch('/api/users/me/pickTask/:taskId/fromTable/:tableId/', auth, async(req, res) => {
  try {
    const myTables = await Table.getMyTables(req.user._id);
    const table = myTables.find(t => t.id === req.params['tableId'])
    if (!table) {
      res.status(400).send({message: 'Bạn không phải thành viên của table!'})
    } else {
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
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.get('/api/users/me/getTasks/fromTable/:tableId', auth, async (req, res) => {
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
        const task = await Task.find({tableId: req.params['tableId']})
        res.status(200).send({task})
      }
    }
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.get('/api/users/me/getTask/:taskId/fromTable/:tableId', auth, async (req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

router.get('/api/users/me/getMyTasks/', auth, async (req, res) => {
  try {
    const myTasks = await Task.getMyTasks(req.user._id);
    res.status(200).send({myTasks});
  } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.get('/api/users/me/getMyTask/:taskId', auth, async (req, res) => {
  try {
      const myTasks = await Task.getMyTasks(req.user._id);
      myTasks = myTasks.filter((task) => {return task._id === req.params['taskId']});
      res.status(200).send({myTasks});
    } catch (error) {
    res.status(500).send({error: error.message});
  }
})

router.get('/api/users/me/getMyTasks/fromTable/:tableId', auth, async (req, res) => {
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
    res.status(500).send({error: error.message});
  }
})

module.exports = router;