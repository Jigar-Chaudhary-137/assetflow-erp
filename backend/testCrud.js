const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const Category = require('./models/Category');
const Department = require('./models/Department');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for User Management & CRUD verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['crud_admin', 'crud_staff', 'test_mgmt_user'] } });
    await Category.deleteMany({ code: 'TESTC' });
    await Department.deleteMany({ code: 'TESTD' });

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'crud_admin',
      email: 'crud_admin@example.com',
      passwordHash,
      name: 'CRUD Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'crud_staff',
      email: 'crud_staff@example.com',
      passwordHash,
      name: 'CRUD Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    console.log("\n--- 1. Testing Category CRUD ---");
    // Create (Admin)
    console.log("1a. Creating category (Admin)...");
    const catPayload = {
      name: 'Test Category',
      code: 'TESTC',
      description: 'Temporary category for CRUD verification',
      customFields: [
        { fieldName: 'testField', label: 'Test Field', fieldType: 'STRING', required: true }
      ]
    };
    const catCreateRes = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(catPayload);
    console.log("Create Status (Expected 201):", catCreateRes.status);
    if (catCreateRes.status !== 201) throw new Error("Category creation failed!");
    const categoryId = catCreateRes.body.data._id;

    // Create (Staff - Blocked)
    console.log("1b. Creating category (Staff - Blocked)...");
    const catStaffCreateRes = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: 'Staff Category', code: 'STAFF' });
    console.log("Staff Create Status (Expected 403):", catStaffCreateRes.status);
    if (catStaffCreateRes.status !== 403) throw new Error("Staff allowed to create category!");

    // Get All with search & pagination (Staff - Allowed)
    console.log("1c. Get all categories with search & pagination (Staff)...");
    const catGetAllRes = await request
      .get('/api/categories?search=Test&limit=5')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get All Status (Expected 200):", catGetAllRes.status);
    console.log("Get All Total Found (Expected >= 1):", catGetAllRes.body.data.pagination.total);
    if (catGetAllRes.status !== 200 || catGetAllRes.body.data.pagination.total < 1) {
      throw new Error("Categories query/search failed!");
    }

    // Get By Id
    console.log("1d. Get category by ID...");
    const catGetByIdRes = await request
      .get(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get By ID Status (Expected 200):", catGetByIdRes.status);
    if (catGetByIdRes.status !== 200) throw new Error("Get category by ID failed!");

    // Update
    console.log("1e. Updating category...");
    const catUpdateRes = await request
      .put(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Test Category' });
    console.log("Update Status (Expected 200):", catUpdateRes.status);
    if (catUpdateRes.status !== 200 || catUpdateRes.body.data.name !== 'Updated Test Category') {
      throw new Error("Category update failed!");
    }

    console.log("\n--- 2. Testing Department CRUD ---");
    // Create (Admin)
    console.log("2a. Creating Department (Admin)...");
    const deptPayload = {
      name: 'Test Department',
      code: 'TESTD',
      managerId: adminUser._id
    };
    const deptCreateRes = await request
      .post('/api/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(deptPayload);
    console.log("Create Status (Expected 201):", deptCreateRes.status);
    if (deptCreateRes.status !== 201) throw new Error("Department creation failed!");
    const departmentId = deptCreateRes.body.data._id;

    // Update with circular parent check
    console.log("2b. Updating Department self-parenting check...");
    const deptCircularRes = await request
      .put(`/api/departments/${departmentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ parentDepartmentId: departmentId });
    console.log("Circular Status (Expected 400):", deptCircularRes.status);
    if (deptCircularRes.status !== 400) throw new Error("Circular parenting allowed!");

    console.log("\n--- 3. Testing User Management & Register API ---");
    // 3a. Register a new user (the ONLY allowed way to create a user)
    console.log("3a. Registering new User/Employee via POST /api/auth/register...");
    const userPayload = {
      username: 'test_mgmt_user',
      email: 'test_mgmt_user@example.com',
      password: 'password123',
      name: 'Initial User Name',
      role: 'EMPLOYEE',
      departmentId,
      designation: 'Developer',
      phone: '1234567890'
    };
    const userRegisterRes = await request
      .post('/api/auth/register')
      .send(userPayload);
    console.log("Register User Status (Expected 201):", userRegisterRes.status);
    if (userRegisterRes.status !== 201) throw new Error("User registration via auth failed!");
    const targetUserId = userRegisterRes.body.data.user._id;

    // 3b. Verify POST /api/users is removed and returns 404
    console.log("3b. Testing that POST /api/users returns 404 (removed)...");
    const postUserRes = await request
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userPayload);
    console.log("POST /api/users Status (Expected 404):", postUserRes.status);
    if (postUserRes.status !== 404) throw new Error("POST /api/users was not removed!");

    // Get All Users with search, filter, and pagination
    console.log("3c. Get all users with search (Staff - Allowed)...");
    const usersGetRes = await request
      .get('/api/users?search=Initial&limit=5')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get All Users Status (Expected 200):", usersGetRes.status);
    if (usersGetRes.status !== 200 || usersGetRes.body.data.pagination.total < 1) {
      throw new Error("Users search/query failed!");
    }

    // Get User By ID
    console.log("3d. Get user details by ID...");
    const userGetByIdRes = await request
      .get(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Get User By ID Status (Expected 200):", userGetByIdRes.status);
    if (userGetByIdRes.status !== 200 || userGetByIdRes.body.data.name !== 'Initial User Name') {
      throw new Error("Get user by ID failed!");
    }

    // Update User
    console.log("3e. Updating User fields...");
    const userUpdateRes = await request
      .put(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ==${adminToken}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated User Name', designation: 'Senior Developer' });
    console.log("Update User Status (Expected 200):", userUpdateRes.status);
    if (userUpdateRes.status !== 200 || userUpdateRes.body.data.name !== 'Updated User Name') {
      throw new Error("User update failed!");
    }

    // Patch User Status
    console.log("3f. Patching User Status...");
    const userPatchStatusRes = await request
      .patch(`/api/users/${targetUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SUSPENDED' });
    console.log("Patch Status (Expected 200):", userPatchStatusRes.status);
    if (userPatchStatusRes.status !== 200 || userPatchStatusRes.body.data.status !== 'SUSPENDED') {
      throw new Error("User status patching failed!");
    }

    console.log("\n--- 4. Clean up / Soft-Delete Testing ---");
    // Soft Delete (Deactivate User)
    const userDelRes = await request
      .delete(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Deactivate User Status (Expected 200):", userDelRes.status);
    if (userDelRes.status !== 200 || userDelRes.body.data.status !== 'INACTIVE') {
      throw new Error("User deactivation failed!");
    }

    // Delete Department
    const deptDelRes = await request
      .delete(`/api/departments/${departmentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Delete Department Status (Expected 200):", deptDelRes.status);

    // Delete Category
    const catDelRes = await request
      .delete(`/api/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Delete Category Status (Expected 200):", catDelRes.status);

    // Clean up test users
    await User.deleteMany({ username: { $in: ['crud_admin', 'crud_staff', 'test_mgmt_user'] } });

    console.log("\nAll Master Data CRUD, User Registration, and User Management verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nCRUD Verification Test Failed:");
    console.error(error);
    await User.deleteMany({ username: { $in: ['crud_admin', 'crud_staff', 'test_mgmt_user'] } });
    await Category.deleteMany({ code: 'TESTC' });
    await Department.deleteMany({ code: 'TESTD' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
