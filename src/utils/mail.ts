import nodemailer, { SendMailOptions } from "nodemailer";

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

export { mailSender };
