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

const User = require('../models/Users');
const Shop = require('../models/Shops');
const Item = require('../models/Items');
const Status = require('../models/Status');
const ItemPath='/etc/ec/data/Items/';
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
	try{
		const { username, password } = req.body;
		const user =await User.findOne({ where: { username:username}});
		console.log("user----------",user)
		if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        console.log("secretKey------",secretKey)
		const token = jwt.sign({ userId: user.id }, secretKey,{ expiresIn:'360d'});
		res.status(200).json({ message: 'Sign-in successful', token: token });	
	}catch(error){
		res.status(500).json({message:"No User found"})
	}

}

exports.createUser = async (req,res) => {
	try {
		const id =req.params.id;
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if the username already exists
        const admin = await User.findOne({where:{id:id}});
        console.log("admin-----------",admin)
        if(admin){
        const preuser = await User.findOne({ where: { username: username } });
        if (preuser) {
            return res.status(500).send({ message: "This username is already registered. Try another username." });
        }

        // Create the user if the username doesn't exist
        const user = await User.create({ username: username, password: hashedPassword, role: 'user', adminId:admin.id });
        const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

        res.status(201).send({ message: 'User created successfully', userId: user.id, token: token });
    }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
    }
};

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


exports.updateItem = async (req,res) => {
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
