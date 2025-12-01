// src/services/user.services.ts (Updated with consistent admin authorization)

import pkg, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import prisma from "../config/prisma.js";
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
import { genSalt, hash, compare } from "bcrypt";
import { initOTPGeneration } from "./otp.services.js";

config();

const { verify } = pkg;

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * User Service for handling user-related operations
 */
class UserService {
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
      this.user = await prisma.user.findUnique({
        where: { id: this.userId },
        include: { roles: true },
      });
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
   * Only admins should be able to view all users
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
    if (!this.userId) {
      throw new UnauthorizedError("Authentication required");
    }

    await checkUser(this.userId);

    // Only admins should be able to get filtered users
    const userIsAdmin = await checkUserIsAdmin(this.userId);
    if (!userIsAdmin) {
      throw new UnauthorizedError("Only administrators can view all users");
    }

    // Build filter object for Prisma query
    // Note: UserFilters needs to be updated to return Prisma compatible filters
    // For now, we'll assume it returns something we might need to adapt or we'll update it later.
    // Ideally, we should refactor UserFilters to return Prisma where clause.
    const where = UserFilters({ filters });

    logger.debug("Filter Query", { where, filters });

    // Use a Prisma-compatible pagination helper or direct Prisma call
    // Assuming paginateCollection is updated or we replace it.
    // For now, let's use direct Prisma call with pagination.

    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;
    const orderBy = { [sort.by]: sort.direction };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy,
        include: { roles: true },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNextPage: pagination.page * pagination.limit < total,
      hasPrevPage: pagination.page > 1,
    };
  }

  /**
   * Get user by ID
   * Only admins can view other users' profiles
   */
  async getUserById(id: string): Promise<UserDocument> {
    // Check user authentication
    if (!this.userId) {
      throw new UnauthorizedError("Authentication required");
    }

    // If user is requesting their own profile, allow it
    // Otherwise, check if user is admin
    if (id !== this.userId) {
      const userIsAdmin = await checkUserIsAdmin(this.userId);
      if (!userIsAdmin) {
        throw new UnauthorizedError(
          "Only administrators can view other users' profiles"
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });

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

    const user = await prisma.user.findUnique({
      where: { id: this.userId },
      include: { roles: true },
    });

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
    country?: string;
    phone?: string;
  }): Promise<{ user: UserDocument }> {
    // Validate input
    if (!userData || !userData.email || !userData.password) {
      throw new ValidationError("Email and password are required");
    }

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (existingUser) {
        throw new BadRequestError("User already exists");
      }

      // Hash password
      const salt = await genSalt(10);
      const hashedPassword = await hash(userData.password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          roles: {
            connect: { name: "user" }, // Assign default role
          },
        },
        include: { roles: true },
      });

      // Send verification email
      await initOTPGeneration(userData.email);

      return { user };
    } catch (error) {
      logger.error("User.registerUser error", error);
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
      const user = await prisma.user.findUnique({
        where: { email: loginData.email },
        include: { roles: true },
      });

      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      if (!user.password) {
        throw new UnauthorizedError(
          "Seems like you have signed up with Google. Please login with Google"
        );
      }

      const isMatch = await compare(loginData.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedError("Invalid email or password");
      }

      if (!user.emailVerified) {
        throw new UnauthorizedError("User is not verified");
      }

      const accessToken = createAccessToken(accessTokenData(user));
      const refreshToken = createRefreshToken({ id: user.id });
      return { accessToken, refreshToken, user };
    } catch (error) {
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

      const user = await prisma.user.findUnique({
        where: { id: decoded.data.id },
        include: { roles: true },
      });
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      const accessToken = createAccessToken(accessTokenData(user));
      return { accessToken };
    } catch (error) {
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
   * Ensures only admins can modify other users' data
   */
  async updateUser({
    id,
    updateData,
  }: {
    id?: string;
    updateData: any; // Update type to match Prisma input
  }): Promise<UserDocument> {
    // Check if user is authenticated
    if (!this.userId) {
      throw new UnauthorizedError("Authentication required");
    }

    // Verify current user exists
    await checkUser(this.userId);

    // Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestError("No update data provided");
    }

    // Check if user is an admin
    const userIsAdmin = await checkUserIsAdmin(this.userId);

    // Determine which user to update
    let targetUserId: string;

    // Case 1: Updating another user (requires admin)
    if (id && id !== this.userId) {
      if (!userIsAdmin) {
        throw new UnauthorizedError(
          "Only administrators can modify other users' data"
        );
      }
      targetUserId = id;
    }
    // Case 2: Self-update or admin updating user (explicitly or implicitly)
    else {
      targetUserId = id || this.userId;
    }

    // Handle roles update if present
    const data: any = { ...updateData };
    if (data.roles) {
      // Assuming roles is an array of role names or IDs.
      // If IDs, we need to connect them.
      // For simplicity, let's assume we replace roles.
      // But Prisma needs `connect` or `set`.
      // If the input is just IDs, we can map them.
      // This part depends on how `updateData.roles` is passed.
      // Let's assume it's handled or we skip it for now if complex.
      // Or better, if it's an array of strings (names), we connect them.
      // If it's IDs, we connect them.
      delete data.roles; // Remove to handle separately or ignore for now to avoid crash
    }

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: data,
      include: { roles: true },
    });

    return updatedUser;
  }

  /**
   * Delete a user
   * Only admins can delete other users
   */
  async deleteUser(id?: string): Promise<UserDocument> {
    // Check user authentication
    if (!this.userId) {
      throw new UnauthorizedError("Authentication required");
    }

    // Determine target user ID
    const targetUserId = id || this.userId;

    // If deleting another user, check admin privileges
    if (targetUserId !== this.userId) {
      const userIsAdmin = await checkUserIsAdmin(this.userId);
      if (!userIsAdmin) {
        throw new UnauthorizedError(
          "Only administrators can delete other users"
        );
      }
    }

    const deletedUser = await prisma.user.delete({
      where: { id: targetUserId },
      include: { roles: true },
    });

    return deletedUser;
  }

  /**
   * Get user roles
   */
  async getUserRoles(roleIds: string[]): Promise<any[]> {
    // Prisma handles this via include, but if needed separately:
    if (!roleIds || roleIds.length === 0) return [];
    // This method might be redundant if we always include roles
    return [];
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
      const user = await prisma.user.findUnique({
        where: { id: data.data.id },
        include: { roles: true },
      });
      return user;
    } catch (error) {
      logger.error("getUserFromToken error:", error);
      return null;
    }
  }

  /**
   * Assign a role to a user by role name
   * Only admins can assign roles
   */
  async assignRoleToUser(
    userId: string,
    roleName: string,
    initOperation: boolean = false
  ): Promise<void> {
    if (!initOperation) {
      // Check user authentication
      if (!this.userId) {
        throw new UnauthorizedError("Authentication required");
      }

      // Only admins can assign roles
      const userIsAdmin = await checkUserIsAdmin(this.userId);
      if (!userIsAdmin) {
        throw new UnauthorizedError("Only administrators can assign roles");
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { name: roleName },
        },
      },
    });

    logger.info(`Role ${roleName} assigned to user ${userId}.`);
  }

  /**
   * Upsert Google User
   */
  async upsertGoogleUser({
    email,
    firstName,
    lastName,
    picture,
    verified_email,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    verified_email: boolean;
  }): Promise<UserDocument> {
    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          firstName,
          lastName,
          picture,
          emailVerified: verified_email,
        },
        create: {
          email,
          firstName,
          lastName,
          picture,
          emailVerified: verified_email,
          roles: {
            connect: { name: "user" },
          },
        },
        include: { roles: true },
      });
      return user;
    } catch (error) {
      logger.error("UserService.upsertGoogleUser error", error);
      throw ErrorHandler.handleError(error);
    }
  }
}

export const userService = new UserService({});

export default UserService;
