const express = require("express");
const errorHandler = require("../../middleware/errorHandler")
const {tryCatch} = require("../../utils/tryCatch")
const Notification = require("../../models/Notification")
const auth = require("../../middleware/auth").auth

const router = express.Router();

router.post("/api/users/createNotification", auth, tryCatch(async (req, res) => {
    const notification = new Notification(req.body);
    notification.save();
    return res.status(200).send("Tạo thông báo thành công!");
}))

router.get("/api/users/getNotifications", auth, tryCatch(async (req, res) => {
    const uid = req.user._id;
    const notifications = await Notification.find({userId: uid}).sort({createdAt: -1});
    var badge = 0;
    notifications.forEach(notification => {
        if (notification.readAt === undefined) { badge = badge + 1 }
    })
    return res.status(200).send({notifications, badge});
}))

router.get("/api/users/getNotification/:notificationId", auth, tryCatch(async (req, res) => {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) throw new Error("Không tìm thấy thông báo!");
    notification.readAt = Date.now();
    await notification.save();
    return res.status(200).send(notification);
}))

router.patch("/api/users/updateNotification/:notificationId", tryCatch(async (req, res) => {
    const filter = {_id: req.params.notificationId};
    const update = req.body;
    Notification.findOneAndUpdate(filter, update, (err, docs) => {
        if (err) {
            throw new Error(err);
        }
        else {
            return res.status(200).send("Cập nhật thành công!");
        }
    })
}))

router.delete("/api/users/deleteNotification/:notificationId", auth, tryCatch(async (req, res) => {
    const notificationId = req.params.notificationId;
    Notification.findOneAndDelete({_id: notificationId }, function (err, docs) {
        if (err){
            throw new Error(err);
        }
        else{
            return res.status(200).send("Xoá thành công thông báo: ", docs);
        }
    });
}))

router.use(errorHandler);

module.exports = router;