const mongoose = require("mongoose");

const chatGroupSchema = mongoose.Schema({
    name:{
        type: String
    },
    description:{
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
            senderId:{
                type: String
            }
        }
    ],
    members: [
        {
            userId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            isOwner:{
                type: Boolean
            },
            joinedDate: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    createdDate:{
        type: Date,
        default: Date.now()
    },
    total_messages:{
        type: Number,
        default: 0
    }
});

const ChatGroup = mongoose.model("ChatGroup", chatGroupSchema);

module.exports = ChatGroup;
