const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, approveUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../auth/jwt');

router.post('/register', register);
router.post('/login', login);
router.get('/', authenticate, authorize(['admin', 'super_admin']), getAllUsers);
router.put('/approve/:id', authenticate, authorize(['admin', 'super_admin']), approveUser);

module.exports = router;
