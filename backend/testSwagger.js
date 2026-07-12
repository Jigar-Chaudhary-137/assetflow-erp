const dotenv = require('dotenv');
const mongoose = require('mongoose');
const supertest = require('supertest');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = require('./app');
const request = supertest(app);

async function runTests() {
  try {
    console.log("Starting API Documentation & Postman verification tests...");

    // 1. Verify Swagger UI endpoint
    console.log("\n--- 1. Testing GET /api/docs/ endpoint ---");
    const resDocs = await request.get('/api/docs/');
    console.log("GET /api/docs/ status code (Expected 200 or 302):", resDocs.status);
    if (resDocs.status !== 200 && resDocs.status !== 302) {
      throw new Error(`Swagger UI endpoint returned unexpected status code: ${resDocs.status}`);
    }

    // Verify HTML is returned
    const text = resDocs.text;
    console.log("Contains Swagger/HTML elements:", text.includes('<html') || text.includes('swagger-ui') || text.includes('swagger'));
    if (!text.includes('<html') && !text.includes('swagger')) {
      throw new Error("Swagger UI endpoint did not return correct HTML page!");
    }

    // 2. Validate postman_collection.json
    console.log("\n--- 2. Validating postman_collection.json ---");
    const collectionPath = path.join(__dirname, '..', 'postman_collection.json');
    const exists = fs.existsSync(collectionPath);
    console.log("postman_collection.json file exists:", exists);
    if (!exists) {
      throw new Error("postman_collection.json file not found at workspace root!");
    }

    // Verify it is a valid JSON and contains required keys
    const content = fs.readFileSync(collectionPath, 'utf8');
    const parsed = JSON.parse(content);
    console.log("postman_collection.json has correct Postman schema structure:", parsed.info && parsed.item ? 'YES' : 'NO');
    if (!parsed.info || !parsed.item) {
      throw new Error("postman_collection.json structure is invalid!");
    }

    // Print top-level folders in Postman collection
    console.log("\nPostman Collection Folders included:");
    parsed.item.forEach(folder => {
      console.log(`- Folder: ${folder.name} (containing ${folder.item ? folder.item.length : 0} requests)`);
    });

    console.log("\nAll API Documentation & Postman Collection verification tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\nVerification Test Failed:");
    console.error(error);
    process.exit(1);
  }
}

runTests();
