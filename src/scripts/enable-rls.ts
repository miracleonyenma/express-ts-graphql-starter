import { config } from "dotenv";
config();
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

async function enableRLS() {
  const tables = [
    "User",
    "Role",
    "File",
    "ApiKey",
    "MagicLinkToken",
    "Otp",
    "PasswordResetToken",
    "_RoleToUser",
  ];

  console.log("Enabling RLS on tables...");

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`
      );
      console.log(`✅ RLS enabled for table: ${table}`);
    } catch (error) {
      console.error(`❌ Failed to enable RLS for table: ${table}`, error);
    }
  }

  console.log("RLS setup completed.");
}

enableRLS()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
