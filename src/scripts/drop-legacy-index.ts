import mongoose from "mongoose";
import { config } from "dotenv";
import FileModel from "../models/file.model.js";

config();

const fixIndexes = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    try {
      console.log("Attempting to drop index: s3Key_1");
      await FileModel.collection.dropIndex("s3Key_1");
      console.log("Successfully dropped legacy index: s3Key_1");
    } catch (error) {
      if (error.code === 27) {
        console.log("Index s3Key_1 not found, nothing to do.");
      } else {
        console.error("Error dropping index:", error.message);
      }
    }
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await mongoose.disconnect();
  }
};

fixIndexes();
