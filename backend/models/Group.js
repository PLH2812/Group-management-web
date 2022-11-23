const mongoose = require("mongoose");
const Task = require("./Task");

const groupSchema = mongoose.Schema({
    owner: [
        {
          userId: {
            type: String,
            required: true
          },
          name: {
            type: String,
            required: true
          }
        }
    ],
    status:{
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now()
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
    ],
    tasks: [
        {
            taskId: {
                type: String,
                required: true
            }
        }
    ]
});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
