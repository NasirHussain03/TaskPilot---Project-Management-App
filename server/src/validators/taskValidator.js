const { body } = require('express-validator');
const validate = require('./validate');

const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').isMongoId().withMessage('A valid Project ID is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Todo', 'In Progress', 'Completed']).withMessage('Status must be Todo, In Progress, or Completed'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Due date must be a valid date'),
  body('assignedTo').optional().custom((value) => {
    if (value === '' || value === null) return true;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Assigned To must be a valid User ID');
    }
    return true;
  }),
  validate,
];

const updateTaskValidator = [
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Todo', 'In Progress', 'Completed']).withMessage('Status must be Todo, In Progress, or Completed'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
  body('dueDate').optional().custom((value) => {
    if (value === '' || value === null) return true;
    if (isNaN(Date.parse(value))) {
      throw new Error('Due date must be a valid date');
    }
    return true;
  }),
  body('assignedTo').optional().custom((value) => {
    if (value === '' || value === null) return true;
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error('Assigned To must be a valid User ID');
    }
    return true;
  }),
  validate,
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
};
