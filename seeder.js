const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");

const connectDB = require("./config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: "admin@sipelmasd.com" });
    if (existingAdmin) {
      console.log("❗Admin already exists.");
      process.exit();
    }

    const password = "admin123"

    const adminUser = new User({
      fullName: "Admin SiPelMasD",
      email: "admin@sipelmasd.com",
      password: password,
      role: "admin",
      profileImageUrl: "https://via.placeholder.com/150"
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
