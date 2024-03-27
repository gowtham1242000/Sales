const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');


router.post('/admin/singup', adminController.createAdmin);
router.post('/admin/signin', adminController.signUser);
router.post('/createUser/:id', adminController.createUser);
router.post('/createItem', adminController.createItem);
router.put('/updateItem/:id', adminController.updateItem);
router.delete('/deleteItem/:id', adminController.deleteItem);





module.exports = router;
