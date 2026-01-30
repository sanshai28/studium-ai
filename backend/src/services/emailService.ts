import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

interface SendResetEmailParams {
  to: string;
  resetToken: string;
  userName?: string;
}

/**
 * Send password reset email to user
 * @param to - Recipient email address
 * @param resetToken - Password reset token
 * @param userName - Optional user name for personalization
 */
export const sendPasswordResetEmail = async ({
  to,
  resetToken,
  userName,
}: SendResetEmailParams): Promise<void> => {
  // Construct reset URL based on environment
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Studium AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Request - Studium AI',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${userName || 'there'},</p>

              <p>We received a request to reset your password for your Studium AI account.</p>

              <p>Click the button below to reset your password:</p>

              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>

              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>

              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 15 minutes for security reasons.
              </div>

              <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>

              <p>Best regards,<br>The Studium AI Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Studium AI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${userName || 'there'},

We received a request to reset your password for your Studium AI account.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 15 minutes for security reasons.

If you didn't request a password reset, please ignore this email.

Best regards,
The Studium AI Team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Verify email configuration is valid
 */
export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Email service is configured correctly');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
};
