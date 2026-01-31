
const express = require('express');
const router = express.Router();
const cartController = require('../controller/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.addOrUpdateItem);
router.delete('/remove/:prodottoId', verifyToken, cartController.removeItem);
router.put('/update', verifyToken, cartController.updateItemQuantity);

module.exports = router;