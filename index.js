const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload          = require('express-fileupload');
const exec = require('child_process').exec;
const editJsonFile    = require('edit-json-file');
const db = require('./config/config');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
//const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');

const { Op } = require('sequelize');
//const userRoutes = require('./routes/userRoutes');

// Connect to the database
db.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(express.json());

// Routes
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
//  app.use('/user', userRoutes);
//app.use(cors());

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174','https://sales-ui-eight.vercel.app'];
app.use(cors());


// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));



