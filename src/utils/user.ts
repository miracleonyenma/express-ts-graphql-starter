// ./src/utils/user.ts

import Role from "../models/role.model.js";
import User from "../models/user.model.js";

const checkUser = async (userId: string) => {
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const checkUserIsAdmin = async (userId: string) => {
  const user = await User.findById(userId).populate("roles");
  if (!user) {
    throw new Error("User not found");
  }
  const roles = await Role.find({ _id: { $in: user.roles } });
  if (!roles.find((role) => role.name === "admin")) {
    console.log("🔴🔴🔴 ~ No Admin roles for this user");
    return false;
  }
  return true;
};

export { checkUser, checkUserIsAdmin };
