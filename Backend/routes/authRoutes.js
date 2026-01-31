
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/utente', verifyToken, authController.getUtente);
router.put('/utente', verifyToken, authController.updateUtente);

module.exports = router;