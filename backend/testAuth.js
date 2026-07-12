const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');

dotenv.config();

const app = require('./app');
const User = require('./models/User');

const request = supertest(app);

async function runTests() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for auth verification tests.");

    // Clean up if test user exists
    await User.deleteMany({ username: 'test_auth_user' });

    console.log("\n--- 1. Testing Registration ---");
    const regPayload = {
      username: 'test_auth_user',
      email: 'test_auth_user@example.com',
      password: 'testpassword123',
      name: 'Test User',
      role: 'EMPLOYEE'
    };

    const regRes = await request.post('/api/auth/register').send(regPayload);
    console.log("Reg Status (Expected 201):", regRes.status);
    console.log("Reg Body Success:", regRes.body.success);
    console.log("Reg Body Message:", regRes.body.message);
    if (regRes.status !== 201 || !regRes.body.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }

    console.log("\n--- 2. Testing Duplicate Email Rejection ---");
    const dupEmailPayload = {
      username: 'test_auth_user_2',
      email: 'test_auth_user@example.com',
      password: 'testpassword123',
      name: 'Test User 2',
      role: 'EMPLOYEE'
    };
    const dupEmailRes = await request.post('/api/auth/register').send(dupEmailPayload);
    console.log("Dup Email Status (Expected 400):", dupEmailRes.status);
    console.log("Dup Email Error Msg:", dupEmailRes.body.error);
    if (dupEmailRes.status !== 400) {
      throw new Error("Duplicate email was not rejected!");
    }

    console.log("\n--- 3. Testing Duplicate Username Rejection ---");
    const dupUsernamePayload = {
      username: 'test_auth_user',
      email: 'test_auth_user_2@example.com',
      password: 'testpassword123',
      name: 'Test User 2',
      role: 'EMPLOYEE'
    };
    const dupUsernameRes = await request.post('/api/auth/register').send(dupUsernamePayload);
    console.log("Dup Username Status (Expected 400):", dupUsernameRes.status);
    console.log("Dup Username Error Msg:", dupUsernameRes.body.error);
    if (dupUsernameRes.status !== 400) {
      throw new Error("Duplicate username was not rejected!");
    }

    console.log("\n--- 4. Testing Login ---");
    const loginPayload = {
      email: 'test_auth_user@example.com',
      password: 'testpassword123'
    };

    const loginRes = await request.post('/api/auth/login').send(loginPayload);
    console.log("Login Status (Expected 200):", loginRes.status);
    console.log("Login Body Success:", loginRes.body.success);
    if (loginRes.status !== 200 || !loginRes.body.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const { accessToken, refreshToken } = loginRes.body.data;
    console.log("Access Token (Generated):", accessToken ? "YES" : "NO");
    console.log("Refresh Token (Generated):", refreshToken ? "YES" : "NO");
    if (!accessToken || !refreshToken) {
      throw new Error("Login did not return access and refresh tokens!");
    }

    // Verify stored refresh token in DB
    const dbUser = await User.findOne({ username: 'test_auth_user' });
    console.log("Stored Refresh Token in DB matches returned:", dbUser.refreshToken === refreshToken ? "YES" : "NO");
    if (dbUser.refreshToken !== refreshToken) {
      throw new Error("Refresh token was not correctly stored in the database!");
    }

    console.log("\n--- 5. Testing Protected Route /me (Valid Token) ---");
    const meRes = await request
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    console.log("Me Status (Expected 200):", meRes.status);
    console.log("Me Body Success:", meRes.body.success);
    console.log("Me User Username:", meRes.body.data ? meRes.body.data.username : "null");
    console.log("Me User Password Excluded:", meRes.body.data && meRes.body.data.passwordHash === undefined ? "YES" : "NO");
    console.log("Me User RefreshToken Excluded:", meRes.body.data && meRes.body.data.refreshToken === undefined ? "YES" : "NO");
    if (meRes.status !== 200 || meRes.body.data.username !== 'test_auth_user') {
      throw new Error(`/me failed with valid token: ${JSON.stringify(meRes.body)}`);
    }

    console.log("\n--- 6. Testing Protected Route /me (No Token / Bad Token) ---");
    const meNoTokenRes = await request.get('/api/auth/me');
    console.log("Me No Token Status (Expected 401):", meNoTokenRes.status);
    const meBadTokenRes = await request.get('/api/auth/me').set('Authorization', 'Bearer badtoken');
    console.log("Me Bad Token Status (Expected 401):", meBadTokenRes.status);
    if (meNoTokenRes.status !== 401 || meBadTokenRes.status !== 401) {
      throw new Error("Protected route did not require a valid JWT!");
    }

    console.log("\n--- 7. Testing Token Refresh ---");
    const refreshRes = await request
      .post('/api/auth/refresh')
      .send({ refreshToken });
    console.log("Refresh Status (Expected 200):", refreshRes.status);
    console.log("Refresh Body Success:", refreshRes.body.success);
    if (refreshRes.status !== 200 || !refreshRes.body.success) {
      throw new Error(`Refresh token endpoint failed: ${JSON.stringify(refreshRes.body)}`);
    }

    const newAccessToken = refreshRes.body.data.accessToken;
    const newRefreshToken = refreshRes.body.data.refreshToken;
    console.log("New Access Token:", newAccessToken ? "YES" : "NO");
    console.log("New Refresh Token (Rotated):", newRefreshToken ? "YES" : "NO");

    // Verify rotation in DB
    const dbUserRotated = await User.findOne({ username: 'test_auth_user' });
    console.log("DB Rotated Refresh Token matches new:", dbUserRotated.refreshToken === newRefreshToken ? "YES" : "NO");
    if (dbUserRotated.refreshToken !== newRefreshToken) {
      throw new Error("Rotated refresh token was not updated in the DB!");
    }

    console.log("\n--- 8. Testing Logout (Invalidates Refresh Token) ---");
    const logoutRes = await request
      .post('/api/auth/logout')
      .send({ refreshToken: newRefreshToken });
    console.log("Logout Status (Expected 200):", logoutRes.status);
    console.log("Logout Body Success:", logoutRes.body.success);
    if (logoutRes.status !== 200) {
      throw new Error("Logout failed!");
    }

    const dbUserLoggedOut = await User.findOne({ username: 'test_auth_user' });
    console.log("DB Refresh Token cleared (null):", dbUserLoggedOut.refreshToken === null ? "YES" : "NO");
    if (dbUserLoggedOut.refreshToken !== null) {
      throw new Error("Logout did not clear refresh token from database!");
    }

    // Clean up
    await User.deleteMany({ username: 'test_auth_user' });
    console.log("\nCleanup completed: Test user deleted.");

    console.log("\nAll auth verification tests completed successfully!");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\nAuth Verification Test Failed:");
    console.error(error);
    await User.deleteMany({ username: 'test_auth_user' });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

runTests();
