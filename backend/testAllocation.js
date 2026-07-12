const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const Category = require('./models/Category');
const Department = require('./models/Department');
const Asset = require('./models/Asset');
const Allocation = require('./models/Allocation');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Allocation module verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['alloc_admin', 'alloc_staff', 'alloc_employee'] } });
    await Category.deleteMany({ code: 'ALCC' });
    await Department.deleteMany({ code: 'ALCD' });
    await Asset.deleteMany({ assetTag: { $in: ['ALC-AST-1', 'ALC-AST-2', 'ALC-AST-3'] } });
    await Allocation.deleteMany({}); // Warning: cleaning test collection is fine

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'alloc_admin',
      email: 'alloc_admin@example.com',
      passwordHash,
      name: 'Alloc Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'alloc_staff',
      email: 'alloc_staff@example.com',
      passwordHash,
      name: 'Alloc Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const employeeUser = await User.create({
      username: 'alloc_employee',
      email: 'alloc_employee@example.com',
      passwordHash,
      name: 'Alloc Employee Target',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create supportive Category & Department
    const category = await Category.create({ name: 'Allocation Test Category', code: 'ALCC' });
    const department = await Department.create({ name: 'Allocation Test Department', code: 'ALCD' });

    // Update employeeUser to belong to department
    employeeUser.departmentId = department._id;
    await employeeUser.save();

    // Create 3 Test Assets
    const asset1 = await Asset.create({
      assetTag: 'ALC-AST-1',
      serialNumber: 'SN-ALC-01',
      name: 'Allocation Monitor',
      categoryId: category._id,
      location: { building: 'Building B', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE'
    });

    const assetRetired = await Asset.create({
      assetTag: 'ALC-AST-2',
      serialNumber: 'SN-ALC-02',
      name: 'Retired Laptop',
      categoryId: category._id,
      location: { building: 'Building B', floor: 1, room: 'Room 101' },
      status: 'RETIRED'
    });

    const assetMaint = await Asset.create({
      assetTag: 'ALC-AST-3',
      serialNumber: 'SN-ALC-03',
      name: 'Maintenance Server',
      categoryId: category._id,
      location: { building: 'Building B', floor: 1, room: 'Room 101' },
      status: 'UNDER_MAINTENANCE'
    });

    console.log("\n--- 2. Testing Asset Allocation (Check Out) ---");

    // 2a. Allocate AVAILABLE asset
    console.log("2a. Allocating AVAILABLE asset (Admin)...");
    const checkoutPayload = {
      assetId: asset1._id,
      employeeId: employeeUser._id,
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Initial checkout for test'
    };

    const checkoutRes = await request
      .post('/api/allocations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(checkoutPayload);
    console.log("Checkout Status (Expected 201):", checkoutRes.status);
    if (checkoutRes.status !== 201) throw new Error("Checkout allocation failed!");
    const allocationId = checkoutRes.body.data._id;

    // Verify Asset status changed to ALLOCATED
    const checkAsset1 = await Asset.findById(asset1._id);
    console.log("Asset status after checkout (Expected ALLOCATED):", checkAsset1.status);
    if (checkAsset1.status !== 'ALLOCATED') throw new Error("Asset status was not updated to ALLOCATED!");

    // 2b. Prevent double allocation of already allocated asset
    console.log("\n2b. Testing Double Allocation rejection...");
    const dupCheckoutRes = await request
      .post('/api/allocations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(checkoutPayload);
    console.log("Dup Checkout Status (Expected 400):", dupCheckoutRes.status);
    if (dupCheckoutRes.status !== 400) throw new Error("Double allocation allowed!");

    // 2c. Prevent allocation of RETIRED asset
    console.log("\n2c. Testing Retired Asset Allocation rejection...");
    const retiredCheckoutRes = await request
      .post('/api/allocations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...checkoutPayload, assetId: assetRetired._id });
    console.log("Retired Checkout Status (Expected 400):", retiredCheckoutRes.status);
    if (retiredCheckoutRes.status !== 400) throw new Error("Retired asset allocation allowed!");

    // 2d. Prevent allocation of UNDER_MAINTENANCE asset
    console.log("\n2d. Testing Under Maintenance Asset Allocation rejection...");
    const maintCheckoutRes = await request
      .post('/api/allocations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...checkoutPayload, assetId: assetMaint._id });
    console.log("Maintenance Checkout Status (Expected 400):", maintCheckoutRes.status);
    if (maintCheckoutRes.status !== 400) throw new Error("Under maintenance asset allocation allowed!");

    // 2e. Staff access limit check (Read-only block on POST)
    console.log("\n2e. Testing Staff block on checkout...");
    const staffCheckoutRes = await request
      .post('/api/allocations')
      .set('Authorization', `Bearer ${staffToken}`)
      .send(checkoutPayload);
    console.log("Staff Checkout Status (Expected 403):", staffCheckoutRes.status);
    if (staffCheckoutRes.status !== 403) throw new Error("Staff allowed to checkout allocation!");

    console.log("\n--- 3. Testing Allocation History & Query ---");
    
    // 3a. Get Active allocations list
    console.log("3a. Get active allocations...");
    const activeRes = await request
      .get('/api/allocations/active?search=Monitor')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get Active Status (Expected 200):", activeRes.status);
    if (activeRes.status !== 200 || activeRes.body.data.pagination.total < 1) {
      throw new Error("Active allocations query failed!");
    }

    // 3b. Get Allocation by ID
    console.log("3b. Get allocation by ID...");
    const getByIdRes = await request
      .get(`/api/allocations/${allocationId}`)
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get By ID Status (Expected 200):", getByIdRes.status);
    if (getByIdRes.status !== 200 || getByIdRes.body.data.notes !== 'Initial checkout for test') {
      throw new Error("Get allocation by ID failed!");
    }

    console.log("\n--- 4. Testing Asset Return (Check In) ---");

    // 4a. Return Allocated Asset
    console.log("4a. Returning allocated asset (Admin)...");
    const returnRes = await request
      .post(`/api/allocations/${allocationId}/return`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ notes: 'Returned in good condition' });
    console.log("Return Status (Expected 200):", returnRes.status);
    if (returnRes.status !== 200) throw new Error("Return allocation failed!");

    // Verify Asset status changed back to AVAILABLE
    const checkAssetReturned = await Asset.findById(asset1._id);
    console.log("Asset status after return (Expected AVAILABLE):", checkAssetReturned.status);
    if (checkAssetReturned.status !== 'AVAILABLE') throw new Error("Asset status was not updated back to AVAILABLE!");

    // Clean up
    await Allocation.findByIdAndDelete(allocationId);
    await Asset.deleteMany({ assetTag: { $in: ['ALC-AST-1', 'ALC-AST-2', 'ALC-AST-3'] } });
    await Category.findByIdAndDelete(category._id);
    await Department.findByIdAndDelete(department._id);
    await User.deleteMany({ username: { $in: ['alloc_admin', 'alloc_staff', 'alloc_employee'] } });

    console.log("\nAll Asset Allocation & Booking Validation verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nAllocation Verification Test Failed:");
    console.error(error);
    await Asset.deleteMany({ assetTag: { $in: ['ALC-AST-1', 'ALC-AST-2', 'ALC-AST-3'] } });
    await Category.deleteMany({ code: 'ALCC' });
    await Department.deleteMany({ code: 'ALCD' });
    await User.deleteMany({ username: { $in: ['alloc_admin', 'alloc_staff', 'alloc_employee'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
