const express = require('express');
const router = express.Router();
const userCtrl = require('../controller/UserController');

// @route   POST /api/users/register
router.post('/register', userCtrl.register);

// @route   GET /api/users/:id
router.get('/:id', userCtrl.viewUser);

// @route   PUT /api/users/update/:id
router.put('/update/:id', userCtrl.updateProfile);

// @route   POST /api/users/forgot-password
router.post('/forgot-password', userCtrl.forgotPassword);

// @route   POST /api/users/reset-password
router.post('/reset-password', userCtrl.resetPassword);
router.post('/login', userCtrl.login);
module.exports = router;