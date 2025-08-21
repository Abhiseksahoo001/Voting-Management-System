const mongoose = require("mongoose");
require("dotenv").config();
// Define the MongoDB connection URL (use IPv4 to avoid ::1 issues)
const mongoUrl = process.env.MONGODB_URL_LOCAL;
// Set up MongoDB connection
mongoose
  .connect(mongoUrl)
  .then(() => console.log("✅ MongoDB connection complete"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const db = mongoose.connection;

// Event listeners
db.on("disconnected", () => {
  console.log("⚠️ MongoDB connection disconnected");
});

// Export the db connection
module.exports = db;
