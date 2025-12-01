import prisma from "./prisma.js";
import setupRoles from "../services/role.services.js";

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL is connected via Prisma");
    await setupRoles();
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
