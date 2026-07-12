const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Department = require('../models/Department');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Transfer = require('../models/Transfer');
const Maintenance = require('../models/Maintenance');
const Audit = require('../models/Audit');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

function convertExtendedJson(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertExtendedJson);
  } else if (obj !== null && typeof obj === 'object') {
    if (obj.$oid) {
      return new mongoose.Types.ObjectId(obj.$oid);
    }
    if (obj.$date) {
      return new Date(obj.$date);
    }
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertExtendedJson(obj[key]);
    }
    return newObj;
  }
  return obj;
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected successfully. Wiping old collection data...");

    // 1. Wipe collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Department.deleteMany({});
    await Asset.deleteMany({});
    await Allocation.deleteMany({});
    await Booking.deleteMany({});
    await Transfer.deleteMany({});
    await Maintenance.deleteMany({});
    await Audit.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log("Collections wiped cleanly. Loading seed files...");

    // 2. Load and parse master files
    const categoriesData = convertExtendedJson(JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/seed/categories.json'), 'utf-8')));
    const departmentsData = convertExtendedJson(JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/seed/departments.json'), 'utf-8')));
    const usersData = convertExtendedJson(JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/seed/users.json'), 'utf-8')));
    const assetsData = convertExtendedJson(JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/seed/assets.json'), 'utf-8')));

    // 3. Insert Categories
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // 4. Insert Departments
    const seededDepartments = await Department.insertMany(departmentsData);
    console.log(`Seeded ${seededDepartments.length} departments.`);

    // 5. Insert Users (pre-hashed in users.json)
    const seededUsers = await User.insertMany(usersData);
    console.log(`Seeded ${seededUsers.length} users.`);

    // 6. Insert Assets
    const seededAssets = await Asset.insertMany(assetsData);
    console.log(`Seeded ${seededAssets.length} assets.`);

    // 7. Seed 20 Allocations dynamically
    console.log("Generating allocations...");
    const allocationsToCreate = [];
    const staffUsers = seededUsers.filter(u => u.role === 'EMPLOYEE');
    const managers = seededUsers.filter(u => u.role === 'ASSET_MANAGER' || u.role === 'ADMIN');
    const adminUser = seededUsers.find(u => u.role === 'ADMIN') || seededUsers[0];
    const managerUser = seededUsers.find(u => u.role === 'ASSET_MANAGER') || adminUser;

    const availableAssets = seededAssets.filter(a => a.status === 'AVAILABLE');
    
    // Allocate 3 assets as ACTIVE
    for (let i = 0; i < Math.min(3, availableAssets.length); i++) {
      const asset = availableAssets[i];
      const employee = staffUsers[i % staffUsers.length];
      const checkoutDate = new Date(Date.now() - (15 + i) * 24 * 60 * 60 * 1000);
      const expectedReturnDate = new Date(checkoutDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      allocationsToCreate.push({
        assetId: asset._id,
        employeeId: employee._id,
        checkoutDate,
        expectedReturnDate,
        status: 'ACTIVE',
        notes: 'Workstation deployment assignment',
        allocatedById: managerUser._id
      });

      asset.status = 'ALLOCATED';
      asset.history.push({
        date: checkoutDate,
        action: 'ALLOCATED',
        performedById: managerUser._id,
        details: `Allocated to ${employee.name}`
      });
      await asset.save();
    }

    // Create 2 returned allocations
    for (let i = 3; i < Math.min(5, availableAssets.length); i++) {
      const asset = availableAssets[i];
      const employee = staffUsers[(i + 1) % staffUsers.length];
      const checkoutDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const returnDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      allocationsToCreate.push({
        assetId: asset._id,
        employeeId: employee._id,
        checkoutDate,
        expectedReturnDate: returnDate,
        actualReturnDate: returnDate,
        status: 'RETURNED',
        notes: 'Temporary project loan return',
        allocatedById: managerUser._id
      });

      asset.history.push({
        date: checkoutDate,
        action: 'ALLOCATED',
        performedById: managerUser._id,
        details: `Allocated to ${employee.name}`
      });
      asset.history.push({
        date: returnDate,
        action: 'RETURNED',
        performedById: managerUser._id,
        details: 'Returned back to inventory storage'
      });
      await asset.save();
    }

    const seededAllocations = await Allocation.insertMany(allocationsToCreate);
    console.log(`Seeded ${seededAllocations.length} allocations.`);

    // 8. Seed Bookings
    console.log("Generating bookings...");
    const bookableAssets = seededAssets.filter(a => a.bookable);
    const bookingsToCreate = [];

    for (let i = 0; i < bookableAssets.length; i++) {
      const asset = bookableAssets[i];
      const employee = staffUsers[i % staffUsers.length];
      const start = new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hrs

      bookingsToCreate.push({
        resourceId: asset._id,
        employeeId: employee._id,
        startTime: start,
        endTime: end,
        purpose: 'Sprint Planning Meeting',
        status: 'UPCOMING'
      });
    }

    const seededBookings = await Booking.insertMany(bookingsToCreate);
    console.log(`Seeded ${seededBookings.length} bookings.`);

    // 9. Seed Transfers
    console.log("Generating transfers...");
    const activeAllocations = seededAllocations.filter(al => al.status === 'ACTIVE');
    const transfersToCreate = [];

    if (activeAllocations.length >= 2) {
      transfersToCreate.push({
        assetId: activeAllocations[0].assetId,
        allocationId: activeAllocations[0]._id,
        fromEmployeeId: activeAllocations[0].employeeId,
        toEmployeeId: staffUsers[1]._id,
        requestedById: activeAllocations[0].employeeId,
        status: 'PENDING',
        comments: 'Transferring peripheral monitor'
      });

      transfersToCreate.push({
        assetId: activeAllocations[1].assetId,
        allocationId: activeAllocations[1]._id,
        fromEmployeeId: activeAllocations[1].employeeId,
        toEmployeeId: staffUsers[0]._id,
        requestedById: activeAllocations[1].employeeId,
        status: 'APPROVED',
        actionById: managerUser._id,
        actionDate: new Date(),
        comments: 'Appoved department shift transfer'
      });
    }

    const seededTransfers = await Transfer.insertMany(transfersToCreate);
    console.log(`Seeded ${seededTransfers.length} transfers.`);

    // 10. Seed Maintenances
    console.log("Generating maintenance tasks...");
    const maintToCreate = [];
    const maintAssets = seededAssets.filter(a => a.status === 'AVAILABLE');

    if (maintAssets.length >= 2) {
      maintToCreate.push({
        assetId: maintAssets[0]._id,
        reportedById: staffUsers[0]._id,
        issueDescription: 'Laptop keyboard has sticky keys',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: 'Booked with manufacturer desk'
      });

      maintToCreate.push({
        assetId: maintAssets[1]._id,
        reportedById: staffUsers[1]._id,
        issueDescription: 'Broken monitor stand replacement',
        priority: 'HIGH',
        status: 'COMPLETED',
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        estimatedCost: 50,
        actualCost: 45,
        resolutionDetails: 'Replaced stand arm bracket',
        notes: 'Stand replaced'
      });
    }

    const seededMaint = await Maintenance.insertMany(maintToCreate);
    console.log(`Seeded ${seededMaint.length} maintenance records.`);

    // 11. Seed Audits
    console.log("Generating audit records...");
    const auditsToCreate = [{
      auditCode: 'AUD-2026-Q1',
      auditName: 'Q1 Hardware Audit',
      auditType: 'INVENTORY',
      scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      auditorId: adminUser._id,
      scope: 'Engineering Department Workstations',
      status: 'PENDING',
      selectedAssets: seededAssets.slice(0, 5).map(a => a._id)
    }];

    const seededAudits = await Audit.insertMany(auditsToCreate);
    console.log(`Seeded ${seededAudits.length} audits.`);

    // 12. Seed Notifications
    console.log("Generating notifications...");
    const notificationsToCreate = [];
    for (let i = 0; i < 15; i++) {
      const recipient = seededUsers[i % seededUsers.length];
      notificationsToCreate.push({
        recipient: recipient._id,
        title: 'System Checkout Alert',
        message: 'A new asset checkout task has been processed.',
        type: 'SYSTEM',
        priority: 'MEDIUM',
        module: 'ALLOCATION',
        isRead: i % 2 === 0
      });
    }

    const seededNotifications = await Notification.insertMany(notificationsToCreate);
    console.log(`Seeded ${seededNotifications.length} notifications.`);

    // 13. Seed Activity Logs
    console.log("Generating activity logs...");
    const logsToCreate = [];
    for (let i = 0; i < 30; i++) {
      const logUser = seededUsers[i % seededUsers.length];
      logsToCreate.push({
        userId: logUser._id,
        userName: logUser.name,
        action: 'UPDATE',
        module: 'ASSET',
        httpMethod: 'PUT',
        endpoint: '/api/assets',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0'
      });
    }

    const seededLogs = await ActivityLog.insertMany(logsToCreate);
    console.log(`Seeded ${seededLogs.length} activity logs.`);

    console.log("\nDatabase seeding completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Database Seeding Failed:");
    console.error(error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seed();
