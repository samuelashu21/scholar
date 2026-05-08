import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

export const sendMailNow = async (mailOptions) => {
  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
};
