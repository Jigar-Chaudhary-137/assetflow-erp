const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
<<<<<<< HEAD
    console.log(`MongoDB Connected: ${conn.connection.host}`);
=======
    console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
>>>>>>> afc2239 (Connect frontend with backend)
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
