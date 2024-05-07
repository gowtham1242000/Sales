const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const { Pool } = require('pg');
const sequelize = require('../config/config');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');
const fileUpload          = require('express-fileupload');
const util =require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const sharp = require('sharp');
const path = require('path');
const User = require('../models/Users');
const Shop = require('../models/Shops');
const Item = require('../models/Items');
const Status = require('../models/Status');
const Location = require('../models/Locations');
const ItemPath='/etc/ec/data/Items/';
const userProfile='/etc/ec/data/ProfilePath/';
const Order = require('../models/Orders');
const ReturnItem =require('../models/ReturnItems');

const URLpathI ='/Items';
//admin signup
exports.createAdmin = async (req,res) => {
console.log("req.body---------",req.body);
	try{

		const {username,password}=req.body;
		//hash the password

		const hashedPassword = await bcrypt.hash(password, 10);
		const user  = await User.create({
            username: username,
            password: hashedPassword,
            role: 'admin' // Assuming the role is 'admin' for now
        });
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '360d' });
		res.status(201).send({ message: 'Admin user created successfully', userId: user.id, token: token });
	}catch(error){
		console.log("error-------",error)
		res.status(500).json({ error:"Error of creating admin user"});
	}

}

//admin signin

exports.signUser = async (req,res) => {
console.log(req.body)
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
		res.status(500).json({message:"No User found"})
	}

}

/*
exports.createUser = async (req,res) => {
	try {
		const id =req.params.id;
        	const { username, password, phoneNumber, salesManId, availability, emailId } = req.body;
        	const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if the username already exists
        const admin = await User.findOne({where:{id:id}});
        console.log("admin-----------",admin)
        if(admin){
        const preuser = await User.findOne({ where: { username: username } });
        if (preuser) {
            return res.status(500).send({ message: "This username is already registered. Try another username." });
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
            userProfileImage = `https://salesman.aindriya.co.in${profilePath}/${finalName}/${req.files.userProfileImage.name}`;
        }


        // Create the user if the username doesn't exist
        const user = await User.create({
			username: username,
			password: hashedPassword,
			role: 'user',
			adminId:admin.id,
			phoneNumber:phoneNumber,
			emailId:emailId,
			userProfileImage:userProfileImage,
			logoutStatus:availability });
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

        res.status(201).send({ message: 'User created successfully', userId: user.id, token: token });
    }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};
*/


exports.createUser = async (req, res) => {
console.log("-----------",req.body)
console.log("-----------",req.files)

    try {
        const id = req.params.id;
        const { username, password, phoneNumber, salesManId, availability, emailId } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if the username already exists
        const admin = await User.findOne({ where: { id: id } });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const preuser = await User.findOne({ where: { username: username } });
        if (preuser) {
            return res.status(400).send({ message: "This username is already registered. Try another username." });
        }

        let userProfileImage;
        if (req.files && req.files.userProfileImage) {
            const image = req.files.userProfileImage;
            const finalName = username.replace(/\s+/g, '_');
            const userProfileDir = path.join(__dirname, '..', 'userProfile'); // Define the directory to store user profile images
            if (!fs.existsSync(userProfileDir)) {
                fs.mkdirSync(userProfileDir, { recursive: true });
            }
            const imageName = `${finalName}_${Date.now()}_${image.name}`;
            const imagePath = path.join(userProfileDir, imageName);

            // Move the image file to the user profile directory
            await image.mv(imagePath);

            // Construct the userProfileImage URL
            userProfileImage = `https://salesman.aindriya.co.in/userProfile/original/${imageName}`;
        }

        const user = await User.create({
            username: username,
            password: hashedPassword,
            role: 'user',
            adminId: admin.id,
            phoneNumber: phoneNumber,
            emailId: emailId,
            userProfileImage: userProfileImage,
            logoutStatus: availability
        });

        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

        res.status(201).json({ message: 'User created successfully', userId: user.id, token: token, user });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};


/*
exports.createItem =async (req,res) =>{
	try{
		const {name,price,quantity,description} = req.body;

		var finalName =name.replace(/\s+/g, '_');
		const desImageDir = `${ItemPath}${finalName}`;

		if (!fs.existsSync(desImageDir)) {
        	fs.mkdirSync(desImageDir, { recursive: true });
      	}

      	var desImageUrl = '';
        fs.writeFileSync(`${desImageDir}/${req.files.image.name}`,req.files.image.data, 'binary');
        destinationImgUrl = `http://64.227.139.72${URLpathI}/${finalName}/${req.files.image.name}`;
      	const item = await Item.create({
        	name:name,
        	image:destinationImgUrl,
        	price:price,
        	quantity:quantity,
        	description:description,
        	createdAt: new Date(),
        	updatedAt: new Date()
      	});
      	res.status(201).json({message:"created successfully",item});
	}catch(error){
		console.log("error------",error)
		res.status(500).json({ message: 'Internal server error' });
	}
}
*/

exports.createItem = async (req, res) => {
    try {
        const { name, price, availability, attribute, itemCode, itemcommission } = req.body;
	console.log("req.body----------",req.body);
	console.log("req.files----------",req.files);
        // Create directory for original images if it doesn't exist
        const originalImageDir = `${ItemPath}/original`;
        if (!fs.existsSync(originalImageDir)) {
            fs.mkdirSync(originalImageDir, { recursive: true });
        }

        // Save original image
        const image = req.files.image;
        const originalImagePath = `${originalImageDir}/${image.name}`;
        await image.mv(originalImagePath);

        // Create thumbnails directory if it doesn't exist
        const thumbnailDir = `${ItemPath}/thumbnails`;
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
        const originalImageUrl = `https://64.227.139.72${URLpathI}/original/${image.name}`;
        const thumbnailImageUrl = `https://64.227.139.72${URLpathI}/thumbnails/${path.basename(image.name, extension)}.webp`;

        // Create the item
        const item = await Item.create({
            name: name,
            image: originalImageUrl, // Store URL of original image in the database
            thumbnail: thumbnailImageUrl, // Store URL of thumbnail image in the database
            price: price,
	    attribute: attribute,
	    itemCode: itemCode,
	    itemcommission:itemcommission,
            availability: availability,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Return success response
        res.status(201).json({ message: "Item created successfully", item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


/*exports.updateItem = async (req,res) => {
	try{
		const id =req.params.id;
		const {name, price, quantity, description} =req.body;
		const item =await Item.findOne({where: {id:id}});
		console.log("item------",item)
		// return
		if(!item){
			return res.status(404).json({ message: 'Item not found' });
		}

		if (name !== undefined) {
            item.name = name;
        }
        if (price !== undefined) {
            item.price =price;
        }
        if (quantity !== undefined) {
             item.quantity =quantity;
        }
        if (description !== undefined) {
        	item.description =description;
        	}	
		if(req.files){
		var finalName =item.name.replace(/\s+/g, '_');
		const desImageDir = `${ItemPath}${finalName}`;

		if (!fs.existsSync(desImageDir)) {
            console.log("Directory does not exist");
            return res.status(404).json({ message: 'Directory does not exist' });
        }
        const imagePath = `${desImageDir}/${req.files.image.name}`;
        if (fs.existsSync(imagePath)) {
            // Delete the old image file
            fs.unlinkSync(imagePath);
        }
        fs.writeFileSync(imagePath, req.files.image.data, 'binary');
        item.image = `http://64.227.139.72${URLpathI}/${finalName}/${req.files.image.name}`;
    }
		await item.save();
		res.status(201).json({message:"created successfully",item});
	}catch(error){
		console.log("error------",error)
		res.status(500).json({message:'Internal server error'});
	}
}

*/

exports.updateItem = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, price, availability, attribute } = req.body;
        const item = await Item.findOne({ where: { id: id } });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (name !== undefined) {
            item.name = name;
        }
        if (price !== undefined) {
            item.price = price;
        }
        if (attribute !== undefined){
	   item.attribute =attribute;
	}
 	if (itemCode !== undefined){
           item.itemCode =itemCode;
	}
        if (availability !== undefined) {
            item.availability = availability;
        }
        if (req.files) {
            // Create directory for original images if it doesn't exist
            const originalImageDir = `${ItemPath}/original`;
            if (!fs.existsSync(originalImageDir)) {
                fs.mkdirSync(originalImageDir, { recursive: true });
            }

            // Save original image
            const image = req.files.image;
            const originalImagePath = `${originalImageDir}/${image.name}`;
            await image.mv(originalImagePath);

            // Create thumbnails directory if it doesn't exist
            const thumbnailDir = `${ItemPath}/thumbnails`;
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
            const originalImageUrl = `https://64.227.139.72${URLpathI}/original/${image.name}`;
            const thumbnailImageUrl = `https://64.227.139.72${URLpathI}/thumbnails/${path.basename(image.name, extension)}.webp`;

            // Set the item's image and thumbnail URLs
            item.image = originalImageUrl;
            item.thumbnail = thumbnailImageUrl;
        }

        await item.save();
        res.status(201).json({ message: "Item updated successfully", item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;
    try {
        // Find the shop by ID
        const item = await Item.findOne({ where: { id: itemId } });
        if (!item) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Delete the shop
        await item.destroy();

        // Return success response
        return res.status(200).json({ message: "Item deleted successfully" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.createStatus =async (req,res) =>{
	try{
		const {status} =req.body;
		const sts = await Status.create({
			status:status
		})
		res.status(200).json({message:'The status created successfully',status})
	}catch(error){
		res.status(500).json({message:'Internal server Error'})
	}
}

//createLocations
exports.createLocation = async (req,res) =>{
console.log("req.body-------",req.body)
	try {
    const { LocationName, deliveryDays, salesMan } = req.body;

    if (!LocationName || !deliveryDays || !salesMan || !Array.isArray(salesMan)) {
      return res.status(400).json({ error: 'Missing or invalid data in request body' });
    }

    // Fetch user information for the provided salesmen IDs
    const salesmen = await User.findAll({
      where: {
        id: salesMan
      },
      attributes: ['username']
    });

    // Extract usernames from the fetched salesmen
    const salesmenUsernames = salesmen.map(salesman => salesman.username);
    // Create the new location in the database
    const newLocation = await Location.create({
      LocationName,
      deliveryDays,
      salesMan: salesmenUsernames,
      salesManId:salesMan // Store usernames in the salesMan column
    });

    // Return the newly created location in the response
    res.status(201).json(newLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
}


/*exports.getAllUser = async (req,res)=>{
	try{
		const user = await  User.findAll();
console.log("user-------",user);
	return res.status(201).json({user})
	}catch(error){
	return res.status(500).json({ message: 'Internal server Error' });

	}
}*/

exports.getAllUser = async (req, res) => {
	try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 0; // Default page is 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch total number of users
    const totalUsers = await User.count();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalUsers / limit);

    let users; // Declare users variable outside the conditional blocks

    if (page === 0) {
console.log("-----------")
        // Fetch users without pagination
        users = await User.findAll({
       //     order: [['createdAt', 'DESC']]
        });
    } else {
console.log("+++++++")
        // Fetch users with pagination
        users = await User.findAll({
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
    }

    return res.status(200).json({ users, totalPages, totalUsers });
} catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: 'Internal server error' });
}

};


//const Location = require('../models/location');

exports.getDashboardDetails =async (req,res)=>{
	try{
	const TotalRevenue =await Order.sum('totalAmount');
	const TotalSalesOrder = await Order.count();
	const TotalReturnOrder = await ReturnItem.count();
	const TotalShop = await Shop.count();
	const userOrderCounts = await Order.findAll({
    attributes: [
        'userId', // Select the userId
        [sequelize.fn('COUNT', sequelize.col('userId')), 'orderCount'] // Count the number of orders for each userId
    ],
    group: ['userId'], // Group by userId
    include: [{
        model: User, // Include the User model to fetch username and email
        attributes: ['username', 'emailId'] // Select username and email
    }]
});

console.log("userOrderCount------------",userOrderCounts);
return 
	res.status(201).json({TotalRevenue,TotalSalesOrder,TotalReturnOrder,TotalShop});
	}catch(error){
		console.log("error",error)
	}
}
