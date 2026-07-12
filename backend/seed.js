const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const User = require('./models/User');
const Department = require('./models/Department');
const Category = require('./models/Category');
const Asset = require('./models/Asset');

// Helper to convert BSON JSON format to Mongoose objects
const convertBson = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => convertBson(item));
  }

  if (typeof obj === 'object') {
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (obj.$date) {
      return new Date(obj.$date);
    }
    
    const converted = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        converted[key] = convertBson(obj[key]);
      }
    }
    return converted;
  }

  return obj;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow_erp';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await Promise.all([
      Department.deleteMany({}),
      Category.deleteMany({}),
      User.deleteMany({}),
      Asset.deleteMany({})
    ]);
    console.log('Collections cleared.');

    // 1. Seed Departments
    console.log('Seeding Departments...');
    const deptsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/seed/departments.json'), 'utf-8'));
    const deptsData = convertBson(deptsRaw);
    await Department.insertMany(deptsData);
    console.log('Departments seeded.');

    // 2. Seed Categories
    console.log('Seeding Categories...');
    const categoriesRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/seed/categories.json'), 'utf-8'));
    const categoriesData = convertBson(categoriesRaw);
    await Category.insertMany(categoriesData);
    console.log('Categories seeded.');

    // 3. Seed Users
    console.log('Seeding Users...');
    const usersRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/seed/users.json'), 'utf-8'));
    const usersData = convertBson(usersRaw).map(user => {
      // Map firstName + lastName to name
      if (!user.name) {
        user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
      }
      return user;
    });
    await User.insertMany(usersData);
    console.log('Users seeded.');

    // 4. Seed Assets
    console.log('Seeding Assets...');
    const assetsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/seed/assets.json'), 'utf-8'));
    const assetsData = convertBson(assetsRaw);
    await Asset.insertMany(assetsData);
    console.log('Assets seeded.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
