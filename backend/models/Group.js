const mongoose = require("mongoose");
const Task = require("./Task");

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
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

groupSchema.statics.getMyGroups = async function(userId){
    let myGroups = await Group.find({"owner.userId": userId })
    if(!myGroups)
        return {message: "Bạn chưa có nhóm!"};
    return myGroups;
}

groupSchema.statics.setGroupOwner = async function(userId, userName){
    let group = this;
    const ownerInfo = ({userId: userId, name: userName});
    group.owner = group.owner.concat({ownerInfo});
    await group.save();
}

//TODO: delete task before delete group

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
