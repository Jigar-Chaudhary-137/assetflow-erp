const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Department = require('../models/Department');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Transfer = require('../models/Transfer');
const Maintenance = require('../models/Maintenance');
const Audit = require('../models/Audit');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

async function unseed() {
  try {
    console.log("Connecting to MongoDB for unseeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully. Deleting all documents...");

    await User.deleteMany({});
    await Category.deleteMany({});
    await Department.deleteMany({});
    await Asset.deleteMany({});
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});
    await Maintenance.deleteMany({});
    await Audit.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log("\nDatabase wiped successfully (all collection documents deleted)!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Database Unseeding Failed:");
    console.error(error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

unseed();
