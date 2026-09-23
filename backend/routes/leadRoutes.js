const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createLead, getLeads, updateLeadStatus, deleteLead } = require('../controllers/leadController');

const validateLeadCreate = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 7 }).withMessage('Valid phone number is required'),
  body('status').optional().isIn(['new', 'contacted', 'converted']).withMessage('Status is invalid'),
  body('assignedTo').trim().notEmpty().withMessage('Assigned user is required'),
  validateRequest,
];

const validateLeadStatus = [
  param('id').isMongoId().withMessage('Invalid lead id'),
  body('status').isIn(['new', 'contacted', 'converted']).withMessage('Status must be new, contacted, or converted'),
  validateRequest,
];

const validateLeadQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validateRequest,
];

router.use(auth);
router.get('/', validateLeadQuery, getLeads);
router.post('/', validateLeadCreate, createLead);
router.patch('/:id/status', validateLeadStatus, updateLeadStatus);
router.delete('/:id', [param('id').isMongoId().withMessage('Invalid lead id'), validateRequest], deleteLead);

module.exports = router;