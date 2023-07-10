const mongoose = require("mongoose");

const chatGroupSchema = mongoose.Schema({
    name:{
        type: String
    },
    messages:[
        {
            messageContent: {
               type: String
            },
            createdDate: {
              type: Date,
               default: Date.now()
            },
            sender:{
                senderId:{
                    type: String
                },
                name:{
                    type:String
                }
            }
        }
    ],
    taskId:{
        type: String
    },
    groupId:{
        type: String
    },
    total_messages:{
        type: Number,
        default: 0
    }
});

const ChatGroup = mongoose.model("ChatGroup", chatGroupSchema);

module.exports = ChatGroup;
