import mongoose from "mongoose";
import { config } from "dotenv";
import setupRoles from "../services/role.services.js";
config();
const MONGO_URI = process.env.MONGO_URI;

// This is the connection to the database
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI).then(() => {
      console.log("MongoDB is connected");
    });
    setupRoles();
  } catch (error) {
    return console.log(error);
  }
};

export default connectDB;
