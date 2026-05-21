const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, updateProfile, deleteUser } = require('../controllers/userController');

// Get all users
router.get('/', protect, getUsers);

// Update current user profile
router.put('/profile', protect, updateProfile);

// Delete user (Admin only)
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
