// const { Users, Shop } = require('../models'); // Import User and Shop models
const fs = require('fs');
const util =require('util');
const exec = util.promisify(require('child_process').exec);
const User = require('../models/Users');
const Shop = require('../models/Shops');
const Order = require('../models/Orders');
const OrderItem = require('../models/OrderItems');
const Item = require('../models/Items'); 
const userProfile='/etc/ec/data/ProfilePath/';
const profilePath ='/ProfilePath';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');


exports.userSignin = async (req,res) => {
    try{
        const { username, password } = req.body;
        const user =await User.findOne({ where: { username:username}});
        console.log("user----------",user)
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        console.log("secretKey------",secretKey)
        const token = jwt.sign({ userId: user.id }, secretKey,{ expiresIn:'360d'});
        res.status(200).json({ message: 'Sign-in successful', token: token,user });  
    }catch(error){
        console.log("error-------",error)
        res.status(500).json({message:"No User found"})
    }

}

exports.createShop = async (req, res) => {
    const id = req.params.id;
    try {
        const { shopname, location, address, emailId, contectnumber } = req.body; // Corrected variable name
        console.log("shopname-----", shopname);
        
        // Find the user by ID
        const user = await User.findOne({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // Updated status code and message
        }

        // Create a new shop associated with the user
        const shop = await Shop.create({
            shopname,
            location,
            address,
            emailId,
            contectnumber, 
            userId: user.id // Corrected capitalization of 'UserId'
        });
        
        // Return success response
        return res.status(201).json({ message: "Shop created successfully", shop }); // Updated response message
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.updateShop = async (req, res) => {
    const shopId = req.params.id; // Corrected variable name
    try {
        const { shopname, location, address, emailId, contectnumber, userId } = req.body;
        
        // Find the shop by ID
        const shop = await Shop.findOne({ where: { id: shopId } });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        if (shopname !== undefined) {
            shop.name = shopname;
        }
        if (location !== undefined) {
            shop.location =location;
        }
        if (address !== undefined) {
             shop.address =address;
        }
        if (emailId !== undefined) {
        	shop.emailId =emailId;
        	}	

        if (contectnumber !== undefined) {
            shop.contectnumber = contectnumber;
        }

        if(userId !== undefined){
        	shop.userId =userId
        }

console.log("shop----",shop)
        // Save the updated shop
        await shop.save();

        // Return success response
        return res.status(200).json({ message: "Shop updated successfully", shop });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.deleteShop = async (req, res) => {
    const shopId = req.params.id;
    try {
        // Find the shop by ID
        const shop = await Shop.findOne({ where: { id: shopId } });
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Delete the shop
        await shop.destroy();

        // Return success response
        return res.status(200).json({ message: "Shop deleted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.createOrder = async (req, res) => {
    const id = req.params.id;
    try {
        const { expecteddate, shopId, yourearing, totalAmount, itemId, quantity } = req.body;
        const user =await User.findOne({ where:{id:id}});
        // Verify that the shop exists
        const shop = await Shop.findOne({ where: { id: shopId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        // Check if itemId and quantity arrays are valid
        if (!Array.isArray(itemId) || !Array.isArray(quantity) || itemId.length !== quantity.length) {
            console.log("Invalid itemId or quantity format");
            return res.status(400).json({ message: "Invalid itemId or quantity format" });
        }

        // Create the order
        const order = await Order.create({
            expecteddate,
            userId:id,
            shopId,
            yourearing,
            totalAmount,
            shopName: shop.shopname,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log("order---------", order);

        // Create order items
        const orderItems = [];
        for (let i = 0; i < itemId.length; i++) {
            const item = await Item.findByPk(itemId[i]);
            if (!item) {
                console.log(`Item with ID ${itemId[i]} not found. Skipping...`);
                continue;
            }

            // Create the order item
            const orderItem = await OrderItem.create({
                orderId: order.id,
                userId: user.id,
                itemId: itemId[i],
                quantity: quantity[i],
                yourearing: yourearing, // Assuming this applies to all items
                totalAmount: totalAmount, // Assuming this applies to all items
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log("OrderItem created successfully", orderItem);
            orderItems.push(orderItem);
        }

        res.status(201).json({ message: "Order created successfully" });
    } catch (error) {
        console.log("error-------", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



exports.updateOrder = async (req,res) => {
	try {
        const orderId = req.params.id;
        const { expecteddate, shopId, yourearing, totalAmount, itemId, quantity } = req.body;

        // Verify that the order exists
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order details
        await order.update({
            expecteddate,
            shopId,
            userId,
            yourearing,
            totalAmount,
            updatedAt: new Date()
        });

        // Update order items
        for (let i = 0; i < itemId.length; i++) {
            const item = await Item.findByPk(itemId[i]);
            if (!item) {
                console.log(`Item with ID ${itemId[i]} not found. Skipping...`);
                continue;
            }

            // Update or create the order item
            const [orderItem, created] = await OrderItem.findOrCreate({
                where: { orderId, itemId: itemId[i] },
                defaults: {
                    orderId,
                    userId,
                    itemId: itemId[i],
                    quantity: quantity[i],
                    yourearing,
                    totalAmount,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

            if (!created) {
                // If the order item already exists, update its details
                await orderItem.update({
                    quantity: quantity[i],
                    yourearing,
                    totalAmount,
                    updatedAt: new Date()
                });
            }
        }

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.log("error-------", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// DELETE route for deleting an order by ID
exports.deleteOrder = async (req,res) =>{
    try {
        const orderId = req.params.id;

        // Find the order by ID and delete it
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Delete associated order items before deleting the order
        await OrderItem.destroy({ where: { orderId } });

        await order.destroy();

        res.status(200).json({ message: 'Order and associated items deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.getProfile = async (req,res) =>{
console.log("req.body-----",req.params);
 try{
const id =req.params.id;
const user =await User.findAll({ where :{ id:id }});
console.log("profile------",user[0])
var userData ={
	name:user[0].username,
            role: user[0].role,
            myearning: user[0].myearning,
            orders: user[0].orders, // Assuming orders is an array of order objects
            userProfileImage:user[0].userProfileImage,
            phonenumber: user[0].phonenumber,
            emailId: user[0].emailId
}
console.log("userData----",userData)
res.status(200).json(userData);
}catch(error){
	console.log(error)
	res.status(500).json({ message: "Internal server error" });
}

}


exports.updateUser =async (req,res) =>{
    console.log("req.files-------",req.files);
    console.log("req.body-----",req.body);
    
    try{
      const {emailId,phonenumber,position}= req.body;
        const id =req.params.id
        const user =await User.findOne({where:{id:id}});
console.log("user----",user);

    if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (emailId !== undefined) {
            user.emailId = emailId;
        }
        if (phonenumber !== undefined) {
            user.phonenumber =phonenumber;
        }
        if(position !== undefined){
            user.position =position;
        }
        if (req.files) {
            var finalName = user.username.replace(/\s+/g, '_');
            const desImageDir = `${userProfile}${finalName}`;

            if (!fs.existsSync(desImageDir)) {
                fs.mkdirSync(desImageDir, { recursive: true });
                console.log("Directory created successfully");
            }

            const imagePath = `${desImageDir}/${req.files.userProfileImage.name}`;
            if (fs.existsSync(imagePath)) {
                // Delete the old image file
                fs.unlinkSync(imagePath);
            }
            fs.writeFileSync(imagePath, req.files.userProfileImage.data, 'binary');
            user.userProfileImage = `http://localhost${userProfile}${finalName}/${req.files.userProfileImage.name}`;
        }
        await user.save();
        res.status(201).json({message:"created successfully",user});
    }catch(error){
        console.log("error------",error)
        res.status(500).json({message:'Internal server error'});
    }
}

exports.getshopitem = async (req,res) => {
    try{
        const items = await Item.findAll();
        const shops = await Shop.findAll();
        const responseData = {
            shops: shops,
            items: items
            // You can include data from other tables here if needed
        };
        res.json(responseData);
    }catch(error){
         console.error('Error fetching data from multiple tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getOrders = async (req,res) =>{
    try{
        const id =req.params.userId;
        const orders =await Order.findAll({where: { userId: id },
            include: User});
        console.log(orders);
        //return
        res.json(orders);
        //return
    }catch(error){
        console.error('Error fetching data from Order tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}

exports.getItems = async (req,res) =>{
    try{
        const items = await Item.findAll();
        res.json(items);
    }catch(error){
        
        console.error('Error fetching data from Items tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getShops = async (req,res) =>{
    try{
        const shops = await Shop.findAll();
        res.json(shops);
    }catch(error){
        res.status(500).json({message:'Error from getting the shop datas'})
    }
}


/*export.searchitem =async (req,res) => {
try {
        // Extract search query parameters from the request
        const { keyword } = req.query;

        // Define search criteria
        const searchCriteria = {
            [Op.or]: [
                { name: { [Op.iLike]: `%${keyword}%` } }, // Case-insensitive search for item name
                { description: { [Op.iLike]: `%${keyword}%` } } // Case-insensitive search for item description
            ]
        };

        // Perform the search using Sequelize
        const searchResults = await Item.findAll({
            where: searchCriteria
        });

        // Send the search results as a response
        res.json(searchResults);
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}   */


