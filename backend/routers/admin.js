const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/admin/createUser", auth, async (req, res) => {
    // Create a new user
    if (req.user.role == "ADMIN") {
        try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send({user});
        } catch (error) {
        res.status(400).send(error);
        }
    } else {
        res.status(401).send({ error: "Không được phép truy cập" });
    }
});

router.post("/admin/updateUser/:_id", auth, async (req, res) => {
    if (req.user.role == "ADMIN") {
        try {
            const data = await User.findByIdAndUpdate(req.params['_id'], {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role 
            })
            await data.save();
            res.send();
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(401).send({ error: "Không được phép truy cập" });
    }
})

router.get("/admin/getUser/:_id", auth, async (req, res) => {
    if (req.user.role == "ADMIN"){
        try {
            const data = await User.findOne({_id: req.params['_id']});
            if(!data){
                res.status(404).send({ error: "id không tồn tại!" });
            }
            res.send(data);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(401).send({ error: "Không được phép truy cập" });
    }
})

router.get("/admin/getAllUsers", auth, async (req, res) => {
    if (req.user.role == "ADMIN"){
        try {
            const data = await User.find();
            res.send(data);
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(401).send({ error: "Không được phép truy cập" });
    }
})

module.exports = router;