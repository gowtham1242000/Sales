const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');

router.post('/shop/:id', userController.createShop);
router.post('/order', userController.createOrder);
router.put('/shop/:id',userController.updateShop);
router.delete('/shop/:id',userController.deleteShop);
router.delete('/order/:id',userController.deleteOrder);
router.put('/order/:id', userController.updateOrder);
router.get('/profile/:id', userController.getProfile);


module.exports = router;