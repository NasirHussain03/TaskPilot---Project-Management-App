const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');
const { getIO } = require('../utils/socket');
const { sendMailMock } = require('../utils/mailer');

// @desc    Get all tasks for projects the user has access to
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
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

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(`Get Tasks Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Admin only
const createTask = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied: Only Admins can create and assign tasks' });
    }

    const { title, description, status, priority, dueDate, assignedTo, project: projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is creator/member of the project, or Admin
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some((mId) => mId.toString() === req.user._id.toString());
    
    if (!isCreator && !isMember && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied: You do not have permission to add tasks to this project' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate,
      assignedTo: assignedTo || null,
      project: projectId,
    });

    await logActivity(req.user._id, projectId, 'Created Task', `Created task "${task.title}"`);

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role');

    // Live update broadcast
    try {
      getIO().emit('task:created', populatedTask);
    } catch (e) {
      console.warn('Socket broadcast error:', e.message);
    }

    // Simulated email dispatch
    if (task.assignedTo) {
      const assignedUser = await User.findById(task.assignedTo);
      if (assignedUser) {
        await sendMailMock(
          assignedUser.email,
          `TaskPilot Alert: New Task "${task.title}" Assigned`,
          `Hello ${assignedUser.name},\n\nYou have been assigned the task "${task.title}" in the project "${project.title}" by ${req.user.name}.\n\nPriority: ${task.priority}\nDue Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}\n\nCheck your TaskPilot workspace for details.`
        );
      }
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(`Create Task Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Check permissions based on role
    const isAdminUser = req.user.role === 'Admin';
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isMember = project.members.some((mId) => mId.toString() === req.user._id.toString());

    // Members can only update status on tasks assigned to them
    if (!isAdminUser && !isCreator) {
      if (!isAssignee) {
        return res.status(403).json({ error: 'Access Denied: You can only update tasks assigned to you' });
      }
      // Members can only change status — nothing else
      if (title || description !== undefined || priority || dueDate !== undefined || assignedTo !== undefined) {
        return res.status(403).json({ error: 'Access Denied: Members can only update the status of their assigned tasks' });
      }
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo ? task.assignedTo.toString() : null;

    // Admins and project creators can update all fields
    if (isAdminUser || isCreator) {
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      task.assignedTo = assignedTo !== undefined ? (assignedTo === '' ? null : assignedTo) : task.assignedTo;
    }
    // Everyone allowed can update status
    task.status = status || task.status;

    await task.save();

    if (oldStatus !== task.status) {
      await logActivity(req.user._id, task.project, 'Moved Task', `Moved task "${task.title}" to "${task.status}"`);
    } else {
      await logActivity(req.user._id, task.project, 'Updated Task', `Updated task "${task.title}"`);
    }

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role')
      .populate('comments.user', 'name email');

    // Live update broadcast
    try {
      getIO().emit('task:updated', updatedTask);
    } catch (e) {
      console.warn('Socket broadcast error:', e.message);
    }

    // Simulated email dispatches
    // Case 1: Status changed to Completed
    if (oldStatus !== task.status && task.status === 'Completed') {
      const creator = await User.findById(project.createdBy);
      if (creator && creator._id.toString() !== req.user._id.toString()) {
        await sendMailMock(
          creator.email,
          `TaskPilot Notification: Task Completed`,
          `Hello ${creator.name},\n\nThe task "${task.title}" in project "${project.title}" has been completed by ${req.user.name}.`
        );
      }
    }

    // Case 2: Assigned user changed
    const newAssignee = task.assignedTo ? task.assignedTo.toString() : null;
    if (oldAssignee !== newAssignee && newAssignee) {
      const assignedUser = await User.findById(newAssignee);
      if (assignedUser && assignedUser._id.toString() !== req.user._id.toString()) {
        await sendMailMock(
          assignedUser.email,
          `TaskPilot Alert: Task Assigned to You`,
          `Hello ${assignedUser.name},\n\nYou have been assigned the task "${task.title}" in project "${project.title}" by ${req.user.name}.`
        );
      }
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(`Update Task Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Check permissions: only Admin or project creator can delete tasks
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    if (!isCreator && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied: Only Admins or project creators can delete tasks' });
    }

    await Task.findByIdAndDelete(task._id);

    await logActivity(req.user._id, task.project, 'Deleted Task', `Deleted task "${task.title}"`);

    // Live update broadcast
    try {
      getIO().emit('task:deleted', task._id);
    } catch (e) {
      console.warn('Socket broadcast error:', e.message);
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(`Delete Task Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isMember = project.members.some((mId) => mId.toString() === req.user._id.toString());
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isCreator && !isMember && !isAssignee && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied' });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await task.save();

    await logActivity(req.user._id, task.project, 'Added Comment', `Commented on task "${task.title}"`);

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role')
      .populate('comments.user', 'name email');

    // Live update broadcast
    try {
      getIO().emit('task:updated', updatedTask);
    } catch (e) {
      console.warn('Socket broadcast error:', e.message);
    }

    // Simulated email dispatch to assignee
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      const assignedUser = await User.findById(task.assignedTo);
      if (assignedUser) {
        await sendMailMock(
          assignedUser.email,
          `TaskPilot Alert: New Comment on "${task.title}"`,
          `Hello ${assignedUser.name},\n\n${req.user.name} added a comment on your assigned task "${task.title}":\n\n"${text}"`
        );
      }
    }

    res.status(201).json(updatedTask);
  } catch (error) {
    console.error(`Add Comment Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Add attachment to a task
// @route   POST /api/tasks/:id/attachments
// @access  Private
const addAttachment = async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ error: 'Attachment name and url are required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.attachments.push({ name, url });
    await task.save();

    await logActivity(req.user._id, task.project, 'Added Attachment', `Attached "${name}" to task "${task.title}"`);

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role')
      .populate('comments.user', 'name email');

    // Live update broadcast
    try {
      getIO().emit('task:updated', updatedTask);
    } catch (e) {
      console.warn('Socket broadcast error:', e.message);
    }

    res.status(201).json(updatedTask);
  } catch (error) {
    console.error(`Add Attachment Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Remove attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
const removeAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.attachments = task.attachments.filter(
      (a) => a._id.toString() !== req.params.attachmentId
    );

    await task.save();

    await logActivity(req.user._id, task.project, 'Removed Attachment', `Removed an attachment from task "${task.title}"`);

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'title description')
      .populate('assignedTo', 'name email role')
      .populate('comments.user', 'name email');

    // Live update broadcast
    try {
      getIO().emit('task:updated', updatedTask);
    } catch (e) {
      console.warn('Socket broadcast error:', e.message);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(`Remove Attachment Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Member requests to be assigned to a task
// @route   POST /api/tasks/:id/request-assignment
// @access  Member only
const requestAssignment = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      return res.status(400).json({ error: 'Admins can directly assign tasks — no request needed' });
    }

    const task = await Task.findById(req.params.id).populate('project', 'title createdBy');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assignedTo && task.assignedTo.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You are already assigned to this task' });
    }

    const project = await Project.findById(task.project._id || task.project);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Notify all Admins via the notification/mail system
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      await sendMailMock(
        admin.email,
        `TaskPilot: Assignment Request for "${task.title}"`,
        `Hello ${admin.name},\n\n${req.user.name} (${req.user.email}) has requested to be assigned to the task "${task.title}" in project "${project.title}".\n\nPlease review and assign them from the Tasks board.`
      );
    }

    await logActivity(
      req.user._id,
      project._id,
      'Requested Assignment',
      `${req.user.name} requested assignment to task "${task.title}"`
    );

    res.json({ message: 'Assignment request sent to Admins successfully' });
  } catch (error) {
    console.error(`Request Assignment Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  addAttachment,
  removeAttachment,
  requestAssignment,
};
