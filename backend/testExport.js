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
    console.log("Connected to MongoDB for Export Module verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['exp_admin', 'exp_staff'] } });
    await Category.deleteMany({ code: 'EXPC' });
    await Department.deleteMany({ code: 'EXPD' });
    await Asset.deleteMany({ assetTag: { $in: ['EXP-AST-1'] } });

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'exp_admin',
      email: 'exp_admin@example.com',
      passwordHash,
      name: 'Export Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'exp_staff',
      email: 'exp_staff@example.com',
      passwordHash,
      name: 'Export Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create supportive category and department
    const category = await Category.create({ name: 'Export Test Category', code: 'EXPC' });
    const department = await Department.create({ name: 'Export Test Department', code: 'EXPD' });

    // Create Test Asset
    const asset1 = await Asset.create({
      assetTag: 'EXP-AST-1',
      serialNumber: 'SN-EXP-01',
      name: 'Export Projector',
      categoryId: category._id,
      departmentId: department._id,
      location: { building: 'Building E', floor: 2, room: 'Room 202' },
      status: 'AVAILABLE',
      purchaseInfo: { purchaseCost: 1500 }
    });

    console.log("\n--- 2. Verifying Dashboard Export (Excel & PDF) ---");
    
    // Excel Dashboard
    const resDashExcel = await request
      .get('/api/reports/dashboard/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Dashboard Excel Download Status:", resDashExcel.status);
    console.log("Dashboard Excel MIME Type:", resDashExcel.headers['content-type']);
    console.log("Dashboard Excel Filename Header:", resDashExcel.headers['content-disposition']);
    
    if (resDashExcel.status !== 200) throw new Error("Dashboard Excel download failed!");
    if (resDashExcel.headers['content-type'] !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      throw new Error("Dashboard Excel wrong MIME Type!");
    }
    if (!resDashExcel.headers['content-disposition'].includes('dashboard-summary-') || !resDashExcel.headers['content-disposition'].includes('.xlsx')) {
      throw new Error("Dashboard Excel incorrect filename structure!");
    }

    // PDF Dashboard
    const resDashPDF = await request
      .get('/api/reports/dashboard/export/pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Dashboard PDF Download Status:", resDashPDF.status);
    console.log("Dashboard PDF MIME Type:", resDashPDF.headers['content-type']);
    console.log("Dashboard PDF Filename Header:", resDashPDF.headers['content-disposition']);

    if (resDashPDF.status !== 200) throw new Error("Dashboard PDF download failed!");
    if (resDashPDF.headers['content-type'] !== 'application/pdf') {
      throw new Error("Dashboard PDF wrong MIME Type!");
    }
    if (!resDashPDF.headers['content-disposition'].includes('dashboard-summary-') || !resDashPDF.headers['content-disposition'].includes('.pdf')) {
      throw new Error("Dashboard PDF incorrect filename structure!");
    }

    console.log("\n--- 3. Verifying Report Export Module Endpoints ---");

    // 3a. Asset Export Excel
    const resAssetExcel = await request
      .get(`/api/reports/assets/export/excel?categoryId=${category._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Asset Excel Download Status:", resAssetExcel.status);
    if (resAssetExcel.status !== 200) throw new Error("Asset Excel export failed!");

    // 3b. Asset Export PDF
    const resAssetPDF = await request
      .get(`/api/reports/assets/export/pdf?categoryId=${category._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Asset PDF Download Status:", resAssetPDF.status);
    if (resAssetPDF.status !== 200) throw new Error("Asset PDF export failed!");

    // 3c. Allocation Export Excel & PDF
    const resAllocExcel = await request
      .get('/api/reports/allocations/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Allocation Excel Status:", resAllocExcel.status);
    if (resAllocExcel.status !== 200) throw new Error("Allocation Excel failed!");

    const resAllocPDF = await request
      .get('/api/reports/allocations/export/pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Allocation PDF Status:", resAllocPDF.status);
    if (resAllocPDF.status !== 200) throw new Error("Allocation PDF failed!");

    // 3d. Transfer Export Excel & PDF
    const resTransExcel = await request
      .get('/api/reports/transfers/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Transfer Excel Status:", resTransExcel.status);
    if (resTransExcel.status !== 200) throw new Error("Transfer Excel failed!");

    const resTransPDF = await request
      .get('/api/reports/transfers/export/pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Transfer PDF Status:", resTransPDF.status);
    if (resTransPDF.status !== 200) throw new Error("Transfer PDF failed!");

    // 3e. Maintenance Export Excel & PDF
    const resMaintExcel = await request
      .get('/api/reports/maintenance/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Maintenance Excel Status:", resMaintExcel.status);
    if (resMaintExcel.status !== 200) throw new Error("Maintenance Excel failed!");

    const resMaintPDF = await request
      .get('/api/reports/maintenance/export/pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Maintenance PDF Status:", resMaintPDF.status);
    if (resMaintPDF.status !== 200) throw new Error("Maintenance PDF failed!");

    // 3f. Audit Export Excel & PDF
    const resAuditExcel = await request
      .get('/api/reports/audits/export/excel')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Audit Excel Status:", resAuditExcel.status);
    if (resAuditExcel.status !== 200) throw new Error("Audit Excel failed!");

    const resAuditPDF = await request
      .get('/api/reports/audits/export/pdf')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Audit PDF Status:", resAuditPDF.status);
    if (resAuditPDF.status !== 200) throw new Error("Audit PDF failed!");

    console.log("\n--- 4. Testing RBAC restrictions ---");
    
    // Staff user must get 403 Forbidden
    const resStaffExcel = await request
      .get('/api/reports/dashboard/export/excel')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Staff Excel Export HTTP Status (Expected 403):", resStaffExcel.status);
    if (resStaffExcel.status !== 403) throw new Error("Staff user allowed to export dashboard excel!");

    const resStaffPDF = await request
      .get('/api/reports/assets/export/pdf')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Staff PDF Export HTTP Status (Expected 403):", resStaffPDF.status);
    if (resStaffPDF.status !== 403) throw new Error("Staff user allowed to export assets PDF!");

    // Clean up test records
    await Category.findByIdAndDelete(category._id);
    await Department.findByIdAndDelete(department._id);
    await Asset.deleteMany({ assetTag: { $in: ['EXP-AST-1'] } });
    await User.deleteMany({ username: { $in: ['exp_admin', 'exp_staff'] } });

    console.log("\nAll Export Module verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nExport Verification Test Failed:");
    console.error(error);
    await Category.deleteMany({ code: 'EXPC' });
    await Department.deleteMany({ code: 'EXPD' });
    await Asset.deleteMany({ assetTag: { $in: ['EXP-AST-1'] } });
    await User.deleteMany({ username: { $in: ['exp_admin', 'exp_staff'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
