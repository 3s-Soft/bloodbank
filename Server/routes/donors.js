const express = require('express');
const router = express.Router();
const { getAllDonors, addDonor } = require('../controllers/donorController');
const { authenticate, authorize } = require('../auth/jwt');

router.get('/', getAllDonors);
router.post('/', authenticate, authorize(['donor']), addDonor);

module.exports = router;
