const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const Category = require('./models/Category');
const Department = require('./models/Department');
const Asset = require('./models/Asset');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Asset module verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['asset_admin', 'asset_staff'] } });
    await Category.deleteMany({ code: 'ASTC' });
    await Department.deleteMany({ code: 'ASTD' });
    await Asset.deleteMany({ assetTag: 'TESTASSET1' });

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'asset_admin',
      email: 'asset_admin@example.com',
      passwordHash,
      name: 'Asset Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'asset_staff',
      email: 'asset_staff@example.com',
      passwordHash,
      name: 'Asset Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create Category & Department
    console.log("Creating supportive category and department...");
    const category = await Category.create({ name: 'Asset Test Category', code: 'ASTC' });
    const department = await Department.create({ name: 'Asset Test Department', code: 'ASTD' });

    console.log("\n--- 2. Testing Asset CRUD ---");

    // 2a. Create Asset (Admin)
    console.log("2a. Creating asset (Admin)...");
    const assetPayload = {
      assetTag: 'TESTASSET1',
      serialNumber: 'SN-TEST-ASSET-01',
      name: 'Test Projector XYZ',
      categoryId: category._id,
      condition: 'NEW',
      location: { building: 'Building A', floor: 3, room: 'Room 302' },
      departmentId: department._id,
      status: 'AVAILABLE',
      bookable: true,
      specs: { resolution: '1080p', brightness: '3000 lumens' },
      purchaseInfo: {
        purchaseDate: new Date(),
        purchaseCost: 1200.50,
        vendor: 'Projector Depot',
        warrantyExpiration: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    };

    const assetCreateRes = await request
      .post('/api/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(assetPayload);
    console.log("Create Asset Status (Expected 201):", assetCreateRes.status);
    if (assetCreateRes.status !== 201) throw new Error("Asset creation failed!");
    const assetId = assetCreateRes.body.data._id;
    console.log("Created Asset ID:", assetId);

    // 2b. Prevent Duplicate Asset Tag (Admin)
    console.log("2b. Testing Duplicate Asset Tag rejection...");
    const assetDupTagPayload = { ...assetPayload, serialNumber: 'SN-TEST-ASSET-02' };
    const assetDupTagRes = await request
      .post('/api/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(assetDupTagPayload);
    console.log("Duplicate Tag Status (Expected 400):", assetDupTagRes.status);
    if (assetDupTagRes.status !== 400) throw new Error("Duplicate Asset Tag allowed!");

    // 2c. Create Asset (Staff - Blocked)
    console.log("2c. Creating asset (Staff - Blocked)...");
    const assetStaffCreateRes = await request
      .post('/api/assets')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ ...assetPayload, assetTag: 'TESTASSET2', serialNumber: 'SN-TEST-ASSET-03' });
    console.log("Staff Create Status (Expected 403):", assetStaffCreateRes.status);
    if (assetStaffCreateRes.status !== 403) throw new Error("Staff allowed to create asset!");

    // 2d. Get All Assets with search, filters, pagination (Staff - Allowed)
    console.log("2d. Get all assets with filter by building, pagination, and search...");
    const assetGetAllRes = await request
      .get(`/api/assets?search=Projector&building=Building&categoryId=${category._id}&limit=5`)
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get All Status (Expected 200):", assetGetAllRes.status);
    if (assetGetAllRes.status !== 200 || assetGetAllRes.body.data.pagination.total < 1) {
      throw new Error("Asset list query, pagination, or filtering failed!");
    }
    console.log("Assets total count retrieved:", assetGetAllRes.body.data.pagination.total);

    // 2e. Get Asset By ID
    console.log("2e. Get asset by ID...");
    const assetGetByIdRes = await request
      .get(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get By ID Status (Expected 200):", assetGetByIdRes.status);
    if (assetGetByIdRes.status !== 200 || assetGetByIdRes.body.data.assetTag !== 'TESTASSET1') {
      throw new Error("Get Asset By ID failed!");
    }

    // 2f. Update Asset and verify history logging (Admin)
    console.log("2f. Updating asset details and changing status...");
    const assetUpdateRes = await request
      .put(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Projector Name', status: 'RESERVED' });
    console.log("Update Asset Status (Expected 200):", assetUpdateRes.status);
    if (assetUpdateRes.status !== 200 || assetUpdateRes.body.data.name !== 'Updated Projector Name') {
      throw new Error("Asset update failed!");
    }

    // Verify history logs
    const checkAsset = await Asset.findById(assetId);
    console.log("History events count (Expected 2):", checkAsset.history.length);
    console.log("Last history action (Expected STATUS_CHANGED):", checkAsset.history[1].action);
    if (checkAsset.history.length < 2 || checkAsset.history[1].action !== 'STATUS_CHANGED') {
      throw new Error("History status change logging failed!");
    }

    // 2g. Soft Delete / Retire Asset
    console.log("2g. Soft-deleting/Retiring asset...");
    const assetDeleteRes = await request
      .delete(`/api/assets/${assetId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Retire Asset Status (Expected 200):", assetDeleteRes.status);
    if (assetDeleteRes.status !== 200 || assetDeleteRes.body.data.status !== 'RETIRED') {
      throw new Error("Asset deactivation/retirement failed!");
    }

    // Clean up
    await Category.findByIdAndDelete(category._id);
    await Department.findByIdAndDelete(department._id);
    await Asset.findByIdAndDelete(assetId);
    await User.deleteMany({ username: { $in: ['asset_admin', 'asset_staff'] } });

    console.log("\nAll Asset module verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nAsset Verification Test Failed:");
    console.error(error);
    await User.deleteMany({ username: { $in: ['asset_admin', 'asset_staff'] } });
    await Category.deleteMany({ code: 'ASTC' });
    await Department.deleteMany({ code: 'ASTD' });
    await Asset.deleteMany({ assetTag: 'TESTASSET1' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
