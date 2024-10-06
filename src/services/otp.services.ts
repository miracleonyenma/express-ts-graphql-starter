import otpGenerator from "otp-generator";
import { generateEmailTemplate, mailSender } from "../utils/mail.js";
import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";
import { config } from "dotenv";
config();

const sendVerificationMail = async (email: string, otp: string) => {
  const content = `
    <p>Your OTP is: <br /> <strong style="font-size: 2.25rem;">${otp}</strong></p>
  `;

  const emailBody = generateEmailTemplate("Email Verification", content);

  try {
    const mailResponse = await mailSender(
      email,
      "Email Verification",
      emailBody
    );
    return mailResponse;
  } catch (error) {
    throw new Error(error);
  }
};

const initOTPGeneration = async (email: string) => {
  console.log({ email });

  try {
    // check if user with email exists
    const userExists = await User.findOne({ email });

    console.log({ userExists });

    if (!userExists) {
      throw new Error("User with email does not exist");
    }

    // generate OTP
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // add OTP to database
    const OTPObject = await OTP.create({ email, otp });

    // send verification email
    // console.log("OTPObject", OTPObject);
    // const mailResponse = await sendVerificationMail(email, otp);

    return OTPObject;
  } catch (error) {
    console.log({ error });

    throw new Error(error);
  }
};

export { sendVerificationMail, initOTPGeneration };
