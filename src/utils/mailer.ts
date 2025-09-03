import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
// import dotenv from "dotenv";
// dotenv.config();

// Defining the typing for clarity and safety
interface EmailOptions {
  email: string;
  emailType: "VERIFY" | "RESET";
  // userId: string;
  link: string;
}

export const sendEmail = async ({ email, emailType, link }: EmailOptions) => {
  try {
    const transport = nodemailer.createTransport({
      service: process.env.GMAIL_SERVICE,
      host: process.env.GMAIL_HOST,
      port: Number(process.env.GMAIL_SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    } as SMTPTransport.Options);

    let subject = "";
    let html = "";

    //if the type is verify we will send two copies
    if (emailType === "VERIFY") {
      subject = "SoundSpire - Verify your email!";
      html = `
        <h2>Welcome to SoundSpire!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${link}">Verify Email</a>
        <p>This link will expire in 20 minutes.</p>
      `;
    } else if (emailType === "RESET") {
      subject = "SoundSpire - Reset your password";
      html = `
        <h2>Password Reset Request</h2>
        <p>Click below to reset your password:</p>
        <a href="${link}">Reset Password</a>
        <p>This link will expire soon.</p>
      `;
    }

    const mailOptions = {
      from: `"SoundSpire" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html,
    };

    //Sending mail and getting the response
    const mailResponse = await transport.sendMail(mailOptions);
    console.log("📬 Mail sent:", mailResponse.messageId);

    return mailResponse;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error sending email:", error.message);
      throw new Error(error.message);
    }
  }
};
