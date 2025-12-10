// sendOTPEmail.js
import nodemailer from 'nodemailer';

export async function sendOTPEmail(userEmail, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Shola Verification Code",
        html: `
            <h1>Shola Email Verification</h1>
            <p>Your verification code is:</p>
            <h2 style="color: blue;">${message}</h2>
            <p>Please enter this code on the verification page to complete your registration process.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Expires in 5 minutes</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent");
    } catch (error) {
        console.log("Email sending failed with an error: ", error);
    }
}
 
 

export async function sendResetPasswordEmail(userEmail, message) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: "Shola Reset Password Email Code",
        html: `
            <h1>Reset Password Email</h1>
            <p>Your verification code is:</p>
            <h2 style="color: blue;">${message}</h2>
            <p>Please enter this code on the verification page to complete your Password Reset process.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Expires in 5 minutes</p> 
        `,
    };
 
    try { 
        await transporter.sendMail(mailOptions);
        console.log("Password Reset email sent");
    } catch (error) { 
        console.log("Email sending failed with an error: ", error);
    }
}

 

export async function sendSellerRequestEmail(user, adminEmail) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: adminEmail,
    subject: `New Seller Request from ${user.name || user.email}`,
    html: `
      <h1>New Seller Request</h1>
      <p><strong>User:</strong> ${user.name || "N/A"} (${user.email})</p>
      <p><strong>Subscription Type:</strong> ${user.sellerRequest.subscriptionType}</p>
      <p><strong>Store Name:</strong> ${user.sellerProfile.storeName || "N/A"}</p>
      <p><strong>Store Description:</strong> ${user.sellerProfile.storeDescription || "N/A"}</p>
      <p><strong>Store Logo:</strong> ${user.sellerProfile.storeLogo || "N/A"}</p>
      <p>Please review and approve or reject this seller request in the admin panel.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Seller request email sent to admin");
  } catch (error) {
    console.error("Failed to send seller request email:", error);
  }
}  


export async function sendSellerApprovalEmail(user) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: "Your Seller Request Has Been Approved!",
    html: `
      <h1>Congratulations, ${user.FirstName || "User"}!</h1>
      <p>Your request to become a seller has been <strong>approved</strong>.</p>
      <p><strong>Store Name:</strong> ${user.sellerProfile.storeName || "N/A"}</p>
      <p><strong>Subscription Type:</strong> ${user.sellerRequest.subscriptionType}</p>
      ${
        user.sellerRequest.subscriptionEnd
          ? `<p><strong>Subscription Valid Until:</strong> ${user.sellerRequest.subscriptionEnd.toDateString()}</p>`
          : ""
      }
      <p>You can now access your seller dashboard and start listing products.</p>
      <p>Thank you for joining our platform!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Seller approval email sent to user:", user.email);
  } catch (error) {
    console.error("Failed to send seller approval email:", error);
  }
}