const express = require('express');
const router = express.Router();
const indirizziController = require('../controller/indirizziController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, indirizziController.aggiungiIndirizzo);
router.get('/', verifyToken, indirizziController.getIndirizzi);
router.put('/', verifyToken, indirizziController.aggiornaIndirizzo);
router.post('/predefinito', verifyToken, indirizziController.setIndirizzoPredefinito);
router.delete('/:id', verifyToken, indirizziController.eliminaIndirizzo);

module.exports = router;