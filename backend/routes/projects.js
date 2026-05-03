const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProject, updateProject,
  approveProject, calculateImpactScore,
  addMilestone, updateMilestone,
  addExpense, addUpdate, flagProject
} = require('../controllers/projectController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, getProjects);
router.post('/', auth, authorize('ngo'), createProject);
router.get('/:id', auth, getProject);
router.put('/:id', auth, authorize('ngo'), updateProject);
router.patch('/:id/approve', auth, authorize('admin'), approveProject);
router.post('/:id/impact', auth, calculateImpactScore);
router.post('/:id/flag', auth, authorize('admin'), flagProject);

// Milestones
router.post('/:id/milestones', auth, authorize('ngo'), addMilestone);
router.patch('/:id/milestones/:milestoneId', auth, authorize('ngo'), updateMilestone);

// Expenses
router.post('/:id/expenses', auth, authorize('ngo'), addExpense);

// Progress updates
router.post('/:id/updates', auth, authorize('ngo'), addUpdate);

module.exports = router;
