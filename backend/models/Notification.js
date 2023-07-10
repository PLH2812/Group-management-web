const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    taskId:{
        type:String
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    readAt:{
        type: Date
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;