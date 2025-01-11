const userModel = require('../models/users');

async function getUsers(req, res) { // API to get all users
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function sendRequest(req, res) {
  try {
    const { receiverId } = req.body;
    const senderId = req.signData.userId;

    const sender = await userModel.findById(senderId);
    if (sender.friendRequestsSent.includes(receiverId)) {
      return res.status(400).json({ message: "Request already sent" });
    }
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ message: "You are already friend with this user" });
    }
    sender.friendRequestsSent.push(receiverId);
    await sender.save();

    const receiver = await userModel.findById(receiverId);
    receiver.friendRequestsReceived.push(senderId);
    await receiver.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function acceptRequest(req, res) {
  try {
    const { senderId } = req.body;
    const receiverId = req.signData.userId;

    const receiver = await userModel.findById(receiverId);
    const sender = await userModel.findById(senderId);

    if (receiver.friends.includes(senderId)) {
      return res.status(400).json({ message: "You are already friend with this user" });
    }
    if (!receiver.friendRequestsReceived.includes(senderId)) {
      return res.status(400).json({ message: "No request found" });
    }

    receiver.friends.push(senderId);
    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(id => id != senderId);
    await receiver.save();

    sender.friends.push(receiverId);
    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id != receiverId);
    await sender.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function rejectRequest(req, res) {
  try {
    const { senderId } = req.body;
    const receiverId = req.signData.userId;

    const receiver = await userModel.findById(receiverId);
    const sender = await userModel.findById(senderId);

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(id => id != senderId);
    await receiver.save();

    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id != receiverId);
    await sender.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function unFriend(req, res) {
  try {
    const { receiverId } = req.body;
    const senderId = req.signData.userId;

    const sender = await userModel.findById(senderId);
    const receiver = await userModel.findById(receiverId);

    sender.friends = sender.friends.filter(id => id != receiverId);
    await sender.save();

    receiver.friends = receiver.friends.filter(id => id != senderId);
    await receiver.save();

    res.send(true);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function removeRequest(req, res) {
  try {
    const { receiverId } = req.body;
    const senderId = req.signData.userId;

    const sender = await userModel.findById(senderId);
    const receiver = await userModel.findById(receiverId);

    sender.friendRequestsSent = sender.friendRequestsSent.filter(id => id != receiverId);
    await sender.save();

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(id => id != senderId);
    await receiver.save();

    res.send(true);
  }
  catch (error) {
    return res.status(400).send(error.message);
  }
}

async function editUser(req, res) {
  try {
    const userData = {};
    if (req.body.fname !== "" || req.body.fname != null) {
      userData.fname = req.body.fname
    }
    if (req.body.lname !== "" || req.body.lname != null) {
      userData.lname = req.body.lname
    }
    if (req.body.email !== "" || req.body.email != null) {
      userData.email = req.body.email
    }
    if (req.body.password !== "" || req.body.password != null) {
      userData.password = req.body.password
    }
    if (req.file?.path !== "" && req.file?.path != null) {
      userData.image = req.file.path
    }
    if(req.body.username !== "" || req.body.username != null){
      userData.username = req.body.username
    }
    console.log(userData)
    const user = await userModel.updateOne({ _id: req.signData.userId}, userData);
    const updatedUser = await userModel.findById(req.signData.userId);
    console.log(updatedUser)
    return res.status(201).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "Edit user " + error.stack })
  }
}

module.exports = { getUsers, sendRequest, acceptRequest, rejectRequest, unFriend, removeRequest, editUser };