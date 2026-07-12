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
    console.log("Connected to MongoDB for Dashboard & Reports verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['rep_admin', 'rep_staff'] } });
    await Category.deleteMany({ code: 'REPC' });
    await Department.deleteMany({ code: 'REPD' });
    await Asset.deleteMany({ assetTag: { $in: ['REP-AST-1', 'REP-AST-2'] } });

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'rep_admin',
      email: 'rep_admin@example.com',
      passwordHash,
      name: 'Report Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'rep_staff',
      email: 'rep_staff@example.com',
      passwordHash,
      name: 'Report Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create Category & Department
    const category = await Category.create({ name: 'Report Test Category', code: 'REPC' });
    const department = await Department.create({ name: 'Report Test Department', code: 'REPD' });

    // Create Test Assets
    const asset1 = await Asset.create({
      assetTag: 'REP-AST-1',
      serialNumber: 'SN-REP-01',
      name: 'Report Projector',
      categoryId: category._id,
      departmentId: department._id,
      location: { building: 'Building F', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE',
      purchaseInfo: { purchaseCost: 1000 }
    });

    const asset2 = await Asset.create({
      assetTag: 'REP-AST-2',
      serialNumber: 'SN-REP-02',
      name: 'Report Printer',
      categoryId: category._id,
      departmentId: department._id,
      location: { building: 'Building F', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE',
      purchaseInfo: { purchaseCost: 500 }
    });

    console.log("\n--- 2. Testing Dashboard API ---");
    const dashboardRes = await request
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Dashboard Status (Expected 200):", dashboardRes.status);
    if (dashboardRes.status !== 200) throw new Error("Dashboard fetch failed!");
    
    const data = dashboardRes.body.data;
    console.log("Assets total in dashboard (Expected >= 2):", data.assets.total);
    console.log("Master Data categories (Expected >= 1):", data.masterData.categories);
    if (data.assets.total < 2 || data.masterData.categories < 1) {
      throw new Error("Dashboard metrics are inaccurate!");
    }

    console.log("\n--- 3. Testing Reports APIs ---");

    // 3a. Asset Report
    console.log("3a. Getting Asset report...");
    const assetReportRes = await request
      .get('/api/reports/assets')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Asset Report Status (Expected 200):", assetReportRes.status);
    if (assetReportRes.status !== 200) throw new Error("Asset report failed!");
    console.log("Count by Category categoryName:", assetReportRes.body.data.countByCategory[0].categoryName);
    console.log("Count by Category count (Expected >= 2):", assetReportRes.body.data.countByCategory[0].count);

    // 3b. Allocation Report
    console.log("3b. Getting Allocation report...");
    const allocReportRes = await request
      .get('/api/reports/allocations')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Allocation Report Status (Expected 200):", allocReportRes.status);
    if (allocReportRes.status !== 200) throw new Error("Allocation report failed!");

    // 3c. Transfer Report
    console.log("3c. Getting Transfer report...");
    const transferReportRes = await request
      .get('/api/reports/transfers')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Transfer Report Status (Expected 200):", transferReportRes.status);
    if (transferReportRes.status !== 200) throw new Error("Transfer report failed!");

    // 3d. Maintenance Report
    console.log("3d. Getting Maintenance report...");
    const maintReportRes = await request
      .get('/api/reports/maintenance')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Maintenance Report Status (Expected 200):", maintReportRes.status);
    if (maintReportRes.status !== 200) throw new Error("Maintenance report failed!");

    // 3e. Audit Report
    console.log("3e. Getting Audit report...");
    const auditReportRes = await request
      .get('/api/reports/audits')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Audit Report Status (Expected 200):", auditReportRes.status);
    if (auditReportRes.status !== 200) throw new Error("Audit report failed!");

    console.log("\n--- 4. Testing RBAC restrictions ---");
    // Staff access block (Staff cannot view dashboard / reports)
    const staffDashRes = await request
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Staff Dashboard HTTP Status (Expected 403):", staffDashRes.status);
    if (staffDashRes.status !== 403) throw new Error("Staff allowed to access dashboard!");

    const staffAssetRepRes = await request
      .get('/api/reports/assets')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Staff Asset Report HTTP Status (Expected 403):", staffAssetRepRes.status);
    if (staffAssetRepRes.status !== 403) throw new Error("Staff allowed to access asset reports!");

    // Clean up
    await Category.findByIdAndDelete(category._id);
    await Department.findByIdAndDelete(department._id);
    await Asset.deleteMany({ assetTag: { $in: ['REP-AST-1', 'REP-AST-2'] } });
    await User.deleteMany({ username: { $in: ['rep_admin', 'rep_staff'] } });

    console.log("\nAll Dashboard & Reports module verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nReports Verification Test Failed:");
    console.error(error);
    await Category.deleteMany({ code: 'REPC' });
    await Department.deleteMany({ code: 'REPD' });
    await Asset.deleteMany({ assetTag: { $in: ['REP-AST-1', 'REP-AST-2'] } });
    await User.deleteMany({ username: { $in: ['rep_admin', 'rep_staff'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
