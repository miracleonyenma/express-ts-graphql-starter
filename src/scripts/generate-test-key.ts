import mongoose from "mongoose";
import { config } from "dotenv";
import User from "../models/user.model.js";
import ApiKey from "../models/apiKey.model.js";
import Role from "../models/role.model.js";
import { v4 as uuidv4 } from "uuid";

config();

const generateKey = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // Ensure role
    let role = await Role.findOne({ name: "user" });
    if (!role) {
      role = await Role.create({ name: "user" });
      console.log("Created user role");
    }

    // Create/Get user
    const email = "test.upload@example.com";
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: "Test",
        lastName: "Uploader",
        email,
        password: "password123",
        emailVerified: true,
        roles: [role._id],
      });
      console.log("Created test user");
    }

    // Create API Key
    const keyString = `test_key_${uuidv4()}`;
    const apiKey = await ApiKey.create({
      key: keyString,
      owner: user._id,
    });

    console.log("\n\n=============================================");
    console.log("GENERATED TEST API KEY:");
    console.log(keyString);
    console.log("=============================================\n");
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

generateKey();
