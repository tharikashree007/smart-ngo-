const express = require('express');
const router = express.Router();
const { getPlatformStats, getAllUsers, approveNGO, flagUser, getFraudAlerts, getAllDonations } = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.use(auth, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/approve-ngo', approveNGO);
router.patch('/users/:id/flag', flagUser);
router.get('/fraud-alerts', getFraudAlerts);
router.get('/donations', getAllDonations);

module.exports = router;
