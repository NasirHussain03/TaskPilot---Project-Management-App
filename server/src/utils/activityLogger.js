const Activity = require('../models/Activity');

const logActivity = async (userId, projectId, action, details) => {
  try {
    if (!userId || !projectId || !action) return;
    await Activity.create({
      user: userId,
      project: projectId,
      action,
      details,
    });
  } catch (error) {
    console.error(`Log Activity Error: ${error.message}`);
  }
};

module.exports = logActivity;
