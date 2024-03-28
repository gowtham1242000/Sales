// const { Users, Shop } = require('../models'); // Import User and Shop models
const User = require('../models/Users');
const Shop = require('../models/shops');
const Order = require('../models/Orders');
const OrderItem = require('../models/OrderItems');
const Item = require('../models/Items'); 
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
    try {
        const { expecteddate, shopId, yourearing, totalAmount, itemId, quantity } = req.body;

        // Verify that the shop exists
        const shop = await Shop.findOne({ where: { id: shopId } });
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
const id =req.params.id;
const user =User.findAll({where{id:id}})
console.log("profile------",user)
return
}