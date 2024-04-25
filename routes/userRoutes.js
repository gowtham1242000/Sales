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
router.get('/searchitem', userController.searchitem);
router.get('/searchorder', userController.searchorder);
router.get('/searchshop', userController.searchshop);
router.get('/getStatus', userController.getStatus);
router.get('/getearning',userController.getEarning);
router.get('/getDeliveries/:id',userController.getDeliveries);
router.post('/createReturnOrder/:id', userController.createReturnOrder);
router.get('/getReturnOrder/:userId', userController.getReturnOrders)
//router.get('/getOrderItems/:id', userController.getOrderItems);
router.get('/searchAndFilterShops', userController.searchAndFilterShops);
router.get('/getOrderDetails/:orderId', userController.getOrderDetails);
router.post('/userSignout/:userId', userController.userSignout);
router.get('/getLocation',userController.getLocation);
router.get('/getAllReturnOrders',userController.getAllReturnOrders);
router.get('/getTotalItemSales',userController.getTotalItemSales);
//router.get('/getSearchFilter',userController.getSearchFilter);
module.exports = router;
