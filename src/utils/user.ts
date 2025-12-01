// ./src/utils/user.ts

import prisma from "../config/prisma.js";

const checkUser = async (userId: string) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const checkUserIsAdmin = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.roles.find((role) => role.name === "admin")) {
    console.log("🔴🔴🔴 ~ No Admin roles for this user");
    return false;
  }
  return true;
};

export { checkUser, checkUserIsAdmin };
