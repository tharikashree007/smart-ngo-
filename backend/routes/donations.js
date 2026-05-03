const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getProjectDonations
} = require('../controllers/donationController');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, authorize('donor'), createDonation);
router.get('/', auth, getDonations);
router.get('/project/:projectId', auth, getProjectDonations);
router.get('/:id/receipt', auth, authorize('donor'), require('../controllers/donationController').getReceipt);

module.exports = router;
