const mongoose = require("mongoose");

const chatGroupSchema = mongoose.Schema({
    messages:[
        {
            messageContent: {
               type: String
            },
            createdDate: {
              type: Date,
               default: Date.now()
            },
            senderId:{
                type: String
            }
        }
    ],
    taskId:{
        type: String,
        required: true
    },
    total_messages:{
        type: Number,
        default: 0
    }
});

const ChatGroup = mongoose.model("ChatGroup", chatGroupSchema);

module.exports = ChatGroup;
