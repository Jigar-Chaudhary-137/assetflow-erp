const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Category = require('./models/Category');
const Department = require('./models/Department');
const Booking = require('./models/Booking');
const { generateAccessToken } = require('./utils/generateToken');

const request = supertest(app);

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Booking verification tests.");

    // Clean up collections
    await Booking.deleteMany({});
    await User.deleteMany({ username: { $in: ['test_admin_booking', 'test_staff_booking'] } });
    await Category.deleteMany({ code: 'BKT' });
    await Department.deleteMany({ code: 'BKD' });
    await Asset.deleteMany({ assetTag: { $in: ['AST-BKT-001', 'AST-BKT-002'] } });

    // Hashing passwords
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create a Category and Department
    const category = await Category.create({ name: 'Booking Test Cat', code: 'BKT', description: 'Test category' });
    const department = await Department.create({ name: 'Booking Test Dept', code: 'BKD' });

    // Create test users
    const adminUser = await User.create({
      username: 'test_admin_booking',
      email: 'admin_booking@example.com',
      passwordHash,
      name: 'Booking Admin',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    const staffUser = await User.create({
      username: 'test_staff_booking',
      email: 'staff_booking@example.com',
      passwordHash,
      name: 'Booking Staff',
      role: 'EMPLOYEE',
      status: 'ACTIVE'
    });

    const adminToken = generateAccessToken(adminUser._id, adminUser.role);
    const staffToken = generateAccessToken(staffUser._id, staffUser.role);

    // Create assets: one bookable, one not
    const bookableAsset = await Asset.create({
      assetTag: 'AST-BKT-001',
      serialNumber: 'SN-BKT-001',
      name: 'Bookable Projector',
      categoryId: category._id,
      departmentId: department._id,
      status: 'AVAILABLE',
      bookable: true,
      location: {
        building: 'Building A',
        floor: 1,
        room: 'Room 101'
      }
    });

    const nonBookableAsset = await Asset.create({
      assetTag: 'AST-BKT-002',
      serialNumber: 'SN-BKT-002',
      name: 'Non-Bookable Laptop',
      categoryId: category._id,
      departmentId: department._id,
      status: 'AVAILABLE',
      bookable: false,
      location: {
        building: 'Building A',
        floor: 1,
        room: 'Room 102'
      }
    });

    console.log("\n--- Starting Booking Tests ---");

    // 1. Create booking for non-bookable asset (Rejection expected)
    console.log("1. Attempting to book a non-bookable resource...");
    const start = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    const end = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours from now

    const res1 = await request.post('/api/bookings')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        resourceId: nonBookableAsset._id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: 'Team sync presentation'
      });
    console.log("Status:", res1.status, "(Expected 400)");
    if (res1.status !== 400) throw new Error("Allowed booking a non-bookable asset!");

    // 2. Create valid booking
    console.log("\n2. Creating a valid booking...");
    const res2 = await request.post('/api/bookings')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        resourceId: bookableAsset._id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: 'Team sync presentation'
      });
    console.log("Status:", res2.status, "(Expected 201)");
    if (res2.status !== 201) throw new Error("Failed to create valid booking!");
    const bookingId = res2.body.data._id;

    // Check asset status (should be RESERVED)
    const updatedAsset = await Asset.findById(bookableAsset._id);
    console.log("Asset Status:", updatedAsset.status, "(Expected RESERVED)");
    if (updatedAsset.status !== 'RESERVED') throw new Error("Asset status was not cascaded to RESERVED!");

    // 3. Attempt overlapping booking (Conflict expected)
    console.log("\n3. Testing overlap check validation...");
    const startOverlap = new Date(Date.now() + 1.5 * 60 * 60 * 1000);
    const endOverlap = new Date(Date.now() + 2.5 * 60 * 60 * 1000);

    const res3 = await request.post('/api/bookings')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        resourceId: bookableAsset._id,
        startTime: startOverlap.toISOString(),
        endTime: endOverlap.toISOString(),
        purpose: 'Another conflicting booking'
      });
    console.log("Status:", res3.status, "(Expected 409)");
    if (res3.status !== 409) throw new Error("Allowed overlapping booking!");

    // 4. Booking duration > 24 hours (Rejection expected)
    console.log("\n4. Testing booking duration limit (> 24 hours)...");
    const endTooLong = new Date(start.getTime() + 25 * 60 * 60 * 1000);
    const res4 = await request.post('/api/bookings')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        resourceId: bookableAsset._id,
        startTime: start.toISOString(),
        endTime: endTooLong.toISOString(),
        purpose: 'Too long booking'
      });
    console.log("Status:", res4.status, "(Expected 400 or 422)");
    if (res4.status !== 400 && res4.status !== 422) throw new Error("Allowed booking longer than 24 hours!");

    // 5. Get Own Bookings
    console.log("\n5. Getting own bookings...");
    const res5 = await request.get('/api/bookings/my')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Status:", res5.status, "(Expected 200)");
    console.log("Own bookings count:", res5.body.data.docs.length, "(Expected 1)");
    if (res5.body.data.docs.length !== 1) throw new Error("Incorrect own bookings count!");

    // 6. Get All Bookings as Admin
    console.log("\n6. Getting all bookings as Admin...");
    const res6 = await request.get('/api/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    console.log("Status:", res6.status, "(Expected 200)");
    console.log("Total bookings:", res6.body.data.docs.length, "(Expected 1)");
    if (res6.body.data.docs.length !== 1) throw new Error("Admin failed to view all bookings!");

    // 7. Get All Bookings as Staff (Forbidden expected)
    console.log("\n7. Getting all bookings as Staff...");
    const res7 = await request.get('/api/bookings')
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Status:", res7.status, "(Expected 403)");
    if (res7.status !== 403) throw new Error("Staff allowed to view all bookings!");

    // 8. Cancel Booking
    console.log("\n8. Cancelling booking...");
    const res8 = await request.patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${staffToken}`);
    console.log("Status:", res8.status, "(Expected 200)");
    console.log("Booking Status after cancellation:", res8.body.data.status, "(Expected CANCELLED)");

    // Check asset status (should be reset to AVAILABLE)
    const finalAsset = await Asset.findById(bookableAsset._id);
    console.log("Asset Status after cancel:", finalAsset.status, "(Expected AVAILABLE)");
    if (finalAsset.status !== 'AVAILABLE') throw new Error("Asset status not reset to AVAILABLE!");

    // Clean up
    await Booking.deleteMany({});
    await User.deleteMany({ username: { $in: ['test_admin_booking', 'test_staff_booking'] } });
    await Category.deleteMany({ code: 'BKT' });
    await Department.deleteMany({ code: 'BKD' });
    await Asset.deleteMany({ assetTag: { $in: ['AST-BKT-001', 'AST-BKT-002'] } });

    console.log("\nAll Booking verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nBooking Verification Test Failed:");
    console.error(error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
