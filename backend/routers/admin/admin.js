const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const Group = require("../../models/Group");
const User = require("../../models/User");
const Task = require("../../models/Task");
const Table = require("../../models/Table");
const requireRole = require("../../middleware/auth").requireRole;

const router = express.Router();

const adminRole = process.env.ROLE_ADMIN;

router.post("/api/admin/createUser", requireRole(adminRole), async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        await user.save();
    res.status(201).send(user);
    } catch (error) {
        next(error);
    }
});

router.post("/api/admin/updateUser/:_id", requireRole(adminRole), async (req, res) => {    
    // Update an existing user
    try {
        const data = await User.findByIdAndUpdate(req.params['_id'], {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role 
        })
        await data.save();
        res.send({message: "Sửa thành công!"});
    } catch (error) {
        next(error);
    }
})

router.post("/api/admin/deleteUser/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await User.findByIdAndUpdate(req.params['_id'], {
            status: "DELETED" //Change status to "DELETED"
        })
        data.tokens.splice(0, data.tokens.length) //Logout from all devices
        await data.save();
        res.status(200).send({message:"Xoá thành công!"});
    } catch (error) {
        next(error);
    }
})

router.get("/api/admin/getUser/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await User.findOne({_id: req.params['_id']});
        if(!data){
            res.status(404).send({ error: "id không tồn tại!" });
        }
        res.status(200).send(data);
    } catch (error) {
        next(error);
    }
})

router.get("/api/admin/getAllUsers", requireRole(adminRole), async (req, res) => {
    try {
        const data = await User.find();
        res.status(201).send(data);
    } catch (error) {
           next(error);
    }
})

router.get("/api/admin/getAllGroups", requireRole(adminRole), async (req, res) =>{
    try {
        const data = await Group.find();
        res.status(200).send(data);
    } catch (error) {
           next(error);
    }
})

router.get("api/admin/getGroup/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await Group.findOne({_id: req.params['_id']});
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
        const group = new Group(req.body);
        group.save();
        res.status(200).send({ message: "Tạo nhóm thành công!"});
    } catch (error) {
        next(error);
    }
})

router.post("/api/admin/updateGroup/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await Group.findByIdAndUpdate(req.params['_id'], {
            name: req.body.name,
            description: req.body.description,
            owner: req.body.owner,
            members: req.body.members,
            tasks: req.body.tasks
        })
        await data.save();
        res.status(200).send({message: "Sửa thành công!"});
    } catch (error) {
        next(error);
    }
})

router.delete("/api/admin/deleteGroup/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const group = [];
        group = Group.findByIdAndDelete(req.params['_id']);
        res.status(200).send({ message: "Xoá nhóm thành công!"});
    } catch (error) {
        next(error);
    }
})

 router.post("/api/admin/removeUser/:userId/fromGroup/:groupId", requireRole(adminRole), async (req, res) => {
    try {
        const group = await Group.findById(req.params["groupId"]);
        if (!group) {
            return res.status(404).send({error: "Nhóm không tồn tại!"});
        }
        const member = await User.findOne({_id: req.params['userId']});
        if (!member) {
            res.status(404).send({error: "Không tìm thấy người dùng này!"});
        } else {
            group.members = group.members.filter(function(mem) { return mem.userId != member._id; }); 
            group.save();
            res.status(200).send({message: "Đã xoá người dùng khỏi nhóm!"});
        }
    } catch (error) {
        next(error);
    }
 })

 router.get('/api/users/me/getAllTasks', requireRole(adminRole), async (req, res) => {
    try {
      const tasks = await Task.find();
      res.status(200).send(tasks);
    } catch (error) {
        next(error);
    }
  })
  
  router.get('/api/users/me/getAllTables', requireRole(adminRole), async (req, res) => {
    try {
      const tables = await Table.find();
      res.status(200).send(tables);
    } catch (error) {
        next(error);
    }
  })

router.use(errorHandler);

module.exports = router;