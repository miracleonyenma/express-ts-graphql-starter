import mongoose, { Document, Model, mongo, ObjectId, Types } from "mongoose";

type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  id_token: string;
  error?: string;
  error_description?: string;
};

type GoogleUser = {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
};

type User = {
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
  count?: number;
  password?: string;
  emailVerified?: boolean;
  roles?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
};

type UpsertInput = {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  verified_email: boolean;
};

type UserDocument = User & Document;

type UserModel = Model<UserDocument> & {
  registerUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<UserDocument>;
  loginUser(data: { email: string; password: string }): Promise<UserDocument>;
  me(data: { id: string }): Promise<UserDocument>;
  editUser(data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<UserDocument>;
  upsertGoogleUser(data: UpsertInput): Promise<UserDocument>;
  upsertGithubUser(data: UpsertInput): Promise<UserDocument>;
};

export { AccessTokenResponse, GoogleUser, User, UserDocument, UserModel };
