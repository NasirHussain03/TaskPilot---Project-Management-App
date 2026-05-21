const { body } = require('express-validator');
const validate = require('./validate');

const projectValidator = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').optional().trim(),
  body('members').optional().isArray().withMessage('Members must be an array of user IDs'),
  body('members.*').optional().isMongoId().withMessage('Each member must be a valid user ID'),
  validate,
];

module.exports = {
  projectValidator,
};
