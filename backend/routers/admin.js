const express = require("express");
const User = require("../models/User");
// const auth = require("../middleware/auth").auth;
const requireRole = require("../middleware/auth").requireRole;

const router = express.Router();

const adminRole = process.env.ROLE_ADMIN;

/*--------------------------------------------------------------------------User Management Start--------------------------------------------------------------------------*/

router.post("api/admin/createUser", requireRole(adminRole), async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body);
        await user.save();
    res.status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("api/admin/updateUser/:_id", requireRole(adminRole), async (req, res) => {    
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
        res.status(500).send(error);
    }
})

router.post("api/admin/deleteUser/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await User.findByIdAndUpdate(req.params['_id'], {
            status: "DELETED" //Change status to "DELETED"
        })
        data.tokens.splice(0, data.tokens.length) //Logout from all devices
        await data.save();
        res.send({message:"Xoá thành công!"});
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get("api/admin/getUser/:_id", requireRole(adminRole), async (req, res) => {
    try {
        const data = await User.findOne({_id: req.params['_id']});
        if(!data){
            res.status(404).send({ error: "id không tồn tại!" });
        }
        res.send(data);
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get("api/admin/getAllUsers", requireRole(adminRole), async (req, res) => {
    try {
        const data = await User.find();
        res.status(201).send(data);
    } catch (error) {
           res.status(500).send(error);
    }
})

/*--------------------------------------------------------------------------User Management Ends--------------------------------------------------------------------------*/

module.exports = router;