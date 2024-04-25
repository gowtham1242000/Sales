// const { Users, Shop } = require('../models'); // Import User and Shop models
const {Sequelize,Op} = require('sequelize');
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
const ReturnItem = require('../models/ReturnItems');
const ReturnOrderItem =require('../models/ReturnOrderItems');
const Location = require('../models/Locations');
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
//    console.log("req.files-------", req.files.shopImage);

    try {
        const images = req.files && req.files.shopImage; // Assuming the key for images is 'shopImage'
        console.log("images-------------", images);
        const id = req.params.id;

        const { shopname, location, address, emailId, contectnumber, locationCode, shopCode, availability } = req.body;
        const parsedLocationCode = JSON.parse(locationCode);

        const user = await User.findOne({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize arrays for image URLs
        let shopImages = [];
        let thumbnailImages = [];

        // Check if images are present and not null or undefined
        if (images !== null && images !== undefined) {
            // Check if images is an array or a single object
            const isMultipleImages = Array.isArray(images);
            console.log("entering the if condition---------#######33", isMultipleImages);

            // Process images based on whether it's an array or a single object
            if (isMultipleImages) {
                // Loop through each image if multiple images are provided
                for (const image of images) {
                    // Process each image here
                    // ... Code to save and process images ...

                    // Determine file extension
                    const extension = extname(image.name).toLowerCase();

                    // Generate URL for original and thumbnail images
                    const originalImageUrl = `https://salesman.aindriya.co.in${shopImagePath}/original/${image.name}`;
                    const thumbnailImageUrl = `https://salesman.aindriya.co.in${shopImagePath}/thumbnails/${basename(image.name, extension)}.webp`;

                    // Push the URLs to the arrays
                    shopImages.push(originalImageUrl);
                    thumbnailImages.push(thumbnailImageUrl);
                }
            } else {
                // Process the single image here
                // ... Code to save and process the image ...

                // Determine file extension
                const extension = extname(images.name).toLowerCase();

                // Generate URL for original and thumbnail images
                const originalImageUrl = `https://salesman.aindriya.co.in${shopImagePath}/original/${images.name}`;
                const thumbnailImageUrl = `https://salesman.aindriya.co.in${shopImagePath}/thumbnails/${basename(images.name, extension)}.webp`;

                // Push the URLs to the arrays
                shopImages.push(originalImageUrl);
                thumbnailImages.push(thumbnailImageUrl);
            }
        } else {
            // If no images are uploaded, store empty arrays
            shopImages = [];
            thumbnailImages = [];
        }

        // Create a new shop associated with the user
        const shop = await Shop.create({
            shopname,
            location,
            address,
            emailId,
            contectnumber,
	    shopCode,
	    availability,
            shopImage: shopImages,
            thumbnailimage: thumbnailImages,
            locationCode: JSON.stringify(parsedLocationCode),
            userId: user.id
        });

        // Return success response
        return res.status(201).json({ message: "Shop created successfully", shop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

*/

const { extname, basename } = require("path");
exports.createShop = async (req, res) => {
    console.log("req.files-------", req.files);
    console.log("req.body---------",req.body)
    try {
        const images = req.files && req.files.shopImage; // Assuming the key for images is 'shopImage'
        const id = req.params.id;

        const { shopname, location, address, emailId, contectnumber, locationCode, shopCode, availability } = req.body;
        console.log("locationCode--------",locationCode)

	const parsedLocationCode = JSON.parse(locationCode);

        const user = await User.findOne({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create directory for original images if it doesn't exist
        const originalImageDir = `/etc/ec/data/shopImage/original`;
        if (!fs.existsSync(originalImageDir)) {
            fs.mkdirSync(originalImageDir, { recursive: true });
        }

        // Create directory for thumbnail images if it doesn't exist
        const thumbnailDir = `/etc/ec/data/shopImage/thumbnails`;
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        // Initialize arrays for image URLs
        const shopImages = [];
        const thumbnailImages = [];
	console.log("Images-------",images);
     
        // Loop through each image if images are provided
        if (images && Array.isArray(images)) {
            for (const image of images) {
                // Generate file names for original and thumbnail images
                const originalImageName = `${Date.now()}_${image.name}`;
                const thumbnailImageName = `${Date.now()}_${basename(image.name, extname(image.name))}.webp`;

                // Generate file paths for original and thumbnail images
                const originalImagePath = `${originalImageDir}/${originalImageName}`;
                const thumbnailImagePath = `${thumbnailDir}/${thumbnailImageName}`;

                // Save original image
                await image.mv(originalImagePath);

                // Resize and save thumbnail image using Sharp
                await sharp(originalImagePath)
                    .resize({ width: 200, height: 200 })
                    .toFormat('webp')
                    .webp({ quality: 80 })
                    .toFile(thumbnailImagePath);

                // Push the URLs to the arrays
                shopImages.push(`https://salesman.aindriya.co.in/shopImage/original/${originalImageName}`);
                thumbnailImages.push(`https://salesman.aindriya.co.in/shopImage/thumbnails/${thumbnailImageName}`);
            }
        }

        // Create a new shop associated with the user
        const shop = await Shop.create({
            shopname,
            location,
            address,
            shopCode,
            availability,
            emailId,
            contectnumber,
            shopImage: shopImages,
            thumbnailimage: thumbnailImages,
            locationCode: JSON.stringify(parsedLocationCode),
            userId: user.id
        });

        // Return success response
        return res.status(201).json({ message: "Shop created successfully", shop });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



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
        const { shopname, location, address, emailId, contectnumber, locationCode, shopCode, availability } = req.body;
        

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
        if (shopCode) {
            shop.shopCode = shopCode;
        }
        if (availability) {
            shop.avilability = availability;
        }
        if (locationCode) {
            const parsedLocationCode = JSON.parse(locationCode);
            shop.locationCode = JSON.stringify(parsedLocationCode);
        }

        // Handle image update if a new image is provided
        if (req.files && req.files.shopImage) {
            const images = req.files.shopImage; // Assuming the key for images is 'shopImage'

            if (!Array.isArray(images)) {
                return res.status(400).json({ message: "Shop images must be provided as an array" });
            }

            // Initialize arrays for image URLs
            const shopImages = [];
            const thumbnailImages = [];

            // Loop through each image
            for (const image of images) {
                // Process each image here
                // ... Code to save and process images ...

                // Determine file extension
                const extension = extname(image.name).toLowerCase();

                // Generate URL for original and thumbnail images
                const originalImageUrl = `https://salesman.aindriya.co.in${shopImagePath}/original/${image.name}`;
                const thumbnailImageUrl = `https://salesman.aindriya.co.in${shopImagePath}/thumbnails/${basename(image.name, extension)}.webp`;
		console.log("originalImageUrl-----------",originalImageUrl);
		console.log("thumbnailImageUrl--------",thumbnailImageUrl);
                // Push the URLs to the arrays
                shopImages.push(originalImageUrl);
                thumbnailImages.push(thumbnailImageUrl);
            }

            // Update shop image URLs
            shop.shopImage = shopImages;
            shop.thumbnailimage = thumbnailImages;
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
/*exports.updateShop = async (req, res) => {
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

*/

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

/*
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
	console.log("data-------",data)
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
*/

exports.createOrder = async (req, res) => {
    const id = req.params.id;
    try {
        const { expecteddate, shopId, orderType, orderNo, status, yourearing, totalAmount, itemId, quantity } = req.body;
        const user = await User.findOne({ where: { id: id } });
        const shop = await Shop.findOne({ where: { id: shopId } });
        const sts = await Status.findAll({ where: { id: status } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        if (!Array.isArray(itemId) || !Array.isArray(quantity) || itemId.length !== quantity.length) {
            console.log("Invalid itemId or quantity format");
            return res.status(400).json({ message: "Invalid itemId or quantity format" });
        }
	var data = sts[0].dataValues.status;

        // Create the order
        const order = await Order.create({
            expecteddate,
            userId: id,
            shopId,
            yourearing,
            totalAmount,
            orderType,
            statusid: status,
            orderNo,
            status: data,
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
	console.log("-----------------------------",order.orderNo)
            // Create the order item
            const orderItem = await OrderItem.create({
                orderId: order.id,
                userId: user.id,
                itemId: itemId[i],
                quantity: quantity[i],
                orderNo: order.orderNo, // Using the automatically generated order number
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

/*exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
console.log("orderId-------",orderId)
        const { expecteddate, shopId, orderType, status, yourearing, totalAmount, itemId, quantity } = req.body;

        // Verify that the order exists
        const order = await Order.findOne({ where: { id: orderId } });
console.log("order----------",order)
	const user = await User.findOne({ where:{id:order.userId}});
//return
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order details
        if (expecteddate !== undefined) {
            order.expecteddate = expecteddate;
        }

        if (shopId !== undefined) {
            order.shopId = shopId;
        }

        if (orderType !== undefined) {
            order.orderType = orderType;
        }

        if (status !== undefined) {
            order.status = status;
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
        if (itemId && itemId.length > 0) {
            for (let i = 0; i < itemId.length; i++) {
                const item = await Item.findByPk(itemId[i]);
                if (!item) {
                    console.log(`Item with ID ${itemId[i]} not found. Skipping...`);
                    continue;
                }

                let orderItem;
                const [orderItemInstance, created] = await OrderItem.findOrCreate({
                    where: { orderId, itemId: itemId[i] },
                    defaults: {
                        orderId,
                        itemId: itemId[i],
                        quantity: quantity[i],
                        yourearing,
                        totalAmount,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });

                if (created) {
                    orderItem = orderItemInstance;
                } else {
                    await orderItemInstance.update({
                        quantity: quantity[i],
                        yourearing,
			orderNo: order.orderNo,
			userId:user.id,
                        totalAmount,
                        updatedAt: new Date()
                    });
                    orderItem = orderItemInstance;
                }
            }
        }

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

*/
/*exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log("orderId-------", orderId);
        const { expecteddate, shopId, orderType, status, yourearing, totalAmount, itemId, quantity } = req.body;

        // Verify that the order exists
        const order = await Order.findOne({ where: { id: orderId } });
        console.log("order----------", order);
        const user = await User.findOne({ where: { id: order.userId } });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order details
        if (expecteddate !== undefined) {
            order.expecteddate = expecteddate;
        }

        if (shopId !== undefined) {
            order.shopId = shopId;
        }

        if (orderType !== undefined) {
            order.orderType = orderType;
        }

        if (status !== undefined) {
            order.status = status;
        }

        if (yourearing !== undefined) {
            order.yourearing = yourearing;
        }

        if (totalAmount !== undefined) {
            order.totalAmount = totalAmount;
        }

        order.updatedAt = new Date();
        await order.save();

        // Update or create order items
        if (itemId && itemId.length > 0) {
            for (let i = 0; i < itemId.length; i++) {
                const [orderItem, created] = await OrderItem.update({
                  //  where: { orderId, itemId: itemId[i] },
                    //defaults: {
                        orderId,
                        itemId: itemId[i],
                        quantity: quantity[i],
                        yourearing,
                       orderNo: order.orderNo,
                        userId: user.id,
                        totalAmount,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    //}
                });
		const orderItem = await OrderItem.findOne({ where: { orderId, itemId: itemId[i] } });

                if (orderItem) {
                    await orderItem.update({
                        quantity: quantity[i],
                        yourearing,
			itemId: itemId[i],
			orderId,
                        orderNo: order.orderNo,
                        userId: user.id,
                        totalAmount,
                        updatedAt: new Date()
                    });
                }
                if (!created) {
console.log("--------###############################")
                    // If order item already exists, update its details
                    await orderItem.update({
                        quantity: quantity[i],
                        yourearing,
                        orderNo: order.orderNo,
                        userId: user.id,
                        totalAmount,
                        updatedAt: new Date()
                    });
                }
            }
        }

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

*/

exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log("orderId-------", orderId);
        const { expecteddate, shopId, orderType, status, yourearing, totalAmount, itemId, quantity } = req.body;

        // Verify that the order exists
        const order = await Order.findOne({ where: { id: orderId } });
        console.log("order----------", order);
        const user = await User.findOne({ where: { id: order.userId } });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order details
        if (expecteddate !== undefined) {
            order.expecteddate = expecteddate;
        }

        if (shopId !== undefined) {
            order.shopId = shopId;
        }

        if (orderType !== undefined) {
            order.orderType = orderType;
        }

        if (status !== undefined) {
            order.status = status;
        }

        if (yourearing !== undefined) {
            order.yourearing = yourearing;
        }

        if (totalAmount !== undefined) {
            order.totalAmount = totalAmount;
        }

        order.updatedAt = new Date();
        await order.save();

        // Update or create order items
        if (itemId && itemId.length > 0) {
            for (let i = 0; i < itemId.length; i++) {
                let orderItem;
                const existingOrderItem = await OrderItem.findOne({ where: { orderId} });

                if (existingOrderItem) {
                    // If order item already exists, update its details
                    await existingOrderItem.update({
                        quantity: quantity[i],
                        yourearing,
                        orderNo: order.orderNo,
                        userId: user.id,
                        totalAmount,
                        updatedAt: new Date()
                    });
                    orderItem = existingOrderItem;
                } else {
                    // If order item doesn't exist, create a new one
                    orderItem = await OrderItem.create({
                        orderId,
                        itemId: itemId[i],
                        quantity: quantity[i],
                        yourearing,
                        orderNo: order.orderNo,
                        userId: user.id,
                        totalAmount,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }
        }

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

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
const totalSaleAmount = await Order.sum('totalAmount', {where: {userId: id}});
const update =await User.update({ totalOrderPlaced: orderCount,myEarning: totalEarnings,totalSaleAmount:totalSaleAmount },{ where: {id:id}});
const user =await User.findAll({ where :{ id:id }});

console.log("totalSaleAmount-------",totalSaleAmount);

var userData ={
	name:user[0].username,
            role: user[0].role,
            myearning: user[0].myEarning,
            totalAmount: totalSaleAmount,
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
            user.userProfileImage = `https://salesman.aindriya.co.in${profilePath}/${finalName}/${req.files.userProfileImage.name}`;
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
            include: User,
            order:[['createdAt','DESC']], // Assuming User is the associated model
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
        const itemsPerPage = 6;

        // Calculate the offset
        const offset = (page - 1) * itemsPerPage;
 	
	const totalCount = await Item.count();

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        // Find items with pagination
        const items = await Item.findAll({
            offset: offset,
           order:[['createdAt','DESC']],
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

/*exports.getShops = async (req, res) => {
console.log("----------------get call is reaching")
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
           order:[['createdAt','DESC']],
            limit: shopsPerPage
        });

        res.json({message:'Getting sucessfully the Shop details',shops: shops, totalPages: totalPages, totalShops: totalCount});
    } catch (error) {
        console.error('Error fetching data from Shops table:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};*/


/*exports.getShops = async (req, res) => {
    try {
        // Fetch all shops
        const shops = await Shop.findAll();

        // Prepare to fetch order counts for each shop
        const shopIds = shops.map(shop => shop.id);

        // Aggregate query to count orders for each shopId
        const orderCounts = await Order.findAll({
            where: {
                shopId: shopIds
            },
            attributes: [
                'shopId',
                [Sequelize.fn('COUNT', Sequelize.col('shopId')), 'totalOrders']  // Use Sequelize.fn and Sequelize.col here
            ],
            group: ['shopId']
        });

        // Convert the array of order counts into an object for quick lookup
        const orderCountMap = orderCounts.reduce((acc, item) => {
            acc[item.shopId] = item.dataValues.totalOrders;
            return acc;
        }, {});

        // Add order count to each shop data
        const enrichedShops = shops.map(shop => {
            const shopJson = shop.toJSON();
            shopJson.totalOrders = orderCountMap[shop.id] || 0; // Use 0 as default if no orders found
            return shopJson;
        });

        return res.status(200).json({shop:enrichedShops});
    } catch (error) {
        console.error('Error fetching shops and order counts:', error);
        res.status(500).json({ message: 'Internal server error' });
};

}
*/
exports.getShops = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number, default is 1
        const pageSize = parseInt(req.query.pageSize) || 10; // Number of records per page, default is 10

        // Calculate total number of shops
        const totalShops = await Shop.count();

        // Calculate total pages
        const totalPages = Math.ceil(totalShops / pageSize);

        // Fetch shops with pagination
        const shops = await Shop.findAll({
            limit: pageSize,
            order:[['createdAt','DESC']],
            offset: (page - 1) * pageSize // Calculate the offset
        });

        // Prepare to fetch order counts for each shop
        const shopIds = shops.map(shop => shop.id);

        // Aggregate query to count orders for each shopId
        const orderCounts = await Order.findAll({
            where: { shopId: shopIds },
            attributes: ['shopId', [Sequelize.fn('COUNT', Sequelize.col('shopId')), 'totalOrders']],
            group: ['shopId']
        });

        // Convert the array of order counts into an object for quick lookup
        const orderCountMap = orderCounts.reduce((acc, item) => {
            acc[item.shopId] = item.dataValues.totalOrders;
            return acc;
        }, {});

        // Add order count to each shop data
        const enrichedShops = shops.map(shop => {
            const shopJson = shop.toJSON();
            shopJson.totalOrders = orderCountMap[shop.id] || 0; // Use 0 as default if no orders found
            return shopJson;
        });

        // Return paginated list of shops with total pages and total shop count
        return res.status(200).json({
            totalPages: totalPages,
            totalShops: totalShops,
            shops: enrichedShops
        });
    } catch (error) {
        console.error('Error fetching shops and order counts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/*exports.getShopsDetails = async (req, res) => {
    try {
        const id = req.params.id;
        // Find shop details by id
        const shop = await Shop.findOne({ where: { id: id } });
console.log("shop.shopImage----------",shop.shopImage);

function convertToJSON(input) {
    // Remove the curly braces and split the string into an array
    let urls = input.replace(/[{}]/g, '').split(',');

    // Map each URL to a JSON object
    return urls.map(url => {
        return { url: url.trim() }; // Trim any whitespace
    });
}

const shopImage = [];
const thumbnail =[];

shopImage.push(shop.shopImage)
thumbnail.push(shop.thumbnailimage)


shop.shopImage = shopImage;
shop.thumbnailimage = thumbnail;

console.log("shop-------",shop)
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Find all orders associated with the shop
        const orders = await Order.findAll({ where: { shopId: id } });

        //if (orders.length === 0) {
          //  return res.status(404).json({ message: "No orders found for this shop" });
        //}

        // Iterate through each order to fetch order items
	if(orders){
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            return { order, orderItems };
        }));

        	return res.status(200).send({ shop, ordersWithItems });
	}else{
		return res.status(200).send({shop});
	}
    } catch (error) {
        console.log("error------", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
*/

exports.getShopsDetails = async (req, res) => {
    try {
        const id = req.params.id;
        // Find shop details by id
        const shop = await Shop.findOne({ where: { id: id } });

        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }
        // Function to convert stored string into JSON array of URLs
	function convertToJSON(input) {
    if (!input || !Array.isArray(input)) return [];
    // Iterate over each element of the array
    return input.map(url => {
        // Trim any whitespace and return as a JSON object
        return { url: url.trim() };
    });
}

        // Convert the images and thumbnails from strings to structured JSON
        shop.dataValues.shopImage = convertToJSON(shop.shopImage);
        shop.dataValues.thumbnailimage = convertToJSON(shop.thumbnailimage);

        console.log("Converted shopImage-------", shop.shopImage);
        console.log("Converted thumbnailimage-------", shop.thumbnailimage);

        // Find all orders associated with the shop
        const orders = await Order.findAll({ where: { shopId: id } });

	if(orders){
        // Map over each order to fetch order items
        	const ordersWithItems = orders.length > 0 ? await Promise.all(
            		orders.map(async (order) => {
                	const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
                	return { order, orderItems };
            	})
        	) : [];

        	return res.status(200).send({ shop, ordersWithItems });
	}else{
		return res.status(200).send({ shop });
	}
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
                { name: { [Op.iLike]: `%${keyword}%` } } // Case-insensitive search for item name
        //        { description: { [Op.iLike]: `%${keyword}%` } } // Case-insensitive search for item description
            ]
        };

        // Perform the search using Sequelize
        const searchResults = await Item.findAll({
            where: searchCriteria
        });

        // Send the search results as a response
        res.json(searchResults);
    } catch (error) {

        console.error('Error performing wsearch:', error);
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
            order:[['createdAt','DESC']],
            limit: ordersPerPage,
            raw: true // Get raw JSON data directly from the database
        });

        const totalOrders = orders.count;
        const totalPages = Math.ceil(totalOrders / ordersPerPage);

        // Calculate total earnings
        const totalEarnings = orders.rows.reduce((total, order) => total + order.yourearing, 0);

        const responseData = {
            orders: orders.rows.map(order => ({
                earningAmount: order.yourearing,
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

exports.getTotalItemSales = async (req,res) =>{
	
	async function calculateTotalPriceByUser(userId) {
		
    try {
        // Find all rows in the OrderItems table for the specified userId
        const orderItems = await OrderItem.findAll({ where: { userId } });

        const totalPriceByItems = {};

        // Iterate through each row in the OrderItems table
        for (const orderItem of orderItems) {
            const { itemId, quantity } = orderItem;

            // Use itemId to find the corresponding item in the Items table
            const item = await Item.findOne({ where: { id: itemId } });

            // If item exists, calculate total price for this item and add to totalPriceByItems
            if (item) {
                const itemName = item.name;
                const itemPrice = item.price;
                const totalAmount = itemPrice * quantity;

                // If item already exists in totalPriceByItems, aggregate quantity and amount
                if (totalPriceByItems[itemName]) {
                    totalPriceByItems[itemName].totalQuantity += quantity;
                    totalPriceByItems[itemName].totalAmount += totalAmount;
                } else {
                    totalPriceByItems[itemName] = {
                        itemImage: item.image, // Assuming 'image' is the field name for item image in the Item model
                        totalQuantity: quantity,
                        totalAmount: totalAmount
                    };
                }
            }
        }

        // Convert totalPriceByItems object to array for response
        const totalPriceArray = Object.keys(totalPriceByItems).map(itemName => ({
            itemName: itemName,
            itemImage: totalPriceByItems[itemName].itemImage,
            totalQuantity: totalPriceByItems[itemName].totalQuantity,
            totalAmount: totalPriceByItems[itemName].totalAmount
        }));

        return totalPriceArray;
    } catch (error) {
        console.error('Error calculating total price:', error);
        throw error;
    }
}




const userId = 2;
calculateTotalPriceByUser(userId)
    .then(totalPriceArray => {
        console.log('Total Price:', totalPriceArray);
	if(totalPriceArray) return res.status(201).json(totalPriceArray)
    })
    .catch(error => {
	res.status(500).json("Internal server Error")
        console.error('Error:', error);
    });
}


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

/*exports.createReturnOrder = async (req, res) => {
    try {
        const { statusId, orderNo, shopId, itemId, totalAmount, yourearing, quantity, userId } = req.body;
        
        // Check if the order exists
        const order = await Order.findOne({ where: { shopId: shopId } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
	const shop = await Shop.findOne({where:{id:shopId}});

        // Create the return order
        const returnOrder = await ReturnItem.create({
            userId: req.params.id,
            statusId: statusId,
            orderId: order.id,
            shopId: shopId,
	    shopName: shop.shopName,
	    yourearing: yourearing,
 	    quantity: quantity,
            totalAmount:totalAmount,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Create return order items
        const returnOrderItems = [];
        for (let i = 0; i < itemId.length; i++) {
            const item = await Item.findByPk(itemId[i]);
            if (!item) {
                console.log(`Item with ID ${itemId[i]} not found. Skipping...`);
                continue;
            }

            // Create the return order item
            const returnOrderItem = await ReturnOrderItem.create({
                userId: req.params.id,
                returnOrderId: returnOrder.id,
                itemId: itemId[i],
                quantityReturned: quantity[i],
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log("ReturnOrderItem created successfully", returnOrderItem);
            returnOrderItems.push(returnOrderItem);
        }

        res.status(201).json({ message: "Return order created successfully" });
    } catch (error) {
        console.error("Error creating return order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
*/

exports.createReturnOrder = async (req, res) => {
    try {
        const { statusId, orderNo, shopId, itemId, totalAmount, yourearning, quantity, deliveryDate } = req.body;

        // Check if the order exists
        const order = await Order.findOne({ where: { shopId: shopId } });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        const shop = await Shop.findOne({ where: { id: shopId } });

console.log("shop-----------",shop)
//console.log("statusId, orderNo, shopId, itemId, totalAmount, yourearning, quantity,",statusId, orderNo, shopId, itemId, totalAmount, yourearning, quantity, shop.shopName)
//return
        // Create the return order
const returnOrder = await ReturnItem.create({
    userId: req.params.id,
    statusId: statusId,
    //orderNo: orderNo,
    shopId: shopId,
    shopName: shop.shopname,
    yourearing: yourearning,
    totalAmount: totalAmount,
    quantity:quantity,
    deliveryDate:deliveryDate,
    createdAt: new Date(),
    updatedAt: new Date()
});

        // Create return order items
        const returnOrderItems = [];
        for (let i = 0; i < itemId.length; i++) {
            const item = await Item.findByPk(itemId[i]);
            if (!item) {
                console.log(`Item with ID ${itemId[i]} not found. Skipping...`);
                continue;
console.log("returnOrder.orderNo--------------------------",returnOrder.orderNo)            }

console.log("returnOrder.orderNo--------------------------",returnOrder.orderNo)
            // Create the return order item
            const returnOrderItem = await ReturnOrderItem.create({
                userId: req.params.id,
                returnOrderId: returnOrder.id,
                itemId: itemId[i],
                quantityReturned: quantity[i],
		returnNo: returnOrder.orderNo,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log("ReturnOrderItem created successfully", returnOrderItem);
            returnOrderItems.push(returnOrderItem);
        }

        res.status(201).json({ message: "Return order created successfully" });
    } catch (error) {
        console.error("Error creating return order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/*
exports.getReturnOrders = async (req,res) =>{
    try{
        const id =req.params.userId;
        const orders =await ReturnItem.findAll({where: { userId: id },
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

exports.getReturnOrders = async (req, res) => {
console.log("req.params.id---------",req.params.userId)
    try {
        const userId = req.params.userId; // Assuming the userId is passed in the request parameters
        // Fetch return orders
        const returnOrders = await ReturnItem.findAll({
            where: { userId: userId }, // Filter by userId
            include: {
                model: ReturnOrderItem,
                attributes: ['returnNo', 'quantityReturned'],
            },
            attributes: ['id', 'shopId', 'shopName', 'yourearing', 'statusId', 'orderNo', 'userId', 'totalAmount', 'deliveryDate', 'createdAt', 'updatedAt'],
        });
returnOrders.forEach(returnOrder => {
    console.log(returnOrder); // Log the return order object
    let totalQuantityReturned = 0;
    returnOrder.ReturnOrderItems.forEach(returnOrderItem => {
        totalQuantityReturned += parseInt(returnOrderItem.quantityReturned);
    });
    // Add total quantity returned to the return order object
    returnOrder.totalQuantityReturned = totalQuantityReturned;
});

        res.status(200).json(returnOrders);
    } catch (error) {
        console.error("Error fetching return orders:----------", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
*/
/*
exports.getReturnOrders = async (req, res) => {
    console.log("req.params.userId---------", req.params.userId);
    try {
        const userId = req.params.userId; // Assuming the userId is passed in the request parameters
        // Fetch return orders
        const returnOrders = await ReturnItem.findAll({
            where: { userId: userId }, // Filter by userId
            include: {
                model: ReturnOrderItem,
                attributes: ['returnNo', 'quantityReturned'],
            },
            attributes: ['id', 'shopId', 'shopName', 'yourearing', 'statusId', 'orderNo', 'userId', 'totalAmount', 'deliveryDate', 'createdAt', 'updatedAt'],
        });
	const  status = await Status.findAll({where:{id:status.statusId}});
	console.log("---------------",status)
        // Create a new array with the desired properties, including totalQuantityReturned
        const returnOrdersWithTotalQuantity = returnOrders.map(returnOrder => {
            let totalQuantityReturned = 0;
            returnOrder.ReturnOrderItems.forEach(returnOrderItem => {
                totalQuantityReturned += parseInt(returnOrderItem.quantityReturned);
            });
            // Create a new object with the desired properties, including totalQuantityReturned
            return {
                ...returnOrder.toJSON(), // Convert returnOrder to JSON
                totalQuantityReturned: totalQuantityReturned,
		status:status
            };
        });

        res.status(200).json(returnOrdersWithTotalQuantity);
    } catch (error) {
        console.error("Error fetching return orders:----------", error);
        res.status(500).json({ message: "Internal server error" });
    }
}*/

exports.getAllReturnOrders = async (req,res) =>{
	/*try {
        // Fetch return orders
        const returnOrders = await ReturnItem.findAll({
            include: {
                model: ReturnOrderItem,
                attributes: ['returnNo', 'quantityReturned'],
            },
            attributes: ['id', 'shopId', 'shopName', 'yourearing', 'statusId', 'orderNo', 'userId', 'totalAmount', 'deliveryDate', 'createdAt', 'updatedAt'],
            order: [['createdAt','DESC']]
        });
        // Fetch status based on statusId
        const statuses = await Status.findAll(); // Fetch all statuses
        // Create a map of statusId to status object
        const statusMap = {};
        statuses.forEach(status => {
            statusMap[status.id] = status;
        });
        // Create a new array with the desired properties, including totalQuantityReturned and status
        const returnOrdersWithTotalQuantity = returnOrders.map(returnOrder => {
            let totalQuantityReturned = 0;
            returnOrder.ReturnOrderItems.forEach(returnOrderItem => {
                totalQuantityReturned += parseInt(returnOrderItem.quantityReturned);
            });
            // Create a new object with the desired properties, including totalQuantityReturned and status
            return {
                ...returnOrder.toJSON(), // Convert returnOrder to JSON
                totalQuantityReturned: totalQuantityReturned,
                status: statusMap[returnOrder.statusId], // Access status from the map
            };
        });

        res.status(200).json(returnOrdersWithTotalQuantity);
    } catch (error) {
        console.error("Error fetching return orders:----------", error);
        res.status(500).json({ message: "Internal server error" });
    }*/

try {
    // Fetch return orders along with associated user details
    const returnOrders = await ReturnItem.findAll({
        include: [
            {
                model: ReturnOrderItem,
                attributes: ['returnNo', 'quantityReturned'],
            },
            {
        	        model: User, // Include the User model
                attributes: ['id', 'username', 'userProfileImage'], // Specify the attributes to include
            }
        ],
        attributes: ['id', 'shopId', 'shopName', 'yourearing', 'statusId', 'orderNo', 'userId', 'totalAmount', 'deliveryDate', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']]
    });

    // Map return orders and extract user details
    const returnOrdersWithUserDetails = returnOrders.map(returnOrder => {
        const user = returnOrder.User; // Get the associated user
        return {
            ...returnOrder.toJSON(), // Convert returnOrder to JSON
            user: { // Include user details in the response
                id: user.id,
                username: user.username,
                userProfileImage: user.userProfileImage
            }
        };
    });

    res.status(200).json(returnOrdersWithUserDetails);
} catch (error) {
    console.error("Error fetching return orders:----------", error);
    res.status(500).json({ message: "Internal server error" });
}


}

exports.getReturnOrders = async (req, res) => {
    console.log("req.params.userId---------", req.params.userId);
    try {
        const userId = req.params.userId; // Assuming the userId is passed in the request parameters
        // Fetch return orders
        const returnOrders = await ReturnItem.findAll({
            where: { userId: userId }, // Filter by userId
            include: {
                model: ReturnOrderItem,
                attributes: ['returnNo', 'quantityReturned'],
            },
            attributes: ['id', 'shopId', 'shopName', 'yourearing', 'statusId', 'orderNo', 'userId', 'totalAmount', 'deliveryDate', 'createdAt', 'updatedAt'],
	    order: [['createdAt','DESC']]
        });
        // Fetch status based on statusId
        const statuses = await Status.findAll(); // Fetch all statuses
        // Create a map of statusId to status object
        const statusMap = {};
        statuses.forEach(status => {
            statusMap[status.id] = status;
        });
        // Create a new array with the desired properties, including totalQuantityReturned and status
        const returnOrdersWithTotalQuantity = returnOrders.map(returnOrder => {
            let totalQuantityReturned = 0;
            returnOrder.ReturnOrderItems.forEach(returnOrderItem => {
                totalQuantityReturned += parseInt(returnOrderItem.quantityReturned);
            });
            // Create a new object with the desired properties, including totalQuantityReturned and status
            return {
                ...returnOrder.toJSON(), // Convert returnOrder to JSON
                totalQuantityReturned: totalQuantityReturned,
                status: statusMap[returnOrder.statusId], // Access status from the map
            };
        });

        res.status(200).json(returnOrdersWithTotalQuantity);
    } catch (error) {
        console.error("Error fetching return orders:----------", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



/*exports.getReturnOrders = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find return orders for the given userId
        const returnOrders = await ReturnItem.findAll({
            where: { userId: userId },
            include: [
              //  { model: Order, include: Shop }, // Include associated order and shop details
                //{ model: Status }, // Include associated status details
                { model: ReturnOrderItem, include: Item } // Include associated return order items and item details
            ]
        });

        // Extract required data and format the response
        const formattedOrders = returnOrders.map(returnOrder => ({
            id: returnOrder.id,
            shopId: returnOrder.shopId,
            shopName: returnOrder.shopName,
            yourearing: returnOrder.yourearing,
            statusId: returnOrder.statusId,
            orderNo: returnOrder.orderNo,
            userId: returnOrder.userId,
            totalAmount: returnOrder.order.totalAmount,
            createdAt: returnOrder.createdAt,
            updatedAt: returnOrder.updatedAt,
            returnOrderItems: returnOrder.returnOrderItems.map(returnOrderItem => ({
                itemId: returnOrderItem.itemId,
                quantityReturned: returnOrderItem.quantityReturned
            }))
        }));

        // Send the formatted response
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching return orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};*/

/*exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the order by ID
        const order = await Order.findOne({ where: { id: orderId } });
console.log("order--------",order)
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the order items associated with the order
        const orderItems = await OrderItem.findAll({ where: { orderId: orderId } });


        // Fetch additional details for each order item
        const orderItemsWithDetails = await Promise.all(orderItems.map(async (orderItem) => {
            // Find the item details for the order item
            const item = await Item.findOne({ where: { id: orderItem.itemId } });
            const itemTotalPrice = item.price * orderItem.quantity;
            
            return {
                item: {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    totalPrice: itemTotalPrice, 
                    // Add any other item details you want to include
		    quantityCount: orderItem.quantity,
		    image: item.image
                }
            };
        }));
        let totalAmount = 0;
let yourEarnings = 0;



try {
    // Loop through each orderItem in the orderItems array
    orderItems.forEach(orderItem => {
        // Access the totalAmount and yourEarnings properties of each orderItem
        totalAmount += orderItem.dataValues.totalAmount || 0;
        yourEarnings += orderItem.dataValues.yourearing || 0;
    });

    console.log('Total Amount:', totalAmount);
    console.log('Your Earnings:', yourEarnings);
} catch (error) {
    console.error('Error calculating total amount and your earnings:', error);
}

        // Find the shop details for the order
        const shop = await Shop.findOne({ where: { id: order.shopId } });
console.log("shop-------------",shop)
console.log("shop.shopName---------",shop.dataValues.shopName);
        // Prepare the response object
        const response = {
            orderNo: order.orderNo,
            deliveryDate: order.expecteddate, // Assuming expecteddate is the delivery date
            shopName: shop.shopname,
	    shopId: order.shopId, // Assuming shopName is the correct attribute
            orderStatus: order.status,
            statusId: order.statusid,
            orderItems: orderItemsWithDetails, 
            totalAmount: totalAmount,
            yourEarnings: yourEarnings,
            //ItemsTotalPrice
        };

        // Return success response with order details
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
*/
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Find the order by ID
        const order = await Order.findOne({ where: { id: orderId } });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the order items associated with the order
        const orderItems = await OrderItem.findAll({ where: { orderId: orderId } });

        // Fetch additional details for each order item
        const orderItemsWithDetails = await Promise.all(orderItems.map(async (orderItem) => {
            // Find the item details for the order item
            const item = await Item.findOne({ where: { id: orderItem.itemId } });
            const itemTotalPrice = item.price * orderItem.quantity;

            return {
                id: item.id,
                name: item.name,
                price: item.price,
                totalPrice: itemTotalPrice,
                quantityCount: orderItem.quantity,
                image: item.image
            };
        }));

        // Calculate total amount and your earnings
        let totalAmount = 0;
        let yourEarnings = 0;

        orderItems.forEach(orderItem => {
            totalAmount += orderItem.dataValues.totalAmount || 0;
            yourEarnings += orderItem.dataValues.yourearing || 0;
        });

        // Find the shop details for the order
        const shop = await Shop.findOne({ where: { id: order.shopId } });

        // Prepare the response object
        const response = {
		id :order.id,
            orderNo: order.orderNo,
            deliveryDate: order.expecteddate, // Assuming expecteddate is the delivery date
            shopName: shop.shopname,
            shopId: order.shopId, // Assuming shopName is the correct attribute
            orderStatus: order.status,
            statusId: order.statusid,
            orderItems: orderItemsWithDetails,
            totalAmount: totalAmount,
            yourEarnings: yourEarnings
        };

        // Return success response with order details
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/*exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { fromDate, toDate } = req.query;  // Get the date range from query parameters

        // Prepare the query options for finding the order
        let queryOptions = {
            where: {
                id: orderId,
                expecteddate: {} // Initialize as an empty object to dynamically add conditions
            }
        };

        // If fromDate is provided, add it to the query conditions
        if (fromDate) {
            queryOptions.where.expecteddate.$gte = new Date(fromDate);
        }

        // If toDate is provided, add it to the query conditions
        if (toDate) {
            queryOptions.where.expecteddate.$lte = new Date(toDate);
        }

        // Handle the case where no date conditions are provided
        if (!fromDate && !toDate) {
            delete queryOptions.where.expecteddate;
        }

        // Find the order by ID with possible date filtering
        const order = await Order.findOne(queryOptions);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the order items associated with the order
        const orderItems = await OrderItem.findAll({ where: { orderId: orderId } });

        // Fetch additional details for each order item
        const orderItemsWithDetails = await Promise.all(orderItems.map(async (orderItem) => {
            const item = await Item.findOne({ where: { id: orderItem.itemId } });
            const itemTotalPrice = item.price * orderItem.quantity;
            return {
                id: item.id,
                name: item.name,
                price: item.price,
                totalPrice: itemTotalPrice,
                quantityCount: orderItem.quantity,
                image: item.image
            };
        }));

        // Calculate total amount and your earnings
        let totalAmount = 0;
        let yourEarnings = 0;

        orderItems.forEach(orderItem => {
            totalAmount += orderItem.dataValues.totalAmount || 0;
            yourEarnings += orderItem.dataValues.yourearing || 0;
        });

        // Find the shop details for the order
        const shop = await Shop.findOne({ where: { id: order.shopId } });

        // Prepare the response object
        const response = {
            id: order.id,
            orderNo: order.orderNo,
            deliveryDate: order.expecteddate,
            shopName: shop.shopname,
            shopId: order.shopId,
            orderStatus: order.status,
            statusId: order.statusid,
            orderItems: orderItemsWithDetails,
            totalAmount: totalAmount,
            yourEarnings: yourEarnings
        };

        // Return success response with order details
        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

*/
/*exports.searchAndFilterShops = async (req, res) => {
    try {
        const { shopname, fromDate, toDate } = req.query;

        // Define the filter object
        const filter = {};

        // Apply shopName filter if provided
        if (shopname) {
console.log("------------1")
            filter.shopName = { [Op.like]: `%${shopname}%` };
        }
console.log("shopName---------",shopName)

        // Apply date range filter if both fromDate and toDate are provided
        if (fromDate && toDate) {
            filter.createdAt = {
                [Op.between]: [new Date(fromDate), new Date(toDate)]
            };
        }

        // Fetch the shops based on the filters
        const Returnshops = await ReturnItem.findAll({
            where: filter
        });

console.log("ReturnShop----------",ReturnShop)

	const  OrdersShops = await Orders.findAll({
		where: filter
	})

console.log("OrdersShop-----------",OrdersShop)
return


        // Return the filtered shops
        return res.status(200).json({ Returnshops });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
*/


/*exports.searchAndFilterShops = async (req, res) => {
    try {
        const { shopname, fromDate, toDate } = req.query;

        // Define the filter object
        const filter = {};

        // Apply shopName filter if provided
        if (shopname) {
            filter.shopName = { [Op.like]: `%${shopname}%` };
        }

        // Apply date range filter if both fromDate and toDate are provided
        if (fromDate && toDate) {
            filter.createdAt = {
                [Op.between]: [new Date(fromDate), new Date(toDate)]
            };
        }

        // Define associations for the queries
        const associations = [
            { model: Shop, as: 'shop' } // Assuming there's an association between ReturnItem and Shop table
        ];

        // Fetch the shops based on the filters
        const Returnshops = await ReturnItem.findAll({
            where: filter,
            include: associations
        });

        // Fetch the orders based on the filters
        const OrdersShops = await Orders.findAll({
            where: filter,
            include: associations
        });

        // Return both filtered shops and orders
        return res.status(200).json({ Returnshops, OrdersShops });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
*/

exports.searchAndFilterShops = async (req, res) => {

console.log("******************")
    try {
        const { shopname, fromDate, toDate } = req.query;
        console.log("shopname--------", shopname);

        // Define filters for each type of model based on the column names
        const shopFilter = {};
        const returnItemAndOrderFilter = {};

        if (shopname) {
            console.log("--entering", shopname);
            shopFilter['shopname'] = { [Op.like]: `%${shopname}%` }; // Assuming 'Shop' model uses 'shopname'
            returnItemAndOrderFilter['shopName'] = { [Op.like]: `%${shopname}%` }; // 'ReturnItem' and 'Order' use 'shopName'
        }

        if (fromDate && toDate) {
            const dateFilter = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
            shopFilter['createdAt'] = dateFilter;
            returnItemAndOrderFilter['createdAt'] = dateFilter;
        }

        const associations = [{ model: Shop, as: 'Shop' }];

        // Find return shops and orders with applicable filters
        const Returnshops = await ReturnItem.findAll({
            where: returnItemAndOrderFilter,
            include: associations
        });

        const OrdersShops = await Order.findAll({
            where: returnItemAndOrderFilter,
            include: associations
        });

        // Find shops with its specific filter
        const Shops = await Shop.findAll({
            where: shopFilter
        });

        return res.status(200).json({ Shops, Returnshops, OrdersShops });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.userSignout = async (req, res) => {
console.log("req.params.userId---------",req.params.userId)
    try {
        const userId = req.params.userId;
console.log("userId-----",userId)
        // Check if the user exists in the database
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Log the user's sign-out action
        console.log(`User with ID ${userId} signed out at ${new Date()}`);

        // Perform any other necessary cleanup tasks, such as updating database records or clearing session data
        // Respond with a success message
        res.status(200).json({ message: "Sign-out successful" });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


exports.getLocation = async (req, res) => {
    try {
        // Fetch all location details from the database
        const allLocations = await Location.findAll();

        // Send a success response with the retrieved location details
        return res.status(200).json({ locations: allLocations });
    } catch (error) {
        console.error(error);
        // If an error occurs, send an error response
        return res.status(500).json({ message: 'Failed to fetch locations' });
    }
};






