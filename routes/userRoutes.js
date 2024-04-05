const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');


router.post('/userlogin',userController.userSignin);
router.post('/createshop/:id', userController.createShop);
router.post('/createorder/:id', userController.createOrder);
router.put('/updateshop/:id',userController.updateShop);
router.delete('/deleteshop/:id',userController.deleteShop);
router.delete('/deleteorder/:id',userController.deleteOrder);
router.put('/updateorder/:id', userController.updateOrder);
router.put('/userProfileUpdate/:id', userController.updateUser);
router.get('/getuserprofile/:id', userController.getProfile);
router.get('/getshop/item', userController.getshopitem);
router.get('/getOrderslist/:userId', userController.getOrders);
router.get('/getshops', userController.getShops);
router.get('/getItems', userController.getItems);
router.get('/getshopsDetails/:id', userController.getShopsDetails);

module.exports = router;
