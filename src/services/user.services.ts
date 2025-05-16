// src/services/user.services.ts

import pkg, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import Role from "../models/role.model.js";

import { Types } from "mongoose";
import User from "../models/user.model.js";
import { UserDocument } from "../types/user.js";
import paginateCollection, {
  Pagination,
  SortOptions,
} from "../utils/paginate.js";
import { checkUser, checkUserIsAdmin } from "../utils/user.js";
import { Filters } from "../utils/filters/index.js";
import { UserFilters } from "../utils/filters/user.js";
import { logger } from "@untools/logger";
import {
  InternalServerError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ValidationError,
  ErrorHandler,
} from "../services/error.services.js";
import {
  accessTokenData,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/token.js";
import roleModel from "../models/role.model.js";

config();

const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * User Service for handling user-related operations
 */
export class UserService {
  /**
   * User state
   */
  private user: UserDocument;

  /**
   * User ID, used to get and set user state
   */
  private userId: string;

  /**
   * Constructor
   */
  constructor({ user, userId }: { user?: UserDocument; userId?: string }) {
    this.user = user;
    this.userId = userId;
    this.initUserById();
  }

  /**
   * Initialize user data asynchronously if needed
   */
  async initUserById() {
    if (this.userId && !this.user) {
      this.user = await User.findById(this.userId);
    }
  }

  /**
   * Set user state
   */
  setUser(user: UserDocument) {
    this.user = user;
  }

  /**
   * Get users with filtering, pagination, and sorting options
   */
  async getFilteredUsers({
    filters = {},
    pagination = { page: 1, limit: 10 },
    sort = { by: "createdAt", direction: "desc" },
  }: {
    filters?: Filters.UserFilterOptions;
    pagination?: Pagination;
    sort?: SortOptions;
  }) {
    // Check user authentication
    await checkUser(this.userId);

    // Build filter object for MongoDB query
    const constructedFilters = UserFilters({ filters });

    logger.debug("Filter Query", { constructedFilters, filters });

    return paginateCollection(
      User,
      {
        page: pagination.page,
        limit: pagination.limit,
      },
      {
        filter: constructedFilters,
        populate: "roles",
        sort,
      }
    );
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserDocument> {
    const user = await User.findById(id).populate("roles");

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserDocument> {
    if (!this.userId) {
      throw new UnauthorizedError("Unable to authenticate user");
    }

    const user = await User.findById(this.userId).populate("roles");

    if (!user) {
      throw new NotFoundError("User profile not found");
    }

    return user;
  }

  /**
   * Register a new user
   */
  async registerUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ user: UserDocument }> {
    // Validate input
    if (!userData || !userData.email || !userData.password) {
      throw new ValidationError("Email and password are required");
    }

    try {
      const user = await User.registerUser(userData);
      return { user };
    } catch (error) {
      // Handle duplicate email error specifically
      if (error.code === 11000) {
        throw new BadRequestError("Email already in use");
      }

      throw ErrorHandler.handleError(error);
    }
  }

  /**
   * Login user
   */
  async loginUser(loginData: { email: string; password: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserDocument;
  }> {
    // Validate input
    if (!loginData || !loginData.email || !loginData.password) {
      throw new ValidationError("Email and password are required");
    }

    try {
      const user = await User.loginUser(loginData);
      const accessToken = createAccessToken(accessTokenData(user));
      const refreshToken = createRefreshToken({ id: user._id });
      return { accessToken, refreshToken, user };
    } catch (error) {
      // For login failures, provide a clear but secure message
      if (error.message.includes("Invalid credentials")) {
        throw new UnauthorizedError("Invalid email or password");
      }

      throw ErrorHandler.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    if (!token) {
      throw new ValidationError("Refresh token is required");
    }

    try {
      const decoded = verifyRefreshToken(token);

      const user = await User.findById(decoded.data.id);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const accessToken = createAccessToken(accessTokenData(user));
      return { accessToken };
    } catch (error) {
      // Specific error handling for token issues
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new UnauthorizedError("Invalid or expired refresh token");
      }

      throw ErrorHandler.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateUser(
    updateData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      picture: string;
    }>
  ): Promise<UserDocument> {
    if (!this.userId) {
      throw new UnauthorizedError("Authentication required");
    }

    // Verify user exists
    await checkUser(this.userId);

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestError("No update data provided");
    }

    const updatedUser = await User.findByIdAndUpdate(this.userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(id?: string): Promise<UserDocument> {
    const userId = id || this.userId;

    if (!userId) {
      throw new UnauthorizedError("User ID required");
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    return deletedUser;
  }

  /**
   * Get user roles
   */
  async getUserRoles(roleIds: Types.ObjectId[]): Promise<any[]> {
    if (!roleIds || roleIds.length === 0) {
      return [];
    }

    const populatedRoles = await Promise.all(
      roleIds.map((role) => roleModel.findById(role))
    );

    return populatedRoles;
  }

  /**
   * Get user from JWT token
   */
  async getUserFromToken(token: string): Promise<UserDocument | null> {
    try {
      if (!token) {
        return null;
      }
      const data = verify(token, JWT_SECRET) as JwtPayload;
      const user = await User.findById(data.data.id).populate("roles");
      return user;
    } catch (error) {
      logger.error("getUserFromToken error:", error);
      return null;
    }
  }

  /**
   * Assign a role to a user by role name
   */
  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    const user = await User.findById(userId);
    const role = await Role.findOne({ name: roleName });

    if (user && role) {
      user.roles.push(role._id);
      await user.save();
      logger.info(`Role ${roleName} assigned to user ${user.firstName}.`);
    } else {
      throw new NotFoundError("User or Role not found");
    }
  }
}

export default new UserService({});
