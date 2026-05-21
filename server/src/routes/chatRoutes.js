const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/chat
// @desc    Get recent chat messages
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Send in chronological order
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching chat logs' });
  }
});

module.exports = router;
