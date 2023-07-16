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
    url:{
        type: String
    },
    tasks: [
        {
            taskId: {
                type: String,
                required: true
            }
        }
    ]
});

tableSchema.statics.getMyTables = async function(userId){
    let myTables = await Table.find({"members.userId": userId })
    if(!myTables)
        return {message: "Bạn chưa có bảng!"};
    return myTables;
}

tableSchema.statics.getMyOwnTables = async function(userId){
    let myTables = await Table.find({"owner.userId": userId })
    if(!myTables)
        return {message: "Bạn chưa có bảng!"};
    return myTables;
}

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;