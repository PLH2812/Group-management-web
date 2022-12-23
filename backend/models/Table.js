const mongoose = require("mongoose");

const tableSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    groupId: {
        type: String,
        required: true
    },
    owner:[
        {
            userId: {
                type: String
            },
            name: {
                type: String
            }
        }
    ],
    members: [
        {
            userId: {
                type: String
            },
            name: {
                type: String
            }
        }
    ],
    tasks: [
        {
            assignedTo:{
                userId: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                }
            },
            status:{
                type: String,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            },
            endDate: {
                type: Date,
                required: true
            }
        }
    ]
});

tableSchema.statics.getMyTables = async function(userId){
    let myTables = await Table.find({"members.userId": userId })
    if(!myTables)
        return {message: "Bạn chưa có bảng!"};
    return myGroups;
}

tableSchema.statics.getMyTasks = async function(userId){
    let myTasks = await Table.find({"tasks.assignedTo.userId": userId })
    if (!myTasks)
        return {message: "Bạn không có task nào!"}
    return myTasks;
}

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;