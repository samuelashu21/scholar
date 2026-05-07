 

import nodemailer from 'nodemailer';

// Create a reusable transporter
const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Get the current year automatically
const currentYear = new Date().getFullYear();

// Common styling for emails
const emailStyles = {
    container: "font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;",
    header: "background-color: #007bff; color: white; padding: 20px; text-align: center;",
    body: "padding: 30px; color: #333; line-height: 1.6;",
    otpBox: "background-color: #f4f7ff; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;",
    footer: `background-color: #f9f9f9; color: #777; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;`
};

// Reusable footer HTML
const getFooter = (teamName = "Shola Marketplace") => `
    <div style="${emailStyles.footer}">
        &copy; ${currentYear} ${teamName}. All rights reserved.
    </div>
`;

export async function sendOTPEmail(userEmail, otp) {
    const transporter = createTransporter();
    const mailOptions = {
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("OTP Email sent to:", userEmail);
    } catch (error) {
        console.error("Email error:", error);
    }
}
 
export async function sendResetPasswordEmail(userEmail, otp) {
    const transporter = createTransporter();
    const mailOptions = {
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
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Reset Email sent to:", userEmail);
    } catch (error) {
        console.error("Email error:", error);
    }
}

export async function sendSellerRequestEmail(user, adminEmail) {
    const transporter = createTransporter();
    const mailOptions = {
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
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Admin Email Error:", error);
    }
}

export async function sendSellerApprovalEmail(user) {
    const transporter = createTransporter();
    const mailOptions = {
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
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Approval Email Error:", error);
    }
} 


export async function sendOrderStatusEmail(user, order, newStatus) {
    const transporter = createTransporter();
    const statusLabels = {
        pending: "Pending",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered",
        cancelled: "Cancelled",
        refund_requested: "Refund Requested",
        refunded: "Refunded",
    };
    const label = statusLabels[newStatus] || newStatus;
    const mailOptions = {
        from: `"Shola Marketplace" <${process.env.AUTH_EMAIL}>`,
        to: user.email,
        subject: `Your order status has been updated: ${label}`,
        html: `
            <div style="${emailStyles.container}">
                <div style="${emailStyles.header}"><h1>Order Update</h1></div>
                <div style="${emailStyles.body}">
                    <h2>Hi ${user.FirstName},</h2>
                    <p>Your order <b>#${order._id}</b> status has been updated to:</p>
                    <div style="${emailStyles.otpBox}">
                        <h2 style="color: #007bff; margin: 0;">${label}</h2>
                    </div>
                    <p>Total: <b>$${order.totalPrice?.toFixed(2)}</b></p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
                ${getFooter()}
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Order status email error:", error);
    }
}

export async function sendSellerRejectionEmail(user) {
    const transporter = createTransporter();
    const mailOptions = {
        from: `"Shola Marketplace" <${process.env.AUTH_EMAIL}>`,
        to: user.email,
        subject: "Rejection Email!",
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
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Approval Email Error:", error);
    }
}