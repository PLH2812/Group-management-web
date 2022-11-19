const User = require("../models/User");

const checkStatus = async(req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    if(user.status == "DELETED")
        res.status(401).send({ error: "Người dùng đã bị xoá!"})
    else
        req.user = user;
        next();
};

module.exports = checkStatus;