const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { projectValidator } = require('../validators/projectValidator');

// All project routes require a user to be authenticated
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(projectValidator, createProject);

router.route('/:id')
  .put(projectValidator, updateProject)
  .delete(deleteProject);

module.exports = router;
