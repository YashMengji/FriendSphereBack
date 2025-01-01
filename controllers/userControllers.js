const userModel = require('../models/users');

async function getUsers (req, res) { // API to get all users
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(400).send(error.message);
  }
}

async function sendRequest (req, res) {
  try {
    const { receiverId } = req.body;
    const senderId = req.signData.userId;

    const sender = await userModel.findById(senderId);
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

async function acceptRequest (req, res) {
  try {
    const { senderId } = req.body;
    const receiverId = req.signData.userId;

    const receiver = await userModel.findById(receiverId);
    const sender = await userModel.findById(senderId);

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

async function rejectRequest (req, res) {
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

async function unFriend (req, res) {
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

module.exports = { getUsers, sendRequest, acceptRequest, rejectRequest, unFriend };