// Backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { verifyToken } = require('../middleware/authMiddleware');


router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getUserOrders);
router.get('/:id', verifyToken, orderController.getOrderById);

module.exports = router;