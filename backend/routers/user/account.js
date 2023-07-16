const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const {tryCatch} = require("../../utils/tryCatch")
const User = require("../../models/User");
const auth = require("../../middleware/auth").auth;
const mailer = require('../../utils/sendMail');
const uploadFile = require('../../middleware/upload');

const router = express.Router();
  router.post("/api/users/register", tryCatch(async (req, res) => {
    // Create a new user
    const user = new User(req.body);
    const unavailable = await User.findOne({email: user.email});
    if (!unavailable){
      // verification mail
      const otp = `${1000 + Math.floor(Math.random() * 9000)}`;
      mailer.sendMail(user.email, "Xác thực email",
       `<h1>Bạn đã đăng ký tài khoản thành công! </br></h1>
       <p>Vui lòng nhập otp sau để xác thực email:
       </br> ${otp}</p>`)
        
      user.otp = otp;
      user.role = process.env.ROLE_USER;
      user.status = process.env.USER_STATUS_ACTIVE;
      await user.save();
      return res.status(200).send("Đăng ký thành công!");
    } else {
      throw new Error("Người dùng đã tồn tại!");
    }
  }));

  router.post("/api/users/sendVerificationOtp/:email", tryCatch (async (req, res) => {
      const user = await User.findOne({email: user.email});
      if (user){
        const otp = `${1000 + Math.floor(Math.random() * 9000)}`;
        mailer.sendMail(user.email, "Xác thực email",
         `<h1>Bạn đã đăng ký tài khoản thành công! </br></h1>
         <p>Vui lòng nhập otp sau để xác thực email:
         </br> ${otp}</p>`)
        
        user.otp = otp;
        await user.save();
        return res.status(200).send("Đã gửi otp thành công!");
      } else {
        throw new Error({error: 'Email không tồn tại!'});
      }
  }));
  
  router.post("/api/users/verification/:uid", tryCatch (async(req, res) => {
      let user = await User.findOne({'_id': req.params['uid']});
      const inputOtp = req.body.otp;
      const otpCheck = await mailer.otpCheck(inputOtp, user.otp)
      if (otpCheck === true) {
        const filter = {'_id': req.params['uid']};
        const update = {'verifiedAt': Date.now()};
        User.findOneAndUpdate(filter, update, (err) => {
          if(!err) {
              return res.status(200).send("Xác thực thành công!");
          }
          else 
            throw new Error(err.message);
        }) 
      }
      else 
        throw new Error("Otp không đúng, vui lòng thử lại!")
  }));

  router.post("/api/users/forgotPassword/:email", tryCatch (async (req, res) => {
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
        throw new Error("Email không tồn tại, vui lòng đăng ký tài khoản!");
      }
  }));

  router.post("/api/users/checkOtp/:uid", tryCatch( async (req, res) => {
      const inputOtp = req.body.otp;
      let user = await User.findOne({_id: req.params['uid']});
      const otpCheck = await mailer.otpCheck(inputOtp, user.otp);
      if (otpCheck === true) 
        return res.status(200).send("Kiểm tra otp thành công!");
      else
      throw new Error("Otp không đúng, vui lòng thử lại sau!");
  }))

  router.post("/api/users/resetPassword/:uid", tryCatch (async (req, res) => {
      let user = await User.findOne({_id: req.params['uid']});
      const newPassword = req.body.password;
      user.password = newPassword;
      await user.save();
      return res.status(200).send("Đặt lại mật khẩu thành công!");
  }))

  router.post('/api/users/login',tryCatch (async(req, res) => {
    //Login a registered user
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (user == undefined) {
      throw new Error("Thông tin đăng nhập không hợp lệ");
    }
    if (user.status == process.env.USER_STATUS_DELETED)
      throw new Error( "Người dùng đã bị xoá!");
    if (!user.verifiedAt) {
        throw new Error('Vui lòng xác thực email!');
    }
    const token = await user.generateAuthToken();
    res
      .cookie("JWT", token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
      .status(200)
      .send({
        message: 'Đăng nhập thành công',
        _id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        avatarUrl: user.avatarUrl})
  }));
  
  router.get('/api/users/getUser/:userEmail', tryCatch (async(req,res,next) => {
      const userEmail = req.params.userEmail;
      const users = await User.search(userEmail)
        if (users.length === 0) {
          res.status(400).send("Không tìm thấy kết quả nào!");
        }
        else {
          users.forEach(user => {
            res.status(200).send({
              _id: user._id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl
            });
          });
          
        }
  }))
  
  router.get('/api/users/me', auth, tryCatch (async(req, res) => {
      // View logged in user profile
      const data = {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl
      };
      res.send(data);
  }))
  
  router.patch('/api/users/me', auth, tryCatch (async(req, res) => {
      // Update user profile
      const user = await User.findById(req.user._id);
      user.update({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth
      })
      await user.save();
      res.status(200).send({ message: "Cập nhật thành cồng!"});
  }))

  router.post('/api/users/upload', auth,  async(req, res, next) => {
    try {
      await uploadFile(req, res);

      if (req.file == undefined){
        throw new Error("Hãy gửi lên một file!")
      }

      res.status(200).send({
        message: "Upload thành công file!", 
        filename: req.file.originalname,
      });
    }
    catch (error){
      if (error.code == "LIMIT_FILE_SIZE") {
        return res.status(500).send(
          "File không được lớn hơn 10MB!"
        );
      }
      next(error);
    }
  })

  router.post('/api/users/me/editProfile', auth, async(req, res, next) => {
    try {
      const update = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        avatarUrl: req.body.avatarUrl
      }
      await User.findByIdAndUpdate(req.user._id, update);
      res.status(200).send({ message: "Cập nhật thành cồng!", update});
    } catch (error) {
      next(error);
    }
  })
  
  router.post("/api/users/me/logout", auth, tryCatch (async (req, res) => {
      // Log user out of the application
        req.user.tokens = req.user.tokens.filter(token => {
          return token.token != req.token;
        });
        await req.user.save();
        res.clearCookie("JWT").status(200).send({ message: "Đăng xuất thành cồng!"});
  }));
  
  router.post('/api/users/me/logoutall', auth, tryCatch(async(req, res) => {
        req.user.tokens.splice(0, req.user.tokens.length);
        await req.user.save();
        res.clearCookie("JWT").status(200).send({ message: "Đăng xuất thành cồng!"});
  }));

  router.post("/api/users/loginWithSocial", tryCatch(async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (req.body.email_verified === true){
      if (!user) {
        user = new User({
          email: req.body.email,
          name: req.body.name,
          verified: Date.now(),
          refresh_token: req.body.refresh_token
        })
        await user.save();
      }
      const token = await user.generateAuthToken();
      user.refresh_token = req.body.refresh_token;
      console.log(req.body.refresh_token);
      await user.save();
      res
        .cookie("JWT", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
        .status(200)
        .send({
          message: 'Đăng nhập thành công',
          _id: user._id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          avatarUrl: user.avatarUrl})
    }
    else {throw new Error('Tài khoản này chưa được xác thực!');}
  }))

  router.use(errorHandler)

  module.exports = router;