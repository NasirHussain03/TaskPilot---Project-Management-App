const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @desc    Get recent notifications/emails sent
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(30);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Server error marking notifications read' });
  }
});

module.exports = router;
