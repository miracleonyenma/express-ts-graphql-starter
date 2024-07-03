import pkg, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";

config();

const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET;

const getUserFromToken = async (token: string) => {
  try {
    if (!token) {
      return null;
    }
    const data = verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(data.data.id).populate("roles");
    return user;
  } catch (error) {
    return null;
  }
};

const assignRoleToUser = async (userId: string, roleName: string) => {
  const user = await User.findById(userId);
  const role = await Role.findOne({ name: roleName });

  if (user && role) {
    user.roles.push(role._id);
    await user.save();
    console.log(`Role ${roleName} assigned to user ${user.name}.`);
  } else {
    console.log("User or Role not found.");
  }
};

export { getUserFromToken, assignRoleToUser };
