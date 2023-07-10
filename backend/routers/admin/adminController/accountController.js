const User = require('../../../models/User');

async function createUser(userInfo) {
    try {
        const user = new User(userInfo);
        await user.save();
        return user;
    } catch (error) {
        throw new Error(error);
    }
}

async function editUser(userId, updateInfo) {
    try {
        const filter = {_id: userId};
        const update = {updateInfo};
        const user = await User.findOneAndUpdate(filter, update);
        if (!user) throw new Error("Không tìm thấy người dùng");
        return user;
    } catch (error) {
        throw new Error(error);
    }
}

async function logoutAll(userId){
    try {
        const user = await User.findById(userId);
        user.tokens.splice(0, data.tokens.length);
        await user.save();
    } catch (error) {
        throw new Error(error);
    }
}

async function deleteUser(userId){
    try {
        const filter = {_id: userId};
        const update = {status: "DELETED"};
        const user = await User.findOneAndUpdate(filter, update);
        if (!user) throw new Error("Không tìm thấy người dùng");
        return user;
    } catch (error) {
        throw new Error(error);
    }
}

async function getUser(userId){
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("Không tìm thấy người dùng");
        return user;
    } catch (error) {
        throw new Error(error);
    }
}

async function getAllUsers(){
    try {
        const data = await User.find();
        return data;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {createUser, editUser, logoutAll, deleteUser, getUser, getAllUsers};