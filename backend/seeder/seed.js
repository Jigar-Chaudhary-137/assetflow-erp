const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Category = require('../models/Category');
const Department = require('../models/Department');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Transfer = require('../models/Transfer');
const Maintenance = require('../models/Maintenance');
const Audit = require('../models/Audit');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

const { categories, departments, userTemplates } = require('./sampleData');

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
    await Transfer.deleteMany({});
    await Maintenance.deleteMany({});
    await Audit.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log("Collections wiped cleanly. Seeding master categories...");

    // 2. Seed Categories
    const seededCategories = await Category.insertMany(categories);
    console.log(`Seeded ${seededCategories.length} categories.`);

    // 3. Seed Departments
    const seededDepartments = await Department.insertMany(departments);
    console.log(`Seeded ${seededDepartments.length} departments.`);

    // 4. Seed Users (with hashed passwords)
    console.log("Hashing passwords and seeding users...");
    const salt = await bcrypt.genSalt(10);
    const usersToCreate = [];

    for (let i = 0; i < userTemplates.length; i++) {
      const template = userTemplates[i];
      const passwordHash = await bcrypt.hash(template.passwordRaw, salt);
      
      // Distribute departments to users systematically
      let userDept = null;
      if (template.role === 'ADMIN' || template.username === 'it_manager') {
        userDept = seededDepartments.find(d => d.code === 'IT');
      } else if (template.username === 'hr_manager' || template.username === 'staff_eva') {
        userDept = seededDepartments.find(d => d.code === 'HR');
      } else if (template.username === 'staff_frank') {
        userDept = seededDepartments.find(d => d.code === 'FIN');
      } else if (template.username === 'staff_grace') {
        userDept = seededDepartments.find(d => d.code === 'SLS');
      } else if (template.username === 'staff_irene') {
        userDept = seededDepartments.find(d => d.code === 'MKT');
      } else if (template.username === 'staff_jack') {
        userDept = seededDepartments.find(d => d.code === 'OPS');
      } else if (template.username === 'staff_henry') {
        userDept = seededDepartments.find(d => d.code === 'PRO');
      } else {
        // Fallback for remaining staff (alice, bob, charlie, david)
        userDept = seededDepartments[i % seededDepartments.length];
      }

      usersToCreate.push({
        username: template.username,
        email: template.email,
        passwordHash,
        name: template.name,
        role: template.role,
        designation: template.designation,
        status: template.status,
        departmentId: userDept ? userDept._id : null,
        phone: '9876543210',
        joiningDate: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000 * (i + 1) * 0.1)) // spread joining dates
      });
    }

    const seededUsers = await User.insertMany(usersToCreate);
    console.log(`Seeded ${seededUsers.length} users.`);

    // 5. Update Department managers
    console.log("Updating department managers...");
    const itManagerUser = seededUsers.find(u => u.username === 'it_manager');
    const hrManagerUser = seededUsers.find(u => u.username === 'hr_manager');
    const adminUser = seededUsers.find(u => u.role === 'ADMIN');

    for (let dept of seededDepartments) {
      let manager = adminUser;
      if (dept.code === 'IT' && itManagerUser) manager = itManagerUser;
      if (dept.code === 'HR' && hrManagerUser) manager = hrManagerUser;
      
      dept.managerId = manager._id;
      await dept.save();
    }
    console.log("Department managers linked successfully.");

    // 6. Seed 90 Assets
    console.log("Generating 90 assets...");
    const assetsToCreate = [];
    const conditions = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];
    const manufacturers = {
      LPT: ['Apple', 'Dell', 'Lenovo', 'HP'],
      DSK: ['Dell', 'HP', 'Lenovo'],
      MON: ['Dell', 'LG', 'Samsung', 'ASUS'],
      PRN: ['HP', 'Canon', 'Epson', 'Brother'],
      RTR: ['Cisco', 'Ubiquiti', 'Netgear'],
      SRV: ['Dell EMC', 'HPE', 'Lenovo'],
      MBL: ['Apple', 'Samsung', 'Google'],
      FRN: ['Herman Miller', 'Steelcase', 'IKEA'],
      ACC: ['Logitech', 'Apple', 'Dell'],
      NET: ['Cisco', 'TP-Link', 'Fortinet']
    };

    // Distribute status count: 45 Available, 30 Allocated, 10 Under Maintenance, 5 Retired
    const statuses = [
      ...Array(45).fill('AVAILABLE'),
      ...Array(30).fill('ALLOCATED'),
      ...Array(10).fill('UNDER_MAINTENANCE'),
      ...Array(5).fill('RETIRED')
    ];

    for (let i = 0; i < 90; i++) {
      const category = seededCategories[i % seededCategories.length];
      const department = seededDepartments[i % seededDepartments.length];
      const status = statuses[i];
      
      const categoryCode = category.code;
      const tagIndex = String(i + 1).padStart(3, '0');
      const assetTag = `AST-${categoryCode}-${tagIndex}`;
      const serialNumber = `SN-${categoryCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}${tagIndex}`;
      
      const brands = manufacturers[categoryCode] || ['Generic'];
      const manufacturer = brands[i % brands.length];
      const model = `${manufacturer} Model-${tagIndex}`;
      
      let condition = 'GOOD';
      if (status === 'UNDER_MAINTENANCE') {
        condition = 'POOR';
      } else if (status === 'RETIRED') {
        condition = 'DAMAGED';
      } else if (status === 'AVAILABLE' && i % 4 === 0) {
        condition = 'NEW';
      }

      const cost = Math.floor(Math.random() * 2500) + 150;
      const purchaseDate = new Date(Date.now() - (Math.floor(Math.random() * 700) + 100) * 24 * 60 * 60 * 1000);
      const warrantyExpiration = new Date(purchaseDate.getTime() + 365 * 2 * 24 * 60 * 60 * 1000); // 2 years warranty

      assetsToCreate.push({
        assetTag,
        serialNumber,
        name: `${manufacturer} ${category.name}`,
        categoryId: category._id,
        departmentId: department._id,
        status,
        bookable: i % 3 === 0,
        condition,
        location: {
          building: `Building ${String.fromCharCode(65 + (i % 4))}`,
          floor: (i % 3) + 1,
          room: `Room ${((i % 3) + 1) * 100 + (i % 10)}`
        },
        purchaseInfo: {
          purchaseCost: cost,
          purchaseDate,
          warrantyExpiration,
          vendor: `${manufacturer} Direct`
        },
        history: [{
          date: purchaseDate,
          action: 'REGISTERED',
          performedById: adminUser._id,
          details: 'Initial asset registration'
        }]
      });
    }

    const seededAssets = await Asset.insertMany(assetsToCreate);
    console.log(`Seeded ${seededAssets.length} assets.`);

    // 7. Seed 35 Allocations
    console.log("Generating 35 allocations...");
    const allocationsToCreate = [];
    const staffUsers = seededUsers.filter(u => u.role === 'EMPLOYEE');
    
    // Pick the 30 assets marked as ALLOCATED
    const allocatedAssets = seededAssets.filter(a => a.status === 'ALLOCATED');
    
    // Create ACTIVE allocations for these 30 assets
    for (let i = 0; i < allocatedAssets.length; i++) {
      const asset = allocatedAssets[i];
      const employee = staffUsers[i % staffUsers.length];
      const checkoutDate = new Date(Date.now() - (15 + i) * 24 * 60 * 60 * 1000);
      const expectedReturnDate = new Date(checkoutDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      allocationsToCreate.push({
        assetId: asset._id,
        employeeId: employee._id,
        checkoutDate,
        expectedReturnDate,
        status: 'ACTIVE',
        notes: 'Standard staff work assignment',
        allocatedById: itManagerUser ? itManagerUser._id : adminUser._id
      });

      // Update asset history with allocation action
      asset.history.push({
        date: checkoutDate,
        action: 'ALLOCATED',
        performedById: itManagerUser ? itManagerUser._id : adminUser._id,
        details: `Allocated to ${employee.name}`
      });
      await asset.save();
    }

    // Create 5 Returned (historical) allocations using 5 of the AVAILABLE assets
    const availableAssets = seededAssets.filter(a => a.status === 'AVAILABLE');
    for (let i = 0; i < 5; i++) {
      const asset = availableAssets[i];
      const employee = staffUsers[(i + 5) % staffUsers.length];
      const checkoutDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const returnDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      allocationsToCreate.push({
        assetId: asset._id,
        employeeId: employee._id,
        checkoutDate,
        expectedReturnDate: returnDate,
        actualReturnDate: returnDate,
        status: 'RETURNED',
        notes: 'Completed short-term project usage',
        allocatedById: itManagerUser ? itManagerUser._id : adminUser._id
      });

      // Update history for these historical returned ones
      asset.history.push({
        date: checkoutDate,
        action: 'ALLOCATED',
        performedById: itManagerUser ? itManagerUser._id : adminUser._id,
        details: `Allocated to ${employee.name}`
      });
      asset.history.push({
        date: returnDate,
        action: 'RETURNED',
        performedById: itManagerUser ? itManagerUser._id : adminUser._id,
        details: `Returned by ${employee.name}`
      });
      await asset.save();
    }

    const seededAllocations = await Allocation.insertMany(allocationsToCreate);
    console.log(`Seeded ${seededAllocations.length} allocations.`);

    // 8. Seed 18 Transfers
    console.log("Generating 18 transfers...");
    const activeAllocations = seededAllocations.filter(al => al.status === 'ACTIVE');
    const transfersToCreate = [];

    // Create 6 PENDING transfers
    for (let i = 0; i < 6; i++) {
      const allocation = activeAllocations[i];
      const fromUser = staffUsers.find(u => u._id.equals(allocation.employeeId));
      const toUser = staffUsers[(staffUsers.indexOf(fromUser) + 1) % staffUsers.length];
      const toDept = seededDepartments[i % seededDepartments.length];

      transfersToCreate.push({
        assetId: allocation.assetId,
        allocationId: allocation._id,
        fromEmployeeId: fromUser._id,
        toEmployeeId: toUser._id,
        targetDepartmentId: toDept._id,
        requestedById: fromUser._id,
        status: 'PENDING',
        comments: 'Transferring secondary work monitor/laptop custodianship to new team member'
      });
    }

    // Create 6 APPROVED transfers (we link them to another 6 active allocations)
    for (let i = 0; i < 6; i++) {
      const allocation = activeAllocations[i + 6];
      const fromUser = staffUsers.find(u => u._id.equals(allocation.employeeId));
      const toUser = staffUsers[(staffUsers.indexOf(fromUser) + 2) % staffUsers.length];
      const toDept = seededDepartments[(i + 1) % seededDepartments.length];
      const transferDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      transfersToCreate.push({
        assetId: allocation.assetId,
        allocationId: allocation._id,
        fromEmployeeId: fromUser._id,
        toEmployeeId: toUser._id,
        targetDepartmentId: toDept._id,
        requestedById: fromUser._id,
        status: 'APPROVED',
        actionById: itManagerUser ? itManagerUser._id : adminUser._id,
        actionDate: transferDate,
        comments: 'Relocating dev stack for remote setup shift'
      });
    }

    // Create 6 REJECTED transfers
    for (let i = 0; i < 6; i++) {
      const allocation = activeAllocations[i + 12];
      const fromUser = staffUsers.find(u => u._id.equals(allocation.employeeId));
      const toUser = staffUsers[(staffUsers.indexOf(fromUser) + 3) % staffUsers.length];
      const toDept = seededDepartments[(i + 2) % seededDepartments.length];
      const transferDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      transfersToCreate.push({
        assetId: allocation.assetId,
        allocationId: allocation._id,
        fromEmployeeId: fromUser._id,
        toEmployeeId: toUser._id,
        targetDepartmentId: toDept._id,
        requestedById: fromUser._id,
        status: 'REJECTED',
        actionById: itManagerUser ? itManagerUser._id : adminUser._id,
        actionDate: transferDate,
        rejectionReason: 'Invalid request parameters, target user is in different division office',
        comments: 'Transfer rejected due to role mismatch'
      });
    }

    const seededTransfers = await Transfer.insertMany(transfersToCreate);
    console.log(`Seeded ${seededTransfers.length} transfers.`);

    // 9. Seed 18 Maintenances
    console.log("Generating 18 maintenance records...");
    const maintToCreate = [];
    const maintAssets = seededAssets.filter(a => a.status === 'AVAILABLE');
    const activeMaintAssets = seededAssets.filter(a => a.status === 'UNDER_MAINTENANCE');

    // 4 SCHEDULED
    for (let i = 0; i < 4; i++) {
      const asset = maintAssets[i + 10]; // avoid collision
      const scheduledDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      maintToCreate.push({
        assetId: asset._id,
        reportedById: staffUsers[i % staffUsers.length]._id,
        issueDescription: 'Fan making loud whirring sound on startup load',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        scheduledDate,
        estimatedCost: 80,
        notes: 'Assigned to vendor desk'
      });
    }

    // 4 IN_PROGRESS (Linked to the 10 UNDER_MAINTENANCE assets)
    for (let i = 0; i < 4; i++) {
      const asset = activeMaintAssets[i];
      const scheduledDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const startedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

      maintToCreate.push({
        assetId: asset._id,
        reportedById: staffUsers[(i + 2) % staffUsers.length]._id,
        issueDescription: 'OS crash loop after system patch updates',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        scheduledDate,
        startedAt,
        estimatedCost: 150,
        notes: 'In-progress diagnostics running'
      });
    }

    // 5 COMPLETED
    for (let i = 0; i < 5; i++) {
      const asset = maintAssets[i + 15];
      const scheduledDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const startedAt = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000);
      const completionDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

      maintToCreate.push({
        assetId: asset._id,
        reportedById: staffUsers[(i + 4) % staffUsers.length]._id,
        issueDescription: 'Power supply block burnt out',
        priority: 'CRITICAL',
        status: 'COMPLETED',
        scheduledDate,
        startedAt,
        completionDate,
        estimatedCost: 200,
        actualCost: 185,
        resolutionDetails: 'Replaced power capacitor block with certified unit',
        vendor: 'Cisco Partner Repair',
        notes: 'Resolved under service contract'
      });
    }

    // 5 CANCELLED
    for (let i = 0; i < 5; i++) {
      const asset = maintAssets[i + 20];
      maintToCreate.push({
        assetId: asset._id,
        reportedById: staffUsers[i % staffUsers.length]._id,
        issueDescription: 'Keyboard keys sticky',
        priority: 'LOW',
        status: 'CANCELLED',
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'User cleaned keyboard self, cancelled request desk tickets.'
      });
    }

    const seededMaint = await Maintenance.insertMany(maintToCreate);
    console.log(`Seeded ${seededMaint.length} maintenance records.`);

    // 10. Seed 6 Audits
    console.log("Generating 6 audit cycles...");
    const auditsToCreate = [];
    const auditAssets = seededAssets.slice(0, 15); // first 15 assets

    // 2 PENDING
    for (let i = 0; i < 2; i++) {
      auditsToCreate.push({
        auditCode: `AUD-IT-2026-Q${i + 1}`,
        auditName: `IT Asset Quarterly Audit Q${i + 1}`,
        auditType: 'INVENTORY',
        scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        auditorId: adminUser._id,
        scope: 'IT Department main hub server rack items',
        remarks: 'Regular quarterly hardware health check',
        status: 'PENDING',
        selectedAssets: auditAssets.map(a => a._id)
      });
    }

    // 2 IN_PROGRESS
    for (let i = 0; i < 2; i++) {
      auditsToCreate.push({
        auditCode: `AUD-HR-2026-Q${i + 1}`,
        auditName: `HR Department Hardware Audit Q${i + 1}`,
        auditType: 'INVENTORY',
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        auditorId: hrManagerUser._id,
        scope: 'HR Admin floor desks',
        status: 'IN_PROGRESS',
        selectedAssets: auditAssets.slice(0, 5).map(a => a._id),
        verifiedAssets: [
          {
            assetId: auditAssets[0]._id,
            found: true,
            condition: 'GOOD',
            remarks: 'Asset matches registration info',
            verifiedAt: new Date()
          },
          {
            assetId: auditAssets[1]._id,
            found: true,
            condition: 'DAMAGED',
            remarks: 'Monitor screen has slight scratch lines',
            verifiedAt: new Date()
          }
        ]
      });
    }

    // 2 COMPLETED
    for (let i = 0; i < 2; i++) {
      const targetAssets = auditAssets.slice(5, 10);
      auditsToCreate.push({
        auditCode: `AUD-FIN-2026-Q${i + 1}`,
        auditName: `Finance Asset Check Q${i + 1}`,
        auditType: 'INVENTORY',
        scheduledDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        auditorId: itManagerUser._id,
        scope: 'Finance main accounting workspace desktops',
        status: 'COMPLETED',
        selectedAssets: targetAssets.map(a => a._id),
        verifiedAssets: targetAssets.map((a, idx) => ({
          assetId: a._id,
          found: idx !== 4, // 1 missing
          condition: idx === 3 ? 'DAMAGED' : (idx === 4 ? 'MISSING' : 'GOOD'),
          remarks: idx === 4 ? 'Device not found in cubicle' : 'Verified standard condition',
          verifiedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
        })),
        summary: {
          totalAudited: 5,
          found: 4,
          missing: 1,
          damaged: 1
        }
      });
    }

    const seededAudits = await Audit.insertMany(auditsToCreate);
    console.log(`Seeded ${seededAudits.length} audit cycles.`);

    // 11. Seed 40 Notifications
    console.log("Generating 40 notifications...");
    const notificationsToCreate = [];
    const notificationTypes = ['ALLOCATION', 'TRANSFER', 'MAINTENANCE', 'AUDIT'];

    for (let i = 0; i < 40; i++) {
      const recipient = seededUsers[i % seededUsers.length];
      const type = notificationTypes[i % notificationTypes.length];
      let title = 'System Notification';
      let message = 'Your asset flow configuration has been updated.';

      if (type === 'ALLOCATION') {
        title = 'Asset Checkout Alert';
        message = 'A new computer workstation asset has been assigned to your profile.';
      } else if (type === 'TRANSFER') {
        title = 'Transfer Approval Required';
        message = 'A peer asset transfer request is pending your authorization.';
      } else if (type === 'MAINTENANCE') {
        title = 'Maintenance Scheduled';
        message = 'Your assigned laptop has a scheduled cleaning slot booked.';
      } else if (type === 'AUDIT') {
        title = 'Audit Assigned';
        message = 'You have been assigned as the auditor for the Q3 audit cycle.';
      }

      notificationsToCreate.push({
        recipient: recipient._id,
        title,
        message,
        type: 'SYSTEM',
        priority: i % 5 === 0 ? 'HIGH' : 'MEDIUM',
        module: type,
        isRead: i % 3 === 0
      });
    }

    const seededNotifications = await Notification.insertMany(notificationsToCreate);
    console.log(`Seeded ${seededNotifications.length} notifications.`);

    // 12. Seed 110 Activity Logs
    console.log("Generating 110 activity logs...");
    const logsToCreate = [];
    const actions = ['LOGIN', 'CREATE', 'UPDATE', 'ALLOCATION', 'TRANSFER', 'MAINTENANCE', 'AUDIT'];
    const modules = ['AUTH', 'USER', 'CATEGORY', 'DEPARTMENT', 'ASSET', 'ALLOCATION', 'TRANSFER', 'MAINTENANCE', 'AUDIT'];

    for (let i = 0; i < 110; i++) {
      const logUser = seededUsers[i % seededUsers.length];
      const action = actions[i % actions.length];
      const module = modules[i % modules.length];

      logsToCreate.push({
        userId: logUser._id,
        userName: logUser.name,
        action,
        module,
        httpMethod: i % 2 === 0 ? 'POST' : 'PUT',
        endpoint: `/api/${module.toLowerCase()}`,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000) // spread logs over the last 5 days
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
