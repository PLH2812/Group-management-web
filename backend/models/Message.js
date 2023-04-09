const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    messages:[
        {
            messageInfo: {
               type: String,
                required: true
            },
            createdDate: {
              type: Date,
               default: Date.now()
            },
            senderId:{
                type: String,
                required: true
            }
        }
    ],
    groupId: {
        type: String
    },
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
            joinedDate: {
                type: Date,
                default: Date.now()
            }
        }
    ]
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
