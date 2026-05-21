const Project = require('../models/Project');
const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');

// @desc    Get all projects for the logged-in user (created by or member of)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      query = {
        $or: [
          { createdBy: req.user._id },
          { members: req.user._id }
        ]
      };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(`Get Projects Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Admin only
const createProject = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied: Only Admins can create projects' });
    }

    const { title, description, members } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: members || [],
    });

    await logActivity(req.user._id, project._id, 'Created Project', `Created project "${project.title}"`);

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error(`Create Project Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    let project = await Project.findById(req.targetProjectId || req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions: only creator or admin can update project
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied: Only project creator or Admin can update project' });
    }

    project.title = title || project.title;
    project.description = description !== undefined ? description : project.description;
    project.members = members || project.members;

    await project.save();

    await logActivity(req.user._id, project._id, 'Updated Project', `Updated project "${project.title}"`);

    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedProject);
  } catch (error) {
    console.error(`Update Project Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions: only creator or admin can delete project
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Access Denied: Only project creator or Admin can delete project' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await logActivity(req.user._id, project._id, 'Deleted Project', `Deleted project "${project.title}" and all associated tasks`);

    // Delete the project
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and all associated tasks deleted successfully' });
  } catch (error) {
    console.error(`Delete Project Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
};
