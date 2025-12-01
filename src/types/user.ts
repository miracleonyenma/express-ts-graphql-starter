// ./src/types/user.ts

import { User as PrismaUser, Role } from "../generated/prisma/client.js";

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

export type UserWithRoles = PrismaUser & { roles: Role[] };

export type UserDocument = UserWithRoles;

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
