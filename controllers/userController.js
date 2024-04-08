// const { Users, Shop } = require('../models'); // Import User and Shop models
const fs = require('fs');
const util =require('util');
const exec = util.promisify(require('child_process').exec);
const User = require('../models/Users');
const Shop = require('../models/Shops');
const Order = require('../models/Orders');
const OrderItem = require('../models/OrderItems');
const Item = require('../models/Items');
const Status = require('../models/Status'); 
const userProfile='/etc/ec/data/ProfilePath/';
const profilePath ='/ProfilePath';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
const shopImage ='/etc/ec/data/shopImage/';
const shopImagePath ='/shopImage';
const sharp = require('sharp');
const path = require('path');

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

/*exports.createShop = async (req, res) => {
    const id = req.params.id;
const image = req.files.shopImage;
//    const id = req.params.id;
    console.log("image-----",image)

    try {
        const { shopname, location, address, emailId, contectnumber } = req.body; // Corrected variable name
        console.log("shopname-----", shopname);
        
        // Find the user by ID
        const user = await User.findOne({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // Updated status code and message
        }

        var finalName =shopname.replace(/\s+/g, '_');
        const desImageDir = `${shopImage}${finalName}`;

        if (!fs.existsSync(desImageDir)) {
            fs.mkdirSync(desImageDir, { recursive: true });
        }

        var desImageUrl = '';
        fs.writeFileSync(`${desImageDir}/${req.files.shopImage.name}`,req.files.shopImage.data, 'binary');
        destinationImgUrl = `http://64.227.139.72${shopImagePath}/${finalName}/${req.files.shopImage.name}`;

        // Create a new shop associated with the user
        const shop = await Shop.create({
            shopname,
            location,
            address,
            emailId,
            contectnumber,
            shopImage:destinationImgUrl,
            userId: user.id // Corrected capitalization of 'UserId'
        });
        
        // Return success response
        return res.status(201).json({ message: "Shop created successfully", shop }); // Updated response message
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }

}*/

exports.createShop = async (req, res) => {
    const image = req.files.shopImage;
    const id = req.params.id;

    try {
        const { shopname, location, address, emailId, contectnumber } = req.body;
        
        const user = await User.findOne({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create directory for original images if it doesn't exist
        const originalImageDir = `${shopImage}/original`;
        if (!fs.existsSync(originalImageDir)) {
            fs.mkdirSync(originalImageDir, { recursive: true });
        }

        // Save original image
        const originalImagePath = `${originalImageDir}/${image.name}`;
        await image.mv(originalImagePath);

        // Create thumbnails directory if it doesn't exist
        const thumbnailDir = `${shopImage}/thumbnails`;
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        // Determine file extension and resize accordingly
        const extension = path.extname(image.name).toLowerCase();
        const thumbnailImagePath = `${thumbnailDir}/${path.basename(image.name, extension)}.webp`;
        let pipeline;

        if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
            pipeline = sharp(originalImagePath)
                .resize({ width: 200, height: 200 })
                .toFormat('webp') // Convert to WebP format
                .webp({ quality: 80 }) // Set WebP quality
                .toFile(thumbnailImagePath);
        } else {
            throw new Error('Unsupported file format');
        }

        // Create thumbnail image
        await pipeline;

        // Generate URL for original and thumbnail images
        const originalImageUrl = `http://64.227.139.72${shopImagePath}/original/${image.name}`;
        const thumbnailImageUrl = `http://64.227.139.72${shopImagePath}/thumbnails/${path.basename(image.name, extension)}.webp`;

        // Create a new shop associated with the user
        const shop = await Shop.create({
            shopname,
            location,
            address,
            emailId,
            contectnumber,
            shopImage: originalImageUrl, // Store URL of original image in the database
            thumbnailimage: thumbnailImageUrl, // Store URL of thumbnail image in the database
            userId: user.id
        });
        
        // Return success response
        return res.status(201).json({ message: "Shop created successfully", shop });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


/*
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
        if(req.files){
            var finalName =shop.shopname.replace(/\s+/g, '_');
            const desImageDir = `${shopImage}${finalName}`;

            if (!fs.existsSync(desImageDir)) {
                console.log("Directory does not exist");
                return res.status(404).json({ message: 'Directory does not exist' });
            }
            const imagePath = `${desImageDir}/${req.files.shopImage.name}`;
            if (fs.existsSync(imagePath)) {
                // Delete the old image file
                fs.unlinkSync(imagePath);
            }
            fs.writeFileSync(imagePath, req.files.shopImage.data, 'binary');
            shop.shopImage = `http://64.227.139.72${shopImagePath}/${finalName}/${req.files.shopImage.name}`;
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
*/
exports.updateShop = async (req, res) => {
    const shopId = req.params.id;

    try {
        // Find the shop by ID
        const shop = await Shop.findByPk(shopId);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Update shop details if provided in the request body
        const { shopname, location, address, emailId, contectnumber } = req.body;
        if (shopname) {
            shop.shopname = shopname;
        }
        if (location) {
            shop.location = location;
        }
        if (address) {
            shop.address = address;
        }
        if (emailId) {
            shop.emailId = emailId;
        }
        if (contectnumber) {
            shop.contectnumber = contectnumber;
        }

        // Handle image update if a new image is provided
        if (req.files && req.files.shopImage) {
            const image = req.files.shopImage;

            // Create directory for original images if it doesn't exist
            const originalImageDir = `${shopImage}/original`;
            if (!fs.existsSync(originalImageDir)) {
                fs.mkdirSync(originalImageDir, { recursive: true });
            }

            // Save original image
            const originalImagePath = `${originalImageDir}/${image.name}`;
            await image.mv(originalImagePath);

            // Create thumbnails directory if it doesn't exist
            const thumbnailDir = `${shopImage}/thumbnails`;
            if (!fs.existsSync(thumbnailDir)) {
                fs.mkdirSync(thumbnailDir, { recursive: true });
            }

            // Determine file extension and resize accordingly
            const extension = path.extname(image.name).toLowerCase();
            const thumbnailImagePath = `${thumbnailDir}/${path.basename(image.name, extension)}.webp`;
            let pipeline;

            if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
                pipeline = sharp(originalImagePath)
                    .resize({ width: 200, height: 200 })
                    .toFormat('webp') // Convert to WebP format
                    .webp({ quality: 80 }) // Set WebP quality
                    .toFile(thumbnailImagePath);
            } else {
                throw new Error('Unsupported file format');
            }

            // Create thumbnail image
            await pipeline;

            // Generate URL for original and thumbnail images
            const originalImageUrl = `http://64.227.139.72${shopImagePath}/original/${image.name}`;
            const thumbnailImageUrl = `http://64.227.139.72${shopImagePath}/thumbnails/${path.basename(image.name, extension)}.webp`;

            // Update shop image URLs
            shop.shopImage = originalImageUrl;
            shop.thumbnailimage = thumbnailImageUrl;
        }

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
        const { expecteddate, shopId, orderType, orderNo, status, statusid, yourearing, totalAmount, itemId, quantity } = req.body;
        const user =await User.findOne({ where:{id:id}});
        // Verify that the shop exists
        const shop = await Shop.findOne({ where: { id: shopId } });
        const sts = await Status.findAll({where:{id:status}})
	
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
	
        var data = sts[0].dataValues.status;
	// Create the order
        const order = await Order.create({
            expecteddate,
            userId:id,
            shopId,
	    orderNo,
            yourearing,
            totalAmount,
            orderType,
            status:data,
	    statusid:status,
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
		orderNo: orderNo,
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
        const { expecteddate, orderType, status, statusid, shopId, orderNo, userId, yourearing, totalAmount, itemId, quantity } = req.body;
	const sts = await Status.findAll({where:{id:status}});
	var data = sts[0].dataValues.status;
        // Verify that the order exists
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (expecteddate !== undefined) {
    order.expecteddate = expecteddate;
}

if (shopId !== undefined) {
    order.shopId = shopId;
}

if (userId !== undefined) {
    order.userId = userId;
}

if (orderType !== undefined) {
    order.orderType = orderType;
}

if (orderNo !== undefined) {
    order.orderNo = orderNo;
}

if (status !== undefined) {
    order.status = data;
}

if (statusid !== undefined) {
    order.statusid =statusid.status;
}

if (yourearing !== undefined) {
    order.yourearing = yourearing;
}

if (totalAmount !== undefined) {
    order.totalAmount = totalAmount;
}

order.updatedAt = new Date(); 

await order.save();

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
//                    userId,
                    itemId: itemId[i],
                    quantity: quantity[i],
                    yourearing,
		    orderNo,
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
                    orderNo,
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
const orderCount =await Order.count({where:{userId:id}});
const totalEarnings = await Order.sum('yourearing', { where: { userId: id } });
const update =await User.update({ totalOrderPlaced: orderCount,myEarning: totalEarnings },{ where: {id:id}});
const user =await User.findAll({ where :{ id:id }});
var userData ={
	name:user[0].username,
            role: user[0].role,
            myearning: user[0].myEarning,
            orders: user[0].totalOrderPlaced, // Assuming orders is an array of order objects
            userProfileImage:user[0].userProfileImage,
            phonenumber: user[0].phonenumber,
            emailId: user[0].emailId
}
console.log("userData----",userData)
res.status(200).json({message:'Get the user profile detalis ',userData});
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
            user.userProfileImage = `http://64.227.139.72${profilePath}/${finalName}/${req.files.userProfileImage.name}`;
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

/*exports.getOrders = async (req,res) =>{
    try{
        const id =req.params.userId;
        const orders =await Order.findAll({where: { userId: id },
            include: User});
	const formattedOrders = orders.map(order => {
            const formattedCreatedAt = new Date(order.createdAt).toISOString().split('T')[0];
            const formattedUpdatedAt = new Date(order.updatedAt).toISOString().split('T')[0];

            return {
                ...order.toJSON(),
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
            };
        });
	console.log("formattedOrders----------",formattedOrders);
        //return
        res.json({message:'Getting Orders data Successfully',orders:formattedOrders});
        //return
    }catch(error){
        	console.error('Error fetching data from Order tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}*/

exports.getOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1; // Parse the page number from the query string, default to page 1 if not provided
        const pageSize = 10; // Number of records per page

        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;
	const totalCount = await Order.count({ where: { userId: userId } });

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / pageSize);

        const orders = await Order.findAll({
            where: { userId: userId },
            include: User, // Assuming User is the associated model
            limit: pageSize, // Limit the number of records returned per page
            offset: offset // Offset to skip records based on the page number
        });

        // Format the orders with createdAt and updatedAt dates
        const formattedOrders = orders.map(order => ({
            ...order.toJSON(),
            createdAt: new Date(order.createdAt).toISOString().split('T')[0],
            updatedAt: new Date(order.updatedAt).toISOString().split('T')[0]
        }));
	
        // Send the paginated and formatted orders as a response
        res.json({ message: 'Getting Orders data successfully', orders: formattedOrders, totalPages: totalPages, totalOrders: totalCount });
    } catch (error) {
        console.error('Error fetching data from Order tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


/*exports.getItems = async (req,res) =>{
    try{
        const items = await Item.findAll();
        res.json(items);
    }catch(error){
        
        console.error('Error fetching data from Items tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}*/

exports.getItems = async (req, res) => {
    try {
        // Parse the page number from the query string
        const page = parseInt(req.query.page) || 1;
        
        // Define the number of items per page
        const itemsPerPage = 12;

        // Calculate the offset
        const offset = (page - 1) * itemsPerPage;
 	
	const totalCount = await Item.count();

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        // Find items with pagination
        const items = await Item.findAll({
            offset: offset,
            limit: itemsPerPage
        });

        res.json({message:'The Items getting sucessfully',items: items, totalPages: totalPages, totalCount: totalCount});
    } catch (error) {
        console.error('Error fetching data from Items tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



/*exports.getShops = async (req,res) =>{
    try{
        const shops = await Shop.findAll();
        res.json(shops);
    }catch(error){
        res.status(500).json({message:'Error from getting the shop datas'})
    }
}*/

exports.getShops = async (req, res) => {
    try {
        // Parse the page number from the query string, default to 1 if not provided
        const page = parseInt(req.query.page) || 1;
        
        // Define the number of shops per page
        const shopsPerPage = 6;
	const totalCount = await Shop.count();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / shopsPerPage)
        // Calculate the offset
        const offset = (page - 1) * shopsPerPage;

        // Find shops with pagination
        const shops = await Shop.findAll({
            offset: offset,
            limit: shopsPerPage
        });

        res.json({message:'Getting sucessfully the Shop details',shops: shops, totalPages: totalPages, totalShops: totalCount});
    } catch (error) {
        console.error('Error fetching data from Shops table:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};




exports.getShopsDetails = async (req, res) => {
    try {
        const id = req.params.id;
        // Find shop details by id
        const shop = await Shop.findOne({ where: { id: id } });

        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Find all orders associated with the shop
        const orders = await Order.findAll({ where: { shopId: id } });

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found for this shop" });
        }

        // Iterate through each order to fetch order items
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            return { order, orderItems };
        }));

        return res.status(200).json({ shop, ordersWithItems });
    } catch (error) {
        console.log("error------", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


exports.searchitem =async (req,res) => {
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
}   


exports.searchorder =async (req,res) => {
try {
        // Extract search query parameters from the request
        const { keyword } = req.query;

        // Define search criteria
        const searchCriteria = {
            [Op.or]: [
                { shopName: { [Op.iLike]: `%${keyword}%` } }
            ]
        };

        // Perform the search using Sequelize
        const searchResults = await Order.findAll({
            where: searchCriteria
        });

        // Send the search results as a response
        res.json(searchResults);
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.searchshop =async (req,res) => {
try {
        // Extract search query parameters from the request
        const { keyword } = req.query;

        // Define search criteria
        const searchCriteria = {
            [Op.or]: [
                { shopname: { [Op.iLike]: `%${keyword}%` } }
            ]
        };

        // Perform the search using Sequelize
        const searchResults = await Shop.findAll({
            where: searchCriteria
        });

        // Send the search results as a response
        res.json(searchResults);
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}   

exports.getStatus =async (req,res) =>{
    try{
        const status = await Status.findAll();
        console.log("status------",status);
        res.status(200).json({message:'This are the status details',status})
    }catch(error){
        console.log("getstatus----error",error)
    }
}

/*exports.getEarning = async (req, res) => {
    try {
        const userId = req.query.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Prepare the filter object based on the provided parameters
        const filter = {
            userId: userId
        };
        
        // Add date range criteria if both startDate and endDate are provided
        if (startDate && endDate) {
            filter.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Query the database for orders that match the given userId and fall within the date range (if provided)
        const orders = await Order.findAll({
            where: filter
        });

        const responseData = orders.map(order => ({
            totalAmount: order.totalAmount,
            updatedAt: order.updatedAt,
            orderNo: order.orderNo
        }));

        // Send the response
        res.json(responseData);
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};*/
/*exports.getEarning = async (req, res) => {
    try {
        const userId = req.query.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Parse the page number from the query string, default to 1 if not provided
        const page = parseInt(req.query.page) || 1;
        
        // Define the number of orders per page
        const ordersPerPage = 10;

        // Calculate the offset
        const offset = (page - 1) * ordersPerPage;

        // Prepare the filter object based on the provided parameters
        const filter = {
            userId: userId
        };
        
        // Add date range criteria if both startDate and endDate are provided
        if (startDate && endDate) {
            filter.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Query the database for orders that match the given userId and fall within the date range (if provided)
        const orders = await Order.findAll({
            where: filter,
            offset: offset,
            limit: ordersPerPage
        });
	const totalPages = Math.ceil(orders.count / ordersPerPage);

    // Calculate total earnings
    const totalEarnings = orders.rows.reduce((total, order) => total + order.totalAmount, 0);

        const responseData = {orders:orders.rows.map(order => ({
            totalAmount: order.totalAmount,
            updatedAt: order.updatedAt,
            orderNo: order.orderNo
        })),totalOrders: orders.count,
        totalPages: totalPages,
        totalEarnings: totalEarnings};

        // Send the response
        res.json(responseData);
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};*/


/*exports.getDeliveries = async (req,res) =>{
    const id =req.params.id;
    console.log("id----",id)
    try{
        const userId =req.params.userId;

        const orders =await Order.findAll({
            where: {userId:id,
                status: ['Delivered', 'Invoiced']}
            });
         const formattedOrders = orders.map(order => {
            const formattedCreatedAt = new Date(order.createdAt).toISOString().split('T')[0];
            const formattedUpdatedAt = new Date(order.updatedAt).toISOString().split('T')[0];

            return {
                ...order.toJSON(),
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
            };
        });
          res.json({message:'Getting Orders data Successfully',orders:formattedOrders});

        //return
    }catch(error){
        console.error('Error fetching data from Order tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

}*/

/*exports.getEarning = async (req, res) => {
    try {
        const userId = req.query.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Parse the page number from the query string, default to 1 if not provided
        const page = parseInt(req.query.page) || 1;

        // Define the number of orders per page
        const ordersPerPage = 10;

        // Calculate the offset
        const offset = (page - 1) * ordersPerPage;

        // Prepare the filter object based on the provided parameters
        const filter = {
            userId: userId
        };

        // Add date range criteria if both startDate and endDate are provided
        if (startDate && endDate) {
            filter.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Query the database for orders that match the given userId and fall within the date range (if provided)
        const orders = await Order.findAndCountAll({
            where: filter,
            offset: offset,
            limit: ordersPerPage,
            raw: true // Get raw JSON data directly from the database
        });

        const totalOrders = orders.count;
        const totalPages = Math.ceil(totalOrders / ordersPerPage);

        // Calculate total earnings
        const totalEarnings = orders.rows.reduce((total, order) => total + order.totalAmount, 0);

        const responseData = {
            orders: orders.rows.map(order => ({
                totalAmount: order.totalAmount,
                updatedAt: order.updatedAt,
                orderNo: order.orderNo
            })),
            totalOrders: totalOrders,
            totalPages: totalPages,
            totalEarnings: totalEarnings
        };

        // Send the response
        res.json(responseData);
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};*/

exports.getEarning = async (req, res) => {
    try {
        let userId = req.query.userId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // If userId is not provided in the query parameters, return a 400 Bad Request response
        if (!userId) {
            return res.status(400).json({ error: 'userId parameter is required' });
        }

        // Parse the page number from the query string, default to 1 if not provided
        const page = parseInt(req.query.page) || 1;

        // Define the number of orders per page
        const ordersPerPage = 10;

        // Calculate the offset
        const offset = (page - 1) * ordersPerPage;

        // Prepare the filter object based on the provided parameters
        const filter = {
            userId: userId
        };

        // Add date range criteria if both startDate and endDate are provided
        if (startDate && endDate) {
            filter.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Query the database for orders that match the given userId and fall within the date range (if provided)
        const orders = await Order.findAndCountAll({
            where: filter,
            offset: offset,
            limit: ordersPerPage,
            raw: true // Get raw JSON data directly from the database
        });

        const totalOrders = orders.count;
        const totalPages = Math.ceil(totalOrders / ordersPerPage);

        // Calculate total earnings
        const totalEarnings = orders.rows.reduce((total, order) => total + order.totalAmount, 0);

        const responseData = {
            orders: orders.rows.map(order => ({
                totalAmount: order.totalAmount,
                updatedAt: order.updatedAt,
                orderNo: order.orderNo
            })),
            totalOrders: totalOrders,
            totalPages: totalPages,
            totalEarnings: totalEarnings
        };

        // Send the response
        res.json(responseData);
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



/*exports.getDeliveries = async (req, res) => {
    try {
        const userId = req.params.id;
        const page = parseInt(req.query.page) || 1; // Parse the page number from the query string, default to page 1 if not provided
        const pageSize = 6; // Number of records per page

        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;

        const orders = await Order.findAll({
            where: {
                userId: userId, // Use the extracted userId without any additional parameters
                status: ['Delivered', 'Invoiced']
            },
            limit: pageSize, // Limit the number of records returned per page
            offset: offset // Offset to skip records based on the page number
        });

        // Format the orders
        const formattedOrders = orders.map(order => {
            const formattedCreatedAt = new Date(order.createdAt).toISOString().split('T')[0];
            const formattedUpdatedAt = new Date(order.updatedAt).toISOString().split('T')[0];

            return {
                ...order.toJSON(),
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
            };
        });

        // Send the paginated orders as a response
        res.json({ message: 'Getting Orders data Successfully', orders: formattedOrders });
    } catch (error) {
        console.error('Error fetching data from Order tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}*/


exports.getDeliveries = async (req, res) => {
    try {
        const userId = req.params.id;
        const page = parseInt(req.query.page) || 1; // Parse the page number from the query string, default to page 1 if not provided
        const pageSize = 6; // Number of records per page

        // Calculate the offset based on the page number and page size
        const offset = (page - 1) * pageSize;

        // Query the database for orders that match the given userId and status (Delivered or Invoiced)
        const orders = await Order.findAndCountAll({
            where: {
                userId: userId, // Use the extracted userId without any additional parameters
                status: ['Delivered', 'Invoiced']
            },
            limit: pageSize, // Limit the number of records returned per page
            offset: offset // Offset to skip records based on the page number
        });

        // Calculate total pages
        const totalPages = Math.ceil(orders.count / pageSize);

        // Format the orders
        const formattedOrders = orders.rows.map(order => {
            const formattedCreatedAt = new Date(order.createdAt).toISOString().split('T')[0];
            const formattedUpdatedAt = new Date(order.updatedAt).toISOString().split('T')[0];

            return {
                ...order.toJSON(),
                createdAt: formattedCreatedAt,
                updatedAt: formattedUpdatedAt
            };
        });

        // Send the paginated orders along with total pages and total orders as a response
        res.json({ 
            message: 'Getting Orders data Successfully', 
            orders: formattedOrders,
            totalPages: totalPages,
            totalOrders: orders.count
        });
    } catch (error) {
        console.error('Error fetching data from Order tables:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

