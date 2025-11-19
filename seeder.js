import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";   
import connectDB from "./config/db.js";

dotenv.config();
await connectDB();

const importAdmin = async () => {
  try {
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456",   // you can change later
      isAdmin: true,
    });

    console.log("Admin user created:", adminUser);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importAdmin();
