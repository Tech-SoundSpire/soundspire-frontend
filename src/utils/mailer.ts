import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

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
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let subject = "";
    let html = "";

    //if the type is verify we will send two copies
    if (emailType === "VERIFY") {

      subject = "Verify your email";
      html = `
        <h2>Welcome to Our App!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${link}">Verify Email</a>
        <p>This link will expire in 20 minutes.</p>
      `;
    } else if (emailType === "RESET") {
   
      subject = "Reset your password";
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
    if(error instanceof Error){
      console.error("❌ Error sending email:", error.message);
      throw new Error(error.message);
    }
  }
};
