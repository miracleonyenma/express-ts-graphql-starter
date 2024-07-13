import otpGenerator from "otp-generator";
import { mailSender } from "../utils/mail.js";
import OTP from "../models/otp.model.js";
import User from "../models/user.model.js";

const sendVerificationMail = async (email: string, otp: string) => {
  try {
    // send email
    const mailResponse = await mailSender(
      email,
      "Email Verification",
      `
    <div
      style="
        text-align: center;
        padding: 20px;
        background-color: #4f46e5;
        color: #d9d8ff;
        height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
          sans-serif;
        font-weight: 300;
      "
    >
      <div style="width: 100%">
        <div
          style="
            width: 32px;
            height: 32px;
            display: inline-block;
            vertical-align: middle;
          "
        >
          <img
            src="https://res.cloudinary.com/alphas/image/upload/v1720774037/appstore/nano-no-bg_izjmy5.png"
            alt="logo"
            srcset=""
            width="32"
            height="32"
          />
        </div>
        <span style="margin-left: 0.5rem; font-size: large; font-weight: 700">
          Nano Apps
        </span>
      </div>
      <div style="text-align: center; padding-top: 4rem; padding-bottom: 4rem">
        <h1>Email Verification</h1>
        <p>Your OTP is: <strong>${otp}</strong></p>
      </div>
    </div>
      `
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
