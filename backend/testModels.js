const mongoose = require('mongoose');

try {
  console.log("Loading User model...");
  require('./models/User');

  console.log("Loading Category model...");
  require('./models/Category');

  console.log("Loading Department model...");
  require('./models/Department');

  console.log("Loading Employee model...");
  require('./models/Employee');

  console.log("Loading Asset model...");
  require('./models/Asset');

  console.log("Loading Allocation model...");
  require('./models/Allocation');

  console.log("Loading Transfer model...");
  require('./models/Transfer');

  console.log("Loading Maintenance model...");
  require('./models/Maintenance');

  console.log("Loading Audit model...");
  require('./models/Audit');

  console.log("Loading Notification model...");
  require('./models/Notification');

  console.log("Loading ActivityLog model...");
  require('./models/ActivityLog');

  console.log("All schemas compiled successfully with Mongoose without errors!");
  process.exit(0);
} catch (error) {
  console.error("Schema compilation error encountered:");
  console.error(error);
  process.exit(1);
}
