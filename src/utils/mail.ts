import nodemailer, { SendMailOptions } from "nodemailer";
const { MAIL_LOGO } = process.env;

const APP_SUPPORT_MAIL = "tryparkit@gmail.com";
const APP_NAME = "Sparkit";

const mailSender = async (email: string, subject: string, body: string) => {
  try {
    // send email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let mailOptions: SendMailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: subject,
      html: body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);

    return info;
  } catch (error) {
    throw new Error(error);
  }
};

const generateEmailTemplate = (title: string, content: string) => `
  <div
    style="
      text-align: left;
      padding: 40px;
      background-color: #ffffff;
      color: #333333;
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    "
  >
    <!-- Header -->
    <div style="width: 100%; margin-bottom: 20px;">
      <div
        style="
          width: 40px;
          height: 40px;
          display: inline-block;
          vertical-align: middle;
        "
      >
        <img
          src="${MAIL_LOGO}"
          alt="${APP_NAME} Logo"
          width="40"
          height="40"
        />
      </div>
      <span style="margin-left: 10px; font-size: 24px; font-weight: bold; color: #4f46e5;">
        ${APP_NAME}
      </span>
    </div>
    
    <!-- Main Content -->
    <div style="text-align: left; padding-bottom: 20px;">
      <h1 style="font-size: 20px; color: #333333;">${title}</h1>
      ${content}
    </div>

    <!-- Footer -->
    <div
      style="
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #dddddd;
        color: #999999;
        font-size: 12px;
      "
    >
      <p>
        If you have any questions, please contact us at
        <a href="${APP_SUPPORT_MAIL}" style="color: #4f46e5;">support@nanoapps.store</a>.
      </p>
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
    </div>
  </div>
`;

export { mailSender, generateEmailTemplate };
