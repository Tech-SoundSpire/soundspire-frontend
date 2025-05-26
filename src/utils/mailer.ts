import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';

export const sendEmail = async ({email, emailType, userId}: any) => {
  
  try {
   //Creating token
   //we can use uuid as it comes without special characters
   const hashedToken = await bcrypt.hash(userId.toString(), 10);

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
    var transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "5b5a1838d1d16f",//This must be in the Env variable
        pass: "****a621"//This must be in the Env variable
      }
    });

const mailOptions : any = {
  from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
  to: email,
  subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
  html:`<p>Click <a href = "${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"} or copy and paste the link below in your browser. 
  <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
  </p>`,
}

//Sending mail and getting the response
const mailResponse = await transport.sendMail(mailOptions);

return mailResponse;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
