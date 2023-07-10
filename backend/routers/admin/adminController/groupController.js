const Group = require('../../../models/Group');

async function createGroup(groupInfo) {
    try {
        const group = new Group(groupInfo);
        await group.save();
        return group;
    } catch (error) {
        throw new Error(error);
    }
}

async function getAllGroups() {
    try {
        const groups = await Group.find();
        return groups;
    } catch (error) {
        throw new Error(error);
    }
}

async function getGroup(groupId) {
    try {
        const group = await Group.findById(groupId);
        return group;
    } catch (error) {
        throw new Error(error);
    }
}

async function editGroup(groupId, updateInfo) {
    try {
        const filter = {_id: groupId};
        const update = {updateInfo};
        const group = await Group.findOneAndUpdate(filter, update);
        if (!group) throw new Error("Không tìm thấy nhóm");
        return group;
    } catch (error) {
        throw new Error(error);
    }
}

async function deleteGroup(groupId) {
    try {
        const filter = {_id: groupId};
        await Group.findOneAndDelete(filter, function (err, group) {
            if (err){
                throw new Error(err);
            }
            else{
                return group
            }
        })
    } catch (error) {
        throw new Error(error);
    }
}

async function removeUser(userId, groupId) {
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            throw new Error("Nhóm không tồn tại")
        }
        const member = await User.findById(userId);
        if (!member) {
            throw new Error("Người dùng không tồn tại")
        } else {
            group.members = group.members.filter(function(mem) { return mem.userId != member._id; }); 
            group.save();
            return group;
        }
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {createGroup, getAllGroups, getGroup, editGroup, deleteGroup, removeUser};