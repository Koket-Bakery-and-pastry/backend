import nodemailer from "nodemailer";

// Create transporter using cPanel SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.yourdomain.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // false for 587 (STARTTLS), true for 465 (SSL)
  auth: {
    user: process.env.SMTP_USER || "noreply@yourdomain.com",
    pass: process.env.SMTP_PASS || "",
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
});

export class EmailService {
  /**
   * Send OTP email for password reset
   */
  static async sendPasswordResetOTP(
    email: string,
    name: string,
    otp: string
  ): Promise<void> {
    const emailFrom = process.env.SMTP_USER || "noreply@yourdomain.com";
    try {
      await transporter.sendMail({
        from: `"Koket Bakery" <${emailFrom}>`,
        to: email,
        subject: "Password Reset OTP - Koket Bakery",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
                .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; letter-spacing: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Koket Bakery</h1>
                </div>
                <div class="content">
                  <h2>Hi ${name},</h2>
                  <p>We received a request to reset your password. Use the code below to proceed:</p>
                  <div class="otp">${otp}</div>
                  <p><strong>This code expires in 10 minutes.</strong></p>
                  <p>If you didn't request this, please ignore this email or contact us if you have concerns.</p>
                  <p>Best regards,<br>Koket Bakery Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Koket Bakery. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error("Error sending OTP email:", error);
      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error(
        `Failed to send OTP email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
