import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

/**
 * Generates an HTML email template with the given subject and content
 * @param subject The email subject
 * @param content The HTML content for the email body
 * @returns The complete HTML email template as a string
 */
export const generateEmailTemplate = (subject: string, content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            padding: 20px;
            background-color: #ffffff;
            border-radius: 0 0 5px 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${subject}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Sends an email using nodemailer
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content for the email body
 * @returns Promise resolving to the nodemailer send mail result
 */
export const mailSender = async (
  to: string,
  subject: string,
  html: string
): Promise<any> => {
  try {
    // Get email configuration from environment variables
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM || 'API Service'}" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Message sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

