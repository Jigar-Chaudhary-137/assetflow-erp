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
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Transfer module verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['tr_admin', 'tr_staff', 'tr_emp1', 'tr_emp2'] } });
    await Category.deleteMany({ code: 'TRC' });
    await Department.deleteMany({ code: { $in: ['TRD1', 'TRD2'] } });
    await Asset.deleteMany({ assetTag: { $in: ['TR-AST-1', 'TR-AST-2'] } });
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'tr_admin',
      email: 'tr_admin@example.com',
      passwordHash,
      name: 'TR Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'tr_staff',
      email: 'tr_staff@example.com',
      passwordHash,
      name: 'TR Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const sourceEmp = await User.create({
      username: 'tr_emp1',
      email: 'tr_emp1@example.com',
      passwordHash,
      name: 'Source User',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const destEmp = await User.create({
      username: 'tr_emp2',
      email: 'tr_emp2@example.com',
      passwordHash,
      name: 'Destination User',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create Category & Departments
    const category = await Category.create({ name: 'Transfer Test Category', code: 'TRC' });
    const dept1 = await Department.create({ name: 'Transfer Department 1', code: 'TRD1' });
    const dept2 = await Department.create({ name: 'Transfer Department 2', code: 'TRD2' });

    // Update employees with departments
    sourceEmp.departmentId = dept1._id;
    await sourceEmp.save();

    destEmp.departmentId = dept2._id;
    await destEmp.save();

    // Create Test Assets
    const assetAllocated = await Asset.create({
      assetTag: 'TR-AST-1',
      serialNumber: 'SN-TR-01',
      name: 'Allocated Monitor',
      categoryId: category._id,
      departmentId: dept1._id,
      location: { building: 'Building C', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE'
    });

    const assetUnallocated = await Asset.create({
      assetTag: 'TR-AST-2',
      serialNumber: 'SN-TR-02',
      name: 'Unallocated Monitor',
      categoryId: category._id,
      location: { building: 'Building C', floor: 1, room: 'Room 101' },
      status: 'AVAILABLE'
    });

    // Allocate assetAllocated to sourceEmp
    const activeAllocation = await Allocation.create({
      assetId: assetAllocated._id,
      employeeId: sourceEmp._id,
      allocatedById: adminUser._id,
      allocatedDate: new Date(),
      status: 'ACTIVE'
    });
    assetAllocated.status = 'ALLOCATED';
    await assetAllocated.save();

    console.log("\n--- 2. Testing Transfer Creation Rejections ---");

    // 2a. Reject transfer of unallocated asset
    console.log("2a. Request transfer of unallocated asset...");
    const unallocatedRes = await request
      .post('/api/transfers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ assetId: assetUnallocated._id, toEmployeeId: destEmp._id });
    console.log("Unallocated Transfer Status (Expected 400):", unallocatedRes.status);
    if (unallocatedRes.status !== 400) throw new Error("Allowed transfer of unallocated asset!");

    // 2b. Reject transfer to self
    console.log("2b. Request transfer to the current holder (self)...");
    const selfRes = await request
      .post('/api/transfers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ assetId: assetAllocated._id, toEmployeeId: sourceEmp._id });
    console.log("Self Transfer Status (Expected 400):", selfRes.status);
    if (selfRes.status !== 400) throw new Error("Allowed transfer to the same user!");

    // 2c. Successful creation of a valid transfer request (Staff is allowed to create)
    console.log("2c. Creating a valid transfer request (Staff)...");
    const validTransferRes = await request
      .post('/api/transfers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ assetId: assetAllocated._id, toEmployeeId: destEmp._id, comments: 'Transfer for project expansion' });
    console.log("Submit Transfer Status (Expected 201):", validTransferRes.status);
    if (validTransferRes.status !== 201) throw new Error("Failed to create valid transfer request!");
    const transferId = validTransferRes.body.data._id;

    console.log("\n--- 3. Testing Transfer Rejection ---");

    // 3a. Staff try to reject (Blocked)
    console.log("3a. Staff rejecting transfer request (Blocked)...");
    const staffRejectRes = await request
      .patch(`/api/transfers/${transferId}/reject`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ reason: 'Not authorized staff rejection' });
    console.log("Staff Reject Status (Expected 403):", staffRejectRes.status);
    if (staffRejectRes.status !== 403) throw new Error("Staff was allowed to reject transfer!");

    // 3b. Admin reject (Allowed, sets state, does NOT update allocation/asset)
    console.log("3b. Admin rejecting transfer request (Allowed)...");
    const adminRejectRes = await request
      .patch(`/api/transfers/${transferId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Wrong department choice' });
    console.log("Admin Reject Status (Expected 200):", adminRejectRes.status);
    if (adminRejectRes.status !== 200 || adminRejectRes.body.data.status !== 'REJECTED') {
      throw new Error("Admin rejection failed!");
    }

    // Verify allocation remains ACTIVE and asset remains ALLOCATED to sourceEmp
    const verifyMaintAlloc = await Allocation.findById(activeAllocation._id);
    const verifyMaintAsset = await Asset.findById(assetAllocated._id);
    console.log("Rejection check - allocation status (Expected ACTIVE):", verifyMaintAlloc.status);
    console.log("Rejection check - asset departmentId (Expected dept1):", verifyMaintAsset.departmentId.toString() === dept1._id.toString());
    if (verifyMaintAlloc.status !== 'ACTIVE' || verifyMaintAsset.status !== 'ALLOCATED') {
      throw new Error("Rejection corrupted allocation or asset states!");
    }

    console.log("\n--- 4. Testing Transfer Approval ---");

    // Submit new valid request to approve
    const secondReqRes = await request
      .post('/api/transfers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ assetId: assetAllocated._id, toEmployeeId: destEmp._id, comments: 'Second try' });
    const secondTransferId = secondReqRes.body.data._id;

    // Approve request
    console.log("4a. Admin approving second transfer request...");
    const approveRes = await request
      .patch(`/api/transfers/${secondTransferId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Approve Status (Expected 200):", approveRes.status);
    if (approveRes.status !== 200) throw new Error("Approval failed!");

    // Verify old allocation is closed as TRANSFERRED
    const verifyOldAlloc = await Allocation.findById(activeAllocation._id);
    console.log("Old allocation status (Expected TRANSFERRED):", verifyOldAlloc.status);
    if (verifyOldAlloc.status !== 'TRANSFERRED') throw new Error("Old allocation was not closed!");

    // Verify new active allocation is created for destEmp
    const verifyNewAlloc = await Allocation.findOne({ assetId: assetAllocated._id, status: 'ACTIVE' });
    console.log("New allocation user matches destEmp:", verifyNewAlloc.employeeId.toString() === destEmp._id.toString());
    if (!verifyNewAlloc) throw new Error("New allocation was not created!");

    // Verify Asset custodian department updated to dept2
    const verifyAssetPostApprove = await Asset.findById(assetAllocated._id);
    console.log("Asset department updated to dept2:", verifyAssetPostApprove.departmentId.toString() === dept2._id.toString());
    if (verifyAssetPostApprove.departmentId.toString() !== dept2._id.toString()) {
      throw new Error("Asset custodian department was not synchronized!");
    }

    console.log("\n--- 5. Testing Query History ---");
    const getListRes = await request
      .get('/api/transfers?search=Second&limit=5')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get list Status (Expected 200):", getListRes.status);
    if (getListRes.status !== 200 || getListRes.body.data.pagination.total < 1) {
      throw new Error("Query list failed!");
    }

    // Clean up
    await Category.findByIdAndDelete(category._id);
    await Department.deleteMany({ code: { $in: ['TRD1', 'TRD2'] } });
    await Asset.deleteMany({ assetTag: { $in: ['TR-AST-1', 'TR-AST-2'] } });
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});
    await User.deleteMany({ username: { $in: ['tr_admin', 'tr_staff', 'tr_emp1', 'tr_emp2'] } });

    console.log("\nAll Asset Transfer verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nTransfer Verification Test Failed:");
    console.error(error);
    await Category.deleteMany({ code: 'TRC' });
    await Department.deleteMany({ code: { $in: ['TRD1', 'TRD2'] } });
    await Asset.deleteMany({ assetTag: { $in: ['TR-AST-1', 'TR-AST-2'] } });
    await Allocation.deleteMany({});
    await Transfer.deleteMany({});
    await User.deleteMany({ username: { $in: ['tr_admin', 'tr_staff', 'tr_emp1', 'tr_emp2'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
