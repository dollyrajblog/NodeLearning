const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Create or fetch a 1:1 conversation
router.post('/conversation', async (req, res) => {
  const { userId, peerId } = req.body; // from auth/user lookup
  let convo = await Conversation.findOne({ participants: { $all: [userId, peerId] }});
  if (!convo) {
    convo = await Conversation.create({ participants: [userId, peerId] });
  }
  res.json(convo);
});

// List user conversations
router.get('/conversations', async (req, res) => {
  const userId = req.user.id;
  const convos = await Conversation.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .populate('participants', 'name avatar');
  res.json(convos);
});

// Paginated messages
router.get('/messages/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const { before, limit = 30 } = req.query;
  const query = { conversation: conversationId };
  if (before) query.createdAt = { $lt: new Date(before) };
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  res.json(messages.reverse());
});

// Add this to your router
router.post('/messages', async (req, res) => {
  const { conversationId, senderId, text } = req.body;

  if (!conversationId || !senderId || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text
    });

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
      lastMessage: text
    });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = { router };
