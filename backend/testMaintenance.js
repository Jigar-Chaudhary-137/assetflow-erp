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
const Transfer = require('./models/Transfer');
const Maintenance = require('./models/Maintenance');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Maintenance module verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['maint_admin', 'maint_staff', 'maint_emp'] } });
    await Category.deleteMany({ code: 'MNTC' });
    await Department.deleteMany({ code: 'MNTD' });
    await Asset.deleteMany({ assetTag: { $in: ['MNT-AST-1', 'MNT-AST-2'] } });
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});
    await Maintenance.deleteMany({});

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'maint_admin',
      email: 'maint_admin@example.com',
      passwordHash,
      name: 'Maint Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'maint_staff',
      email: 'maint_staff@example.com',
      passwordHash,
      name: 'Maint Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const employeeUser = await User.create({
      username: 'maint_emp',
      email: 'maint_emp@example.com',
      passwordHash,
      name: 'Maint Target Employee',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create Category & Department
    const category = await Category.create({ name: 'Maintenance Test Category', code: 'MNTC' });
    const department = await Department.create({ name: 'Maintenance Test Department', code: 'MNTD' });

    // Create Asset
    const asset1 = await Asset.create({
      assetTag: 'MNT-AST-1',
      serialNumber: 'SN-MNT-01',
      name: 'Maintenance Server',
      categoryId: category._id,
      location: { building: 'Building D', floor: 2, room: 'Room 204' },
      status: 'AVAILABLE'
    });

    console.log("\n--- 2. Testing Maintenance Requests Creation ---");

    // 2a. Create valid maintenance request
    console.log("2a. Scheduling a maintenance request (Admin)...");
    const schedulePayload = {
      assetId: asset1._id,
      issueDescription: 'CPU fan making excessive noise',
      priority: 'MEDIUM',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedCost: 150.00,
      notes: 'Needs technician onsite inspection'
    };

    const scheduleRes = await request
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(schedulePayload);
    console.log("Schedule Status (Expected 201):", scheduleRes.status);
    if (scheduleRes.status !== 201) throw new Error("Scheduling maintenance failed!");
    const maintenanceId = scheduleRes.body.data._id;

    // 2b. Prevent duplicate active maintenance request
    console.log("2b. Testing duplicate active maintenance scheduling rejection...");
    const duplicateRes = await request
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(schedulePayload);
    console.log("Duplicate Status (Expected 400):", duplicateRes.status);
    if (duplicateRes.status !== 400) throw new Error("Duplicate active maintenance request allowed!");

    // 2c. Staff create blocked (Read-only block on POST /api/maintenance)
    console.log("2c. Staff scheduling maintenance request (Blocked)...");
    const staffScheduleRes = await request
      .post('/api/maintenance')
      .set('Authorization', `Bearer ${staffToken}`)
      .send(schedulePayload);
    console.log("Staff Schedule Status (Expected 403):", staffScheduleRes.status);
    if (staffScheduleRes.status !== 403) throw new Error("Staff was allowed to schedule maintenance!");

    console.log("\n--- 3. Testing Start Maintenance Workflow & Blocks ---");

    // 3a. Start maintenance (Transition SCHEDULED -> IN_PROGRESS)
    console.log("3a. Starting maintenance (Admin)...");
    const startRes = await request
      .patch(`/api/maintenance/${maintenanceId}/start`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Start Status (Expected 200):", startRes.status);
    if (startRes.status !== 200 || startRes.body.data.status !== 'IN_PROGRESS') {
      throw new Error("Failed to start maintenance!");
    }

    // Verify Asset status is now UNDER_MAINTENANCE
    const checkAssetMaint = await Asset.findById(asset1._id);
    console.log("Asset status (Expected UNDER_MAINTENANCE):", checkAssetMaint.status);
    if (checkAssetMaint.status !== 'UNDER_MAINTENANCE') throw new Error("Asset status was not updated to UNDER_MAINTENANCE!");

    // 3b. Verify allocation is blocked while UNDER_MAINTENANCE
    console.log("3b. Testing that checkout allocation is blocked while under maintenance...");
    const checkoutRes = await request
      .post('/api/allocations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetId: asset1._id,
        employeeId: employeeUser._id,
        expectedReturnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      });
    console.log("Checkout Block Status (Expected 400):", checkoutRes.status);
    if (checkoutRes.status !== 400) throw new Error("Allowed checkout of asset under maintenance!");

    // 3c. Verify transfer is blocked while UNDER_MAINTENANCE
    console.log("3c. Testing that transfer request is blocked while under maintenance...");
    const transferRes = await request
      .post('/api/transfers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        assetId: asset1._id,
        toEmployeeId: employeeUser._id
      });
    console.log("Transfer Block Status (Expected 400):", transferRes.status);
    if (transferRes.status !== 400) throw new Error("Allowed transfer of asset under maintenance!");

    console.log("\n--- 4. Testing Complete Maintenance ---");

    // Complete maintenance
    console.log("4a. Completing maintenance task...");
    const completeRes = await request
      .patch(`/api/maintenance/${maintenanceId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        resolutionDetails: 'Replaced CPU heat sink and fan assembly',
        actualCost: 175.50,
        vendor: 'TechFix Solutions'
      });
    console.log("Complete Status (Expected 200):", completeRes.status);
    if (completeRes.status !== 200 || completeRes.body.data.status !== 'COMPLETED') {
      throw new Error("Failed to complete maintenance!");
    }

    // Verify Asset status returns to AVAILABLE
    const checkAssetAvail = await Asset.findById(asset1._id);
    console.log("Asset status after completion (Expected AVAILABLE):", checkAssetAvail.status);
    if (checkAssetAvail.status !== 'AVAILABLE') throw new Error("Asset status was not returned to AVAILABLE!");

    // Verify history logs
    console.log("Asset history count (Expected 3):", checkAssetAvail.history.length);
    console.log("Last history action (Expected MAINTENANCE_COMPLETED):", checkAssetAvail.history[checkAssetAvail.history.length - 1].action);
    if (checkAssetAvail.history[checkAssetAvail.history.length - 1].action !== 'MAINTENANCE_COMPLETED') {
      throw new Error("History status change logging failed!");
    }

    console.log("\n--- 5. Testing Query Lists & History ---");
    const getListRes = await request
      .get('/api/maintenance?search=noise&limit=5')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get List Status (Expected 200):", getListRes.status);
    if (getListRes.status !== 200 || getListRes.body.data.pagination.total < 1) {
      throw new Error("Query maintenance list failed!");
    }

    // Clean up
    await Category.findByIdAndDelete(category._id);
    await Department.findByIdAndDelete(department._id);
    await Asset.deleteMany({ assetTag: { $in: ['MNT-AST-1', 'MNT-AST-2'] } });
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});
    await Maintenance.deleteMany({});
    await User.deleteMany({ username: { $in: ['maint_admin', 'maint_staff', 'maint_emp'] } });

    console.log("\nAll Asset Maintenance verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nMaintenance Verification Test Failed:");
    console.error(error);
    await Category.deleteMany({ code: 'MNTC' });
    await Department.deleteMany({ code: 'MNTD' });
    await Asset.deleteMany({ assetTag: { $in: ['MNT-AST-1', 'MNT-AST-2'] } });
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});
    await Maintenance.deleteMany({});
    await User.deleteMany({ username: { $in: ['maint_admin', 'maint_staff', 'maint_emp'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
