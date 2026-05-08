import { enqueueEmail } from "../queues/jobQueues.js";

const currentYear = new Date().getFullYear();

const emailStyles = {
  container:
    "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;",
  header: "background-color: #007bff; color: white; padding: 20px; text-align: center;",
  body: "padding: 30px; color: #333; line-height: 1.6;",
  otpBox:
    "background-color: #f4f7ff; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;",
  footer:
    "background-color: #f9f9f9; color: #777; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;",
};

const getFooter = (teamName = "Shola Marketplace") => `
  <div style="${emailStyles.footer}">
    &copy; ${currentYear} ${teamName}. All rights reserved.
  </div>
`;

const queueEmail = async (mailOptions) => {
  await enqueueEmail(mailOptions);
};

export async function sendOTPEmail(userEmail, otp) {
  await queueEmail({
    from: `"Shola Marketplace" <${process.env.AUTH_EMAIL}>`,
    to: userEmail,
    subject: "Verify Your Shola Account",
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}"><h1>Shola</h1></div>
        <div style="${emailStyles.body}">
          <h2>Verify Your Email</h2>
          <p>Welcome to Shola! Please use the following code to complete your registration:</p>
          <div style="${emailStyles.otpBox}">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code <b>expires in 5 minutes</b>. If you didn't request this, please ignore this email.</p>
        </div>
        ${getFooter()}
      </div>
    `,
  });
}

export async function sendResetPasswordEmail(userEmail, otp) {
  await queueEmail({
    from: `"Shola Support" <${process.env.AUTH_EMAIL}>`,
    to: userEmail,
    subject: "Reset Your Shola Password",
    html: `
      <div style="${emailStyles.container}">
        <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;"><h1>Shola</h1></div>
        <div style="${emailStyles.body}">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the code below to proceed:</p>
          <div style="${emailStyles.otpBox}">
            <h1 style="color: #dc3545; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>For your security, do not share this code with anyone. It will expire shortly.</p>
        </div>
        ${getFooter("Shola Support Team")}
      </div>
    `,
  });
}

export async function sendSellerRequestEmail(user, adminEmail) {
  await queueEmail({
    from: `"Shola System" <${process.env.AUTH_EMAIL}>`,
    to: adminEmail,
    subject: `New Seller Request: ${user.sellerProfile?.storeName || user.email}`,
    html: `
      <div style="${emailStyles.container}">
        <div style="background-color: #333; color: white; padding: 20px; text-align: center;"><h1>Admin Alert</h1></div>
        <div style="${emailStyles.body}">
          <h3>New Application Received</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>User:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${user.FirstName} ${user.LastName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Email:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${user.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Store:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${user.sellerProfile?.storeName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Plan:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${user.sellerRequest?.subscriptionType}</td></tr>
          </table>
          <p>Please log in to the admin panel to review the full profile.</p>
        </div>
        ${getFooter("Shola Admin System")}
      </div>
    `,
  });
}

export async function sendSellerApprovalEmail(user) {
  await queueEmail({
    from: `"Shola Marketplace" <${process.env.AUTH_EMAIL}>`,
    to: user.email,
    subject: "Welcome to the Shola Seller Family!",
    html: `
      <div style="${emailStyles.container}">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;"><h1>Store Approved!</h1></div>
        <div style="${emailStyles.body}">
          <h2>Congratulations, ${user.FirstName}!</h2>
          <p>Your store <b>"${user.sellerProfile.storeName}"</b> has been officially approved.</p>
          <p><b>Subscription:</b> ${user.sellerRequest.subscriptionType}</p>
          ${user.sellerRequest.subscriptionEnd ? `<p><b>Ends on:</b> ${new Date(user.sellerRequest.subscriptionEnd).toDateString()}</p>` : ""}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>You can now start uploading your products.</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/seller-dashboard" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `,
  });
}

export async function sendSellerRejectionEmail(user) {
  await queueEmail({
    from: `"Shola Marketplace" <${process.env.AUTH_EMAIL}>`,
    to: user.email,
    subject: "Store application update",
    html: `
      <div style="${emailStyles.container}">
        <div style="background-color: #a72828ff; color: white; padding: 20px; text-align: center;"><h1>Store Rejected!</h1></div>
        <div style="${emailStyles.body}">
          <h2>Dear, ${user.FirstName}!</h2>
          <p>Your store <b>"${user.sellerProfile.storeName}"</b> has been rejected.</p>
          <p><b>Subscription:</b> ${user.sellerRequest.subscriptionType}</p>
          ${user.sellerRequest.subscriptionEnd ? `<p><b>Ends on:</b> ${new Date(user.sellerRequest.subscriptionEnd).toDateString()}</p>` : ""}
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <div style="text-align: center; margin-top: 20px;">
            <a href="${process.env.FRONTEND_URL}/seller-dashboard" style="background-color: #a72828ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
        ${getFooter()}
      </div>
    `,
  });
}

export async function sendOrderStatusEmail({ email, firstName, orderId, status, note = "" }) {
  await queueEmail({
    from: `"Shola Marketplace" <${process.env.AUTH_EMAIL}>`,
    to: email,
    subject: `Order ${orderId} is now ${status.replaceAll("_", " ")}`,
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}"><h1>Order Update</h1></div>
        <div style="${emailStyles.body}">
          <h2>Hello ${firstName || "Customer"},</h2>
          <p>Your order <b>#${orderId}</b> status changed to <b>${status.replaceAll("_", " ")}</b>.</p>
          ${note ? `<p><b>Note:</b> ${note}</p>` : ""}
          <p>Thanks for shopping with us.</p>
        </div>
        ${getFooter()}
      </div>
    `,
  });
}
