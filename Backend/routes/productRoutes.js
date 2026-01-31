const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/category/:category', productController.getByCategory);
router.get('/brand/:brand', productController.getByBrand);
router.get('/vetrina', productController.getVetrina);
router.get('/categories', productController.getAllCategories);
router.get('/brands', productController.getAllBrands);





//deve rimanere come ultima riga perchè intercetta qualsiasi richiesta gnerica
router.get('/:id', productController.getById);

module.exports = router;