const express = require("express");
const User = require("../../models/User");
const auth = require("../../middleware/auth").auth;
const checkStatus = require("../../middleware/checkUserStatus");

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
        res.status(200).send({message: "Đăng ký thành công!"});
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
    
    try {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.clearCookie("JWT").status(200).send({ message: "Đăng xuất thành cồng!"});
    } catch (error) {
        res.status(500).send(error);
    }
  });

  module.exports = router;