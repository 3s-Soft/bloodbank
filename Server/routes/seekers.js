const express = require('express');
const router = express.Router();
const { getAllSeekers, addSeeker } = require('../controllers/seekerController');
const { authenticate, authorize } = require('../auth/jwt');

router.get('/', getAllSeekers);
router.post('/', authenticate, authorize(['seeker']), addSeeker);

module.exports = router;
