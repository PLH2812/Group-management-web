const User = require("../models/User");

const checkStatus = async(req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if (user == undefined) {
        throw new Error("Thông tin đăng nhập không hợp lệ");
    }
    if (user.status == process.env.USER_STATUS_DELETED)
        throw new Error( "Người dùng đã bị xoá!");
    else
        req.user = user;
        next();
};

module.exports = checkStatus;