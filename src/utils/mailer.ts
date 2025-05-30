import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import dotenv from 'dotenv';
import crypto from "crypto";
dotenv.config();



// Defining the typing for clarity and safety
interface EmailOptions {
  email: string;
  emailType: 'VERIFY' | 'RESET';
  userId: string;
}

export const sendEmail = async ({email, emailType, userId}: any) => {
  
  try {
   //Creating token
   //we can use uuid as it comes without special characters
  //  const hashedToken = await bcrypt.hash(userId.toString(), 10);

  // Generating a random token using crypto
  const hashedToken = crypto.randomBytes(32).toString("hex");

    //if the type is verify we will send two copies
    if (emailType === 'VERIFY') {
      await User.update(
        {
          verifyToken: hashedToken,
          verifyTokenExpiry: new Date(Date.now() + 600000), // 10 minutes from now
        },
        {
          where: { user_id: userId },
        }
      );
    }else if(emailType === 'RESET'){
      await User.update(
        {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: new Date(Date.now() + 600000),
        },
        {
          where:{user_id: userId},
        }
      )
    }

    //Using mail trapper for sending the mails
    //Using only developer Mode not the production grade
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "4aab97f46f4b51",
    pass: "c69507c77f6d7f"
  }
});

 // 📬 Dynamic email content based on type
 const route = emailType === "VERIFY" ? "verifyemail" : "resetpassword";
 const actionText = emailType === "VERIFY" ? "verify your email" : "reset your password";


const mailOptions : any = {
  from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
  to: email,
  subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
  // TODO: Only created for the VERIFY need to create for the Reset too
  // html:`<p>Click <a href = "${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"} or copy and paste the link below in your browser. 
  // <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
  // </p>`,

  html: `<p>Click <a href="${process.env.DOMAIN}/${route}?token=${hashedToken}">here</a> to ${actionText} or copy and paste the link below in your browser:
      <br>${process.env.DOMAIN}/${route}?token=${hashedToken}</p>`,
}

//Sending mail and getting the response
const mailResponse = await transport.sendMail(mailOptions);

console.log(`📧 Sent ${emailType} email to ${email} with token: ${hashedToken}`);

return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
