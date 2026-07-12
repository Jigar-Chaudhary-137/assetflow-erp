const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const Category = require('./models/Category');
const ActivityLog = require('./models/ActivityLog');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Activity Logger verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['log_admin', 'log_staff'] } });
    await Category.deleteMany({ code: 'LOGC' });
    await ActivityLog.deleteMany({});

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'log_admin',
      email: 'log_admin@example.com',
      passwordHash,
      name: 'Log Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'log_staff',
      email: 'log_staff@example.com',
      passwordHash,
      name: 'Log Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    console.log("\n--- 2. Triggering API Actions (writes/reads) ---");

    // 2a. Login action (Should log successful login, resolving user details)
    console.log("2a. Logging in via auth module (Trigger LOGIN)...");
    const loginRes = await request
      .post('/api/auth/login')
      .send({ email: 'log_admin@example.com', password: 'password123' });
    console.log("Login HTTP Status:", loginRes.status);

    // 2b. Category creation action (Trigger CREATE in CATEGORY)
    console.log("2b. Creating a category (Trigger CREATE)...");
    const catPayload = {
      name: 'Log Test Category',
      code: 'LOGC'
    };
    const catCreateRes = await request
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(catPayload);
    console.log("Category Create HTTP Status:", catCreateRes.status);
    const categoryId = catCreateRes.body.data._id;

    // Delay briefly to allow finished events to persist to MongoDB
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("\n--- 3. Verifying Created Logs & Sensitive Content Exclusions ---");

    // Retrieve activity logs (Admin only)
    console.log("3a. Getting activity logs (Admin)...");
    const logsRes = await request
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Get Logs HTTP Status (Expected 200):", logsRes.status);
    if (logsRes.status !== 200) throw new Error("Failed to get activity logs!");

    const logs = logsRes.body.data.logs;
    console.log("Logs count saved (Expected >= 2):", logs.length);
    if (logs.length < 2) throw new Error("Automatic log creation failed!");

    // Print saved log details
    logs.forEach(log => {
      console.log(`- Module: ${log.module}, Action: ${log.action}, Endpoint: ${log.endpoint}, User: ${log.userName || 'Guest'}`);
    });

    // Check sensitive data exclusion
    console.log("\n3b. Verifying sensitive data exclusion...");
    // Retrieve the logs directly from Mongo to inspect their full raw structure
    const dbLogs = await ActivityLog.find({});
    for (const log of dbLogs) {
      const stringified = JSON.stringify(log);
      if (stringified.includes('password') || stringified.includes('token') || stringified.includes('passwordHash')) {
        throw new Error("Sensitive credentials found stored inside log document!");
      }
    }
    console.log("Success: No password, token, or hash information found inside raw logs.");

    console.log("\n--- 4. Testing Filtering, Search, and Pagination ---");
    // Module filter
    const catLogsRes = await request
      .get('/api/activity-logs?moduleName=CATEGORY')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Category module filter count (Expected >= 1):", catLogsRes.body.data.pagination.total);
    if (catLogsRes.body.data.pagination.total < 1) throw new Error("Module filter failed!");

    // Search query
    const searchLogsRes = await request
      .get('/api/activity-logs?search=categories')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Search query match count (Expected >= 1):", searchLogsRes.body.data.pagination.total);
    if (searchLogsRes.body.data.pagination.total < 1) throw new Error("Search query failed!");

    // Staff access block (RBAC check)
    console.log("\n--- 5. Testing RBAC restrictions ---");
    const staffLogsRes = await request
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Staff Get Logs HTTP Status (Expected 403):", staffLogsRes.status);
    if (staffLogsRes.status !== 403) throw new Error("Staff allowed to read activity logs!");

    // Clean up
    await Category.findByIdAndDelete(categoryId);
    await User.deleteMany({ username: { $in: ['log_admin', 'log_staff'] } });
    await ActivityLog.deleteMany({});

    console.log("\nAll Activity Logging verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nActivity Logger Verification Test Failed:");
    console.error(error);
    await Category.deleteMany({ code: 'LOGC' });
    await User.deleteMany({ username: { $in: ['log_admin', 'log_staff'] } });
    await ActivityLog.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
