import mongoose, { Schema } from "mongoose";
import { genSalt, hash, compare } from "bcrypt";
import { object, string } from "yup";
import otpGenerator from "otp-generator";
import { assignRoleToUser } from "../services/user.services.js";
import OTP from "./otp.model.js";
import Role from "./role.model.js";

import {
  initOTPGeneration,
  sendVerificationMail,
} from "../services/otp.services.js";

const registerUserSchema = object({
  name: string().required(),
  email: string().email().required(),
  password: string().min(6).required(),
});

const loginUserSchema = object({
  email: string().email().required(),
  password: string().min(6).required(),
});

const editUserSchema = object({
  name: string().required(),
  email: string().email().required(),
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    count: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Role",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    statics: {
      async registerUser({
        name,
        email,
        password,
      }: {
        name: string;
        email: string;
        password: string;
      }) {
        try {
          // validate user input
          await registerUserSchema.validate({ name, email, password });
          // check if user exists
          const existingUser = await this.findOne({ email });
          if (existingUser) {
            throw new Error("User already exists");
          }
          // hash password
          const salt = await genSalt(10);
          const hashedPassword = await hash(password, salt);
          // create user
          const user = await this.create({
            name,
            email,
            password: hashedPassword,
          });
          // assign user role
          await assignRoleToUser(user._id.toString(), "user");
          const userWithRoles = await this.findById(user._id).populate("roles");

          // send verification email
          await initOTPGeneration(email);

          return userWithRoles;
        } catch (error) {
          throw new Error(error);
        }
      },
      async loginUser({
        email,
        password,
      }: {
        email: string;
        password: string;
      }) {
        try {
          // validate user input
          await loginUserSchema.validate({ email, password });
          // check if user exists
          const user = await this.findOne({ email });
          if (!user) {
            throw new Error("User does not exist");
          }
          // compare password
          const isMatch = await compare(password, user.password);
          if (!isMatch) {
            throw new Error("Invalid credentials");
          }
          // check if user is verified
          if (!user.emailVerified) {
            throw new Error("User is not verified");
          }
          return user;
        } catch (error) {
          throw new Error(error);
        }
      },
      async me({ id }: { id: string }) {
        try {
          return this.findById(id);
        } catch (error) {
          throw new Error(error);
        }
      },
      async editUser({
        id,
        name,
        email,
      }: {
        id: string;
        name: string;
        email: string;
      }) {
        try {
          // validate user input
          await editUserSchema.validate({ name, email });
          // check if user exists
          const user = await this.findById(id);
          if (!user) {
            throw new Error("User does not exist");
          }
          // update user
          return this.findByIdAndUpdate(id, { name, email }, { new: true });
        } catch (error) {
          throw new Error(error);
        }
      },
      async upsertGoogleUser({
        email,
        name,
        picture,
        verified_email,
      }: {
        email: string;
        name: string;
        picture: string;
        verified_email: boolean;
      }) {
        try {
          const userRole = await Role.findOne({ name: "user" });
          const user = await this.findOneAndUpdate(
            { email },
            {
              name,
              email,
              picture,
              emailVerified: verified_email,
              roles: [userRole._id],
            },
            { new: true, upsert: true }
          );

          console.log("👤👤👤👤👤 ~ user", user);

          // assign user role
          // await assignRoleToUser(user._id.toString(), "user");
          // const userWithRoles = await user.populate("roles");

          const userWithRoles = await user.populate("roles");
          console.log("👤👤👤👤👤 ~ userWithRoles", userWithRoles);

          return userWithRoles;
        } catch (error) {
          console.log("👤👤👤👤👤 ~ error", error);

          throw new Error(error.message);
        }
      },
    },
  }
);

export default mongoose.model("User", userSchema);
