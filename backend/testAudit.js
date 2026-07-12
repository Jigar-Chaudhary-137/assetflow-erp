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
const Audit = require('./models/Audit');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Audit module verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['aud_admin', 'aud_staff'] } });
    await Category.deleteMany({ code: 'AUDC' });
    await Department.deleteMany({ code: 'AUDD' });
    await Asset.deleteMany({ assetTag: { $in: ['AUD-AST-1', 'AUD-AST-2'] } });
    await Audit.deleteMany({});

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'aud_admin',
      email: 'aud_admin@example.com',
      passwordHash,
      name: 'Audit Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'aud_staff',
      email: 'aud_staff@example.com',
      passwordHash,
      name: 'Audit Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create supportive Category & Department
    const category = await Category.create({ name: 'Audit Test Category', code: 'AUDC' });
    const department = await Department.create({ name: 'Audit Test Department', code: 'AUDD' });

    // Create 2 Test Assets
    const asset1 = await Asset.create({
      assetTag: 'AUD-AST-1',
      serialNumber: 'SN-AUD-01',
      name: 'Audit Projector',
      categoryId: category._id,
      location: { building: 'Building E', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE'
    });

    const asset2 = await Asset.create({
      assetTag: 'AUD-AST-2',
      serialNumber: 'SN-AUD-02',
      name: 'Audit Printer',
      categoryId: category._id,
      location: { building: 'Building E', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE'
    });

    console.log("\n--- 2. Testing Audit Cycle Creation ---");

    // 2a. Create valid audit cycle
    console.log("2a. Creating audit cycle (Admin)...");
    const createPayload = {
      auditCode: 'AUD-2026-01',
      auditName: 'Q1 Hardware Inventory Audit',
      auditType: 'INTERNAL',
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      auditorId: adminUser._id,
      targetDepartmentId: department._id,
      targetCategoryId: category._id,
      location: 'Building E',
      scope: 'Verify all projection and print media hardware',
      remarks: 'Standard quarterly cycle',
      selectedAssets: [asset1._id, asset2._id]
    };

    const createRes = await request
      .post('/api/audits')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createPayload);
    console.log("Create Audit Status (Expected 201):", createRes.status);
    if (createRes.status !== 201) throw new Error("Creating audit cycle failed!");
    const auditId = createRes.body.data._id;

    // 2b. Prevent duplicate audit code
    console.log("2b. Testing duplicate audit code rejection...");
    const dupRes = await request
      .post('/api/audits')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createPayload);
    console.log("Duplicate Status (Expected 400):", dupRes.status);
    if (dupRes.status !== 400) throw new Error("Duplicate audit code allowed!");

    // 2c. Staff create blocked (Read-only block on POST /api/audits)
    console.log("2c. Staff creating audit cycle (Blocked)...");
    const staffCreateRes = await request
      .post('/api/audits')
      .set('Authorization', `Bearer ${staffToken}`)
      .send(createPayload);
    console.log("Staff Create Status (Expected 403):", staffCreateRes.status);
    if (staffCreateRes.status !== 403) throw new Error("Staff was allowed to create audit cycle!");

    console.log("\n--- 3. Testing Start Audit ---");

    // 3a. Start Audit (Transition PENDING -> IN_PROGRESS)
    console.log("3a. Starting audit (Admin)...");
    const startRes = await request
      .patch(`/api/audits/${auditId}/start`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Start Status (Expected 200):", startRes.status);
    if (startRes.status !== 200 || startRes.body.data.status !== 'IN_PROGRESS') {
      throw new Error("Failed to start audit cycle!");
    }

    console.log("\n--- 4. Testing Asset Verification ---");

    // 4a. Verify asset 1 (Staff/Auditor - Allowed)
    console.log("4a. Verifying asset 1 (Staff/Auditor)...");
    const verifyPayload1 = {
      assetId: asset1._id,
      found: true,
      condition: 'GOOD',
      remarks: 'Found in ceiling mount as documented'
    };
    const verifyRes1 = await request
      .patch(`/api/audits/${auditId}/verify`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send(verifyPayload1);
    console.log("Verification 1 Status (Expected 200):", verifyRes1.status);
    if (verifyRes1.status !== 200) throw new Error("Verification of asset 1 failed!");

    // 4b. Verify asset 2 as DAMAGED
    console.log("4b. Verifying asset 2 as DAMAGED (Staff/Auditor)...");
    const verifyPayload2 = {
      assetId: asset2._id,
      found: true,
      condition: 'DAMAGED',
      remarks: 'Paper tray broken'
    };
    const verifyRes2 = await request
      .patch(`/api/audits/${auditId}/verify`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send(verifyPayload2);
    console.log("Verification 2 Status (Expected 200):", verifyRes2.status);
    if (verifyRes2.status !== 200) throw new Error("Verification of asset 2 failed!");

    // 4c. Prevent duplicate verification of asset 1
    console.log("4c. Testing duplicate asset verification rejection...");
    const verifyDupRes = await request
      .patch(`/api/audits/${auditId}/verify`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send(verifyPayload1);
    console.log("Duplicate Verify Status (Expected 400):", verifyDupRes.status);
    if (verifyDupRes.status !== 400) throw new Error("Duplicate verification of same asset allowed!");

    console.log("\n--- 5. Testing Complete Audit & Summary Verification ---");

    // Complete audit (Transition IN_PROGRESS -> COMPLETED)
    console.log("5a. Completing audit (Admin)...");
    const completeRes = await request
      .patch(`/api/audits/${auditId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Complete Status (Expected 200):", completeRes.status);
    if (completeRes.status !== 200 || completeRes.body.data.status !== 'COMPLETED') {
      throw new Error("Failed to complete audit cycle!");
    }

    // Verify summary counts
    const summary = completeRes.body.data.summary;
    console.log("Total Audited summary count (Expected 2):", summary.totalAudited);
    console.log("Found summary count (Expected 2):", summary.found);
    console.log("Damaged summary count (Expected 1):", summary.damaged);
    console.log("Missing summary count (Expected 0):", summary.missing);

    if (summary.totalAudited !== 2 || summary.found !== 2 || summary.damaged !== 1 || summary.missing !== 0) {
      throw new Error("Summary counts are incorrect!");
    }

    console.log("\n--- 6. Testing Query Lists & History ---");
    const getListRes = await request
      .get('/api/audits?search=Hardware&limit=5')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get list Status (Expected 200):", getListRes.status);
    if (getListRes.status !== 200 || getListRes.body.data.pagination.total < 1) {
      throw new Error("Query audits list failed!");
    }

    // Clean up
    await Category.findByIdAndDelete(category._id);
    await Department.findByIdAndDelete(department._id);
    await Asset.deleteMany({ assetTag: { $in: ['AUD-AST-1', 'AUD-AST-2'] } });
    await Audit.deleteMany({});
    await User.deleteMany({ username: { $in: ['aud_admin', 'aud_staff'] } });

    console.log("\nAll Asset Audit verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nAudit Verification Test Failed:");
    console.error(error);
    await Category.deleteMany({ code: 'AUDC' });
    await Department.deleteMany({ code: 'AUDD' });
    await Asset.deleteMany({ assetTag: { $in: ['AUD-AST-1', 'AUD-AST-2'] } });
    await Audit.deleteMany({});
    await User.deleteMany({ username: { $in: ['aud_admin', 'aud_staff'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
