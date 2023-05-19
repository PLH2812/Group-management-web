const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const auth = require("../../middleware/auth").auth;
const checkStatus = require("../../middleware/checkUserStatus");
const mailer = require('../../utils/sendMail');

const router = express.Router();

  router.post("/api/users/register", async (req, res) => {
    // Create a new user
    try {
      const user = new User(req.body);
      const unavailable = await User.findOne({email: user.email});
      if (!unavailable){
        // verification mail
        bcrypt.hash(user._id, 8).then((hashedId) => {
          mailer.sendMail(user.email, "Xác thực email",
           `<h1>Bạn đã đăng ký tài khoản thành công! </br></h1>
           <p>Vui lòng nhấp vào link phía dưới để xác thực email</p>
           <a href="${process.env.APP_URL}/verification?token=${hashedId}&uid=${user._id}"> Xác thực email ngay!</a>`)
        });
        
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
  
  router.post("api/users/verification/:uid/:hashedId", async(req, res) => {
    try {
      bcrypt.compare((req.params['uid'], req.params['hashedId']), (err, result) => {
        if (result == true) {
          const filter = {'_id': req.params['uid']};
          const update = {'verifiedAt': Date.now()};
          User.findOneAndUpdate(filter, update, () => {
            if(!err) {
              return res.status(200).send("Xác thực thành công!");
            }
            else 
              return res.status(500).send(err.message);
          }) 
        }
      })
    } catch (error) {
      res.status(400).send(error.message);
    }
  })

  router.post("api/users/forgotPassword/:email", async (req, res) => {
    try {
      let user = await User.findOne({email: req.params['email']});
      if (user) {
        const otp = `${1000 + Math.floor(Math.random() * 9000)}`;
        mailer.sendMail(req.params['email'], "Đặt lại mật khẩu",
             `<h1>Mã otp đặt lại mật khẩu của bạn là:</h1>
              <h2>${otp}</h2>`);
        user.otp = otp;
        await user.save();
        return res.status(200).send("Đã gửi mã otp đặt lại mật khẩu, vui lòng kiểm tra email!");
      }
      else {
        return res.status(404).send("Email không tồn tại, vui lòng đăng ký tài khoản!");
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  router.post("api/users/resetPassword/:uid", async (req, res) => {
    try {
      const inputOtp = req.body.otp;
      let user = await await User.findOne({_id: req.params['uid']});
      if (user.otp === inputOtp) {
        const newPassword = req.body.password;
        
        user.password = newPassword;
        await user.save();
        return res.status(200).send("Đặt lại mật khẩu thành công!");
      }
      else
        return res.status(404).send("Otp không đúng, vui lòng thử lại sau!");
    } catch (error) {
      res.status(400).send(error.message);
    }
  })

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