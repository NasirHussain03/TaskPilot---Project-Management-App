const Activity = require('../models/Activity');
const Project = require('../models/Project');

// @desc    Get recent activity logs for user's projects
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({});
    } else {
      projects = await Project.find({
        $or: [{ createdBy: req.user._id }, { members: req.user._id }],
      });
    }

    const projectIds = projects.map((p) => p._id);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name email role')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(activities);
  } catch (error) {
    console.error(`Get Activities Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getActivities,
};
