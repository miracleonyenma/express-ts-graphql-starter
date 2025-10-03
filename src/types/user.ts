// ./src/types/user.ts

import mongoose, { Document, Model, Types } from "mongoose";

export type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  error?: string;
  error_description?: string;
};

export type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  count?: number;
  password?: string;
  emailVerified?: boolean;
  phone?: string;
  phoneVerified?: boolean;
  roles?: Types.ObjectId[];
  country?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UpsertInput = {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  verified_email: boolean;
  country?: string;
};

export type RegisterUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  country?: string;
};

export type EditUserInput = {
  id: string;
  data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    picture?: string;
    roles?: string[];
    country?: string;
  };
};

export interface UserDocument extends User, Document {}

// Static methods interface
export interface UserStaticMethods {
  registerUser(data: RegisterUserInput): Promise<UserDocument>;
  loginUser(data: { email: string; password: string }): Promise<UserDocument>;
  me(data: { id: string }): Promise<UserDocument>;
  editUser(data: EditUserInput): Promise<UserDocument>;
  upsertGoogleUser(data: UpsertInput): Promise<UserDocument>;
  upsertGithubUser(data: UpsertInput): Promise<UserDocument>;
}

// Combine the Model and static methods
export interface UserModel extends Model<UserDocument>, UserStaticMethods {}
