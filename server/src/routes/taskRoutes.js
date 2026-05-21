const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, addComment, addAttachment, removeAttachment, requestAssignment } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { createTaskValidator, updateTaskValidator } = require('../validators/taskValidator');

// All task routes require a user to be authenticated
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTaskValidator, createTask);

router.route('/:id')
  .put(updateTaskValidator, updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);
router.post('/:id/attachments', addAttachment);
router.delete('/:id/attachments/:attachmentId', removeAttachment);
router.post('/:id/request-assignment', requestAssignment);

module.exports = router;
