import { generateEmailTemplate, mailSender } from "../utils/mail.js";
const { MAIL_LOGO } = process.env;
const APP_URL = process.env.APP_URL;

const sendPasswordResetMail = async (email: string, token: string) => {
  const resetURL = `${APP_URL}/auth/reset-password?token=${token}`;
  const content = `
    <p>
      You are receiving this email because you requested a password reset for your account.
    </p>
    <a href="${resetURL}" style="background-color: #d9d8ff; color: #4f46e5; padding: 1rem; border-radius: 5px; text-decoration: none; margin-top:3rem;">
      Reset Password
    </a>
    <p style="margin-top:3rem;">
      If you did not request a password reset, no further action is required.
    </p>
  `;

  const emailBody = generateEmailTemplate("Password Reset", content);

  try {
    const mailResponse = await mailSender(email, "Password Reset", emailBody);
    return mailResponse;
  } catch (error) {
    throw new Error(error);
  }
};

export { sendPasswordResetMail };
