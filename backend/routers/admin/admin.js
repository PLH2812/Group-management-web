const express = require("express");
const errorHandler = require("../../middleware/errorHandler");
const accountController = require("../admin/adminController/accountController");
const groupController = require("../admin/adminController/groupController");
const taskController = require("../admin/adminController/taskController");
const Table = require("../../models/Table");
const { getAllTasks } = require("./adminController/taskController");
const requireRole = require("../../middleware/auth").requireRole;

const router = express.Router();

const adminRole = process.env.ROLE_ADMIN;

router.post("/api/admin/createUser", requireRole(adminRole), async (req, res) => {
    // Create a new user
    try {
        const user = accountController.createUser(req.body.user);
        res.status(200).send({message: "Tạo tài khoản thành công", data: user});
    } catch (error) {
        next(error);
    }
});

router.post("/api/admin/updateUser/:_id", requireRole(adminRole), async (req, res) => {    
    // Update an existing user
    try {
        const uid = req.params._id;
        const user = accountController.editUser(uid, req.body);
        res.status(200).send({message: "Sửa thành công!", data: user});
    } catch (error) {
        next(error);
    }
})

router.post("/api/admin/deleteUser/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const uid = req.params._id;
        const user = accountController.deleteUser(uid)
        res.status(200).send({message:"Xoá thành công!", data: user});
    } catch (error) {
        next(error);
    }
})

router.get("/api/admin/getUser/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const uid = req.params._id;
        const user = accountController.getUser(uid);
        res.status(200).send(user);
    } catch (error) {
        next(error);
    }
})

router.get("/api/admin/getAllUsers", requireRole(adminRole), async (req, res) => {
    try {
        const data = accountController.getAllUsers();
        res.status(201).send(data);
    } catch (error) {
           next(error);
    }
})

router.get("/api/admin/getAllGroups", requireRole(adminRole), async (req, res) =>{
    try {
        const data = await groupController.getAllGroups();
        res.status(200).send(data);
    } catch (error) {
        next(error);
    }
})

router.get("api/admin/getGroup/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await groupController.getGroup(req.params._id);
        if(!data){
            res.status(404).send({ error: "id không tồn tại!" });
        }
        res.status(200).send(data);
    } catch (error) {
        next(error);
    }
})

router.post("/api/admin/createGroup", requireRole(adminRole), async (req, res) => {
    try {
        const group = await groupController.createGroup(req.body);
        res.status(200).send({message: "Tạo tài khoản thành công", data: group});
    } catch (error) {
        next(error);
    }
})

router.post("/api/admin/updateGroup/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await groupController.editGroup(req.params._id, req.body)
        await data.save();
        res.status(200).send({message: "Sửa thành công!"});
    } catch (error) {
        next(error);
    }
})

router.delete("/api/admin/deleteGroup/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const group = await groupController.deleteGroup(req.params._id);
        res.status(200).send({ message: "Xoá nhóm thành công!", deleted: group});
    } catch (error) {
        next(error);
    }
})

 router.post("/api/admin/removeUser/:userId/fromGroup/:groupId", requireRole(adminRole), async (req, res) => {
    try {
        const group = await groupController.removeUser(req.params.userId, req.params.groupId);
        return res.status(200).send({message: "Đã xoá người dùng ra khỏi nhóm", data: group});
    } catch (error) {
        next(error);
    }
 })

 router.post('/api/admin/createTask/:tableId', requireRole(adminRole), async (req, res) => {
    try {
      const task = await taskController.createTask(req.body, req.params.tableId);
      res.status(200).send({message: 'Tạo task thành công!', data: task});
    } catch (error) {
        next(error);
    }
  })

 router.get('/api/admin/getAllTasks', requireRole(adminRole), async (req, res) => {
    try {
      const tasks = await taskController.getAllTasks();
      res.status(200).send(tasks);
    } catch (error) {
        next(error);
    }
  })

  router.get('/api/admin/getTask/:taskId', requireRole(adminRole), async (req, res) => {
    try {
      const task = await taskController.getTask(req.params.taskId);
      res.status(200).send(task);
    } catch (error) {
        next(error);
    }
  })
  
  router.get('/api/admin/getAllTables', requireRole(adminRole), async (req, res) => {
    try {
      const tables = await Table.find();
      res.status(200).send(tables);
    } catch (error) {
        next(error);
    }
  })

  router.post('/api/admin/editTask/:taskId/', requireRole(adminRole), async (req, res) => {
    try {
      const task = await taskController.editTask(req.params.taskId, req.body);
      res.status(200).send({message: 'Sửa task thành công!', data: task});
    } catch (error) {
        next(error);
    }
  })

  router.delete('/api/admin/deleteTask/:taskId/:tableId', requireRole(adminRole), async (req, res) => {
    try {
      const task = await taskController.deleteTask(req.params.taskId, req.params.tableId);
      res.status(200).send({message: 'Xoá task thành công', deleted: task});
    } catch (error) {
        next(error);
    }
  })

router.use(errorHandler);

module.exports = router;