const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error(`Get Users Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, password, phone, bio, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (address !== undefined) user.address = address;

    if (password) {
      user.password = password; // pre-save hook will hash it
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      address: user.address,
    });
  } catch (error) {
    console.error(`Update Profile Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Check if Admin is trying to delete themselves
    if (userIdToDelete.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }

    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Remove user from all projects' members list
    await Project.updateMany(
      { members: userIdToDelete },
      { $pull: { members: userIdToDelete } }
    );

    // 2. Unassign tasks that were assigned to the deleted user
    await Task.updateMany(
      { assignedTo: userIdToDelete },
      { $set: { assignedTo: null } }
    );

    // 3. Delete the user
    await User.findByIdAndDelete(userIdToDelete);

    res.json({ message: 'User deleted and task assignments updated successfully' });
  } catch (error) {
    console.error(`Delete User Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getUsers,
  updateProfile,
  deleteUser,
};
