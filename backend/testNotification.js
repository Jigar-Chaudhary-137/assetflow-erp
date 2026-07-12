const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const Category = require('./models/Category');
const Notification = require('./models/Notification');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Notification system verification tests.");

    // Clean up if test records exist
    await User.deleteMany({ username: { $in: ['notif_admin', 'notif_staff1', 'notif_staff2'] } });
    await Category.deleteMany({ code: 'NOTC' });
    await Notification.deleteMany({});

    // 1. Create test users
    console.log("\n--- Creating Test Users for RBAC validation ---");
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      username: 'notif_admin',
      email: 'notif_admin@example.com',
      passwordHash,
      name: 'Notification Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser1 = await User.create({
      username: 'notif_staff1',
      email: 'notif_staff1@example.com',
      passwordHash,
      name: 'Notification Staff 1',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const staffUser2 = await User.create({
      username: 'notif_staff2',
      email: 'notif_staff2@example.com',
      passwordHash,
      name: 'Notification Staff 2',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken1 = generateAccessToken(staffUser1._id, staffUser1.role);
    const staffToken2 = generateAccessToken(staffUser2._id, staffUser2.role);

    console.log("\n--- 2. Triggering Auto Notifications ---");

    // 2a. Register a new user (which notifies adminUser)
    console.log("2a. Triggering register API (Should automatically notify Admin)...");
    const regRes = await request
      .post('/api/auth/register')
      .send({
        username: 'notif_staff_temp',
        email: 'notif_staff_temp@example.com',
        password: 'password123',
        name: 'Notification Staff Temp',
        role: 'EMPLOYEE'
      });
    console.log("Register HTTP Status:", regRes.status);
    if (regRes.status !== 201) throw new Error("Temp staff registration failed!");
    
    // Clean up temp registered user
    await User.deleteOne({ username: 'notif_staff_temp' });

    // Delay briefly to allow asynchronous notifications to save in DB
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if notification document exists in DB for adminUser
    const checkDb = await Notification.findOne({ recipient: adminUser._id });
    console.log("Centralized Service check - notification found in DB:", !!checkDb);
    if (!checkDb) throw new Error("Notification was not created automatically!");

    console.log("\n--- 3. Verifying Notification APIs & Recipient Isolation ---");

    // 3a. Admin view notifications (Admin token)
    console.log("3a. Getting notifications for Admin (Expected >= 1)...");
    const getAdminNotifRes = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Get Admin Notifications Status (Expected 200):", getAdminNotifRes.status);
    if (getAdminNotifRes.status !== 200 || getAdminNotifRes.body.data.pagination.total < 1) {
      throw new Error("Admin notifications query list failed!");
    }
    const adminNotifId = getAdminNotifRes.body.data.notifications[0]._id;

    // 3b. Staff 1 notifications (Should return 0)
    console.log("3b. Getting notifications for Staff 1 (Expected 0)...");
    const getStaffNotifRes1 = await request
      .get('/api/notifications')
      .set('Authorization', `Bearer ${staffToken1}`);
    console.log("Get Staff 1 Notifications Count:", getStaffNotifRes1.body.data.pagination.total);
    if (getStaffNotifRes1.body.data.pagination.total !== 0) {
      throw new Error("Staff 1 returned notifications that they shouldn't see!");
    }

    // 3c. Block Staff 1 from accessing Admin's notification by ID
    console.log("3c. Testing access block: Staff 1 gets Admin notification by ID (Expected 403)...");
    const staffGetByIdRes = await request
      .get(`/api/notifications/${adminNotifId}`)
      .set('Authorization', `Bearer ${staffToken1}`);
    console.log("Staff 1 Get By ID Status:", staffGetByIdRes.status);
    if (staffGetByIdRes.status !== 403) {
      throw new Error("Recipient isolation failed! Staff 1 was allowed to view Admin's notification.");
    }

    console.log("\n--- 4. Testing Read, Read All, and Delete APIs ---");

    // 4a. Mark notification as read
    console.log("4a. Marking Admin notification as read...");
    const readRes = await request
      .patch(`/api/notifications/${adminNotifId}/read`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Read Status (Expected 200):", readRes.status);
    if (readRes.status !== 200 || readRes.body.data.isRead !== true) {
      throw new Error("Failed to mark notification as read!");
    }

    // 4b. Mark all as read
    console.log("4b. Marking all Admin notifications as read...");
    const readAllRes = await request
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Read All Status (Expected 200):", readAllRes.status);
    if (readAllRes.status !== 200) throw new Error("Failed to mark all as read!");

    // 4c. Delete notification
    console.log("4c. Deleting Admin notification by ID...");
    const delRes = await request
      .delete(`/api/notifications/${adminNotifId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Delete Status (Expected 200):", delRes.status);
    if (delRes.status !== 200) throw new Error("Delete notification failed!");

    // Verify deleted
    const verifyDeleted = await Notification.findById(adminNotifId);
    console.log("Verify deleted in DB (Expected null):", verifyDeleted);
    if (verifyDeleted) throw new Error("Notification was not deleted!");

    // Clean up
    await User.deleteMany({ username: { $in: ['notif_admin', 'notif_staff1', 'notif_staff2'] } });
    await Notification.deleteMany({});

    console.log("\nAll Notification System verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nNotification Verification Test Failed:");
    console.error(error);
    await User.deleteMany({ username: { $in: ['notif_admin', 'notif_staff1', 'notif_staff2'] } });
    await Notification.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
