const { body } = require('express-validator');
const validate = require('./validate');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member'),
  validate,
];

const loginValidator = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
};
