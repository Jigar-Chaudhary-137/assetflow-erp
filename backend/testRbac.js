const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for RBAC verification tests.");

    // Clean up if test users exist
    await User.deleteMany({ username: { $in: ['test_admin', 'test_manager', 'test_staff', 'test_invalid'] } });

    // Helper to generate salt and hash
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create test users
    console.log("Creating test users with different roles...");
    const adminUser = await User.create({
      username: 'test_admin',
      email: 'test_admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const managerUser = await User.create({
      username: 'test_manager',
      email: 'test_manager@example.com',
      passwordHash,
      name: 'Manager User',
      role: 'ASSET_MANAGER', // Maps to Manager (weight 2)
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'test_staff',
      email: 'test_staff@example.com',
      passwordHash,
      name: 'Staff User',
      role: 'EMPLOYEE', // Maps to Staff (weight 1)
      status: 'ACTIVE'
    });

    const invalidUser = await User.create({
      username: 'test_invalid',
      email: 'test_invalid@example.com',
      passwordHash,
      name: 'Invalid User',
      role: 'GUEST', // Invalid/unmapped role
      status: 'ACTIVE'
    });

    // Generate tokens
    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const managerToken = generateAccessToken(managerUser._id, managerUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);
    const invalidToken = generateAccessToken(invalidUser._id, invalidUser.role);

    console.log("\n--- Testing Route Authorization ---");

    // 1. Admin Access
    console.log("\n1. Testing Admin access to /admin-only...");
    const adminToAdminRes = await request.get('/api/auth/admin-only').set('Authorization', `Bearer ${adminToken}`);
    console.log("Status:", adminToAdminRes.status, "(Expected 200)");
    if (adminToAdminRes.status !== 200) throw new Error("Admin denied access to Admin route!");

    // 2. Manager to Admin Route (Denied)
    console.log("\n2. Testing Manager access to /admin-only...");
    const managerToAdminRes = await request.get('/api/auth/admin-only').set('Authorization', `Bearer ${managerToken}`);
    console.log("Status:", managerToAdminRes.status, "(Expected 403)");
    if (managerToAdminRes.status !== 403) throw new Error("Manager allowed access to Admin route!");

    // 3. Manager to Manager Route (Allowed)
    console.log("Testing Manager access to /manager-only...");
    const managerToManagerRes = await request.get('/api/auth/manager-only').set('Authorization', `Bearer ${managerToken}`);
    console.log("Status:", managerToManagerRes.status, "(Expected 200)");
    if (managerToManagerRes.status !== 200) throw new Error("Manager denied access to Manager route!");

    // 4. Staff to Admin Route (Denied)
    console.log("\n4. Testing Staff access to /admin-only...");
    const staffToAdminRes = await request.get('/api/auth/admin-only').set('Authorization', `Bearer ${staffToken}`);
    console.log("Status:", staffToAdminRes.status, "(Expected 403)");
    if (staffToAdminRes.status !== 403) throw new Error("Staff allowed access to Admin route!");

    // 5. Staff to Manager Route (Denied)
    console.log("Testing Staff access to /manager-only...");
    const staffToManagerRes = await request.get('/api/auth/manager-only').set('Authorization', `Bearer ${staffToken}`);
    console.log("Status:", staffToManagerRes.status, "(Expected 403)");
    if (staffToManagerRes.status !== 403) throw new Error("Staff allowed access to Manager route!");

    // 6. Staff to Staff Route (Allowed)
    console.log("Testing Staff access to /staff-only...");
    const staffToStaffRes = await request.get('/api/auth/staff-only').set('Authorization', `Bearer ${staffToken}`);
    console.log("Status:", staffToStaffRes.status, "(Expected 200)");
    if (staffToStaffRes.status !== 200) throw new Error("Staff denied access to Staff route!");

    // 7. Invalid Role (Guest) Access (Denied)
    console.log("\n7. Testing Invalid Role access to /staff-only...");
    const invalidToStaffRes = await request.get('/api/auth/staff-only').set('Authorization', `Bearer ${invalidToken}`);
    console.log("Status:", invalidToStaffRes.status, "(Expected 403)");
    if (invalidToStaffRes.status !== 403) throw new Error("Invalid role allowed access to Staff route!");

    // 8. Missing JWT Access (Denied)
    console.log("\n8. Testing Missing JWT access to /staff-only...");
    const missingJwtRes = await request.get('/api/auth/staff-only');
    console.log("Status:", missingJwtRes.status, "(Expected 401)");
    if (missingJwtRes.status !== 401) throw new Error("Route allowed access without JWT!");

    // Clean up
    await User.deleteMany({ username: { $in: ['test_admin', 'test_manager', 'test_staff', 'test_invalid'] } });
    console.log("\nCleanup completed: Test users deleted.");

    console.log("\nAll RBAC verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nRBAC Verification Test Failed:");
    console.error(error);
    await User.deleteMany({ username: { $in: ['test_admin', 'test_manager', 'test_staff', 'test_invalid'] } });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
