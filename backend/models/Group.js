const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    owner: [
        {
          userId: {
            type: String
          },
          name: {
            type: String
          }
        }
    ],
    createdDate: {
        type: Date,
        default: Date.now()
    },
    privacy: {
        type: String,
        default: 'PUBLIC'
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

groupSchema.statics.getMyGroups = async function(userId){
    const myGroups = await Group.find(
    { $or: 
        [{"owner": { "$elemMatch": { "userId": userId }}}, 
        {"members": {"$elemMatch": {"userId": userId}}}]
    }).exec();
    if(!myGroups)
        return {message: "Bạn chưa có nhóm!"};
    return myGroups;
}

groupSchema.statics.getMyOwnGroups = async function(userId){
    let myGroups = await Group.find({"owner.userId": userId })
    if(!myGroups)
        return {message: "Bạn chưa có nhóm!"};
    return myGroups;
}

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
