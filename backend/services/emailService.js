import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendOTP(email, otp, type = 'verification') {
    const subject = type === 'verification' ? 'Verify Your Email - Amzify' : 'Password Reset - Amzify';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Amzify</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your trusted marketplace</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">
            ${type === 'verification' ? 'Email Verification' : 'Password Reset'}
          </h2>
          
          <p style="color: #4b5563; margin-bottom: 30px; font-size: 16px;">
            ${type === 'verification' 
              ? 'Please use the following OTP to verify your email address:' 
              : 'Please use the following OTP to reset your password:'
            }
          </p>
          
          <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Amzify. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Amzify" <${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendPasswordResetLink(email, resetLink) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Amzify</h1>
          <p style="color: #6b7280; margin: 5px 0;">Password Reset</p>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 10px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">Reset Your Password</h2>

          <p style="color: #4b5563; margin-bottom: 24px; font-size: 16px;">
            We received a request to reset your password. Click the button below to continue.
          </p>

          <a href="${resetLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>

          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This link will expire soon. If you didn't request this, please ignore this email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Amzify. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Amzify Admin" <${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Amzify Password',
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset link sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Password reset email failed:', error);
      return false;
    }
  }

  async sendFeedbackNotification(feedback) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0;">Amzify Admin</h1>
          <p style="color: #6b7280; margin: 5px 0;">New Customer Feedback</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Customer Feedback Received</h2>
          
          <div style="margin-bottom: 20px;">
            <strong>Customer:</strong> ${feedback.customer_name}<br>
            <strong>Email:</strong> ${feedback.customer_email}<br>
            <strong>Type:</strong> ${feedback.type}<br>
            <strong>Rating:</strong> ${feedback.rating}/5 stars<br>
            <strong>Date:</strong> ${new Date(feedback.created_at).toLocaleString()}
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5;">
            <strong>Message:</strong><br>
            <p style="margin: 10px 0; line-height: 1.6;">${feedback.message}</p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Amzify System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Customer Feedback - ${feedback.type}`,
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Feedback notification sent to admin`);
      return true;
    } catch (error) {
      console.error('Feedback notification failed:', error);
      return false;
    }
  }

  async sendSellerApprovalEmail(email, sellerName, companyName) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; margin: 0;">🎉 Amzify</h1>
          <p style="color: #6b7280; margin: 5px 0;">Seller Account Approved</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 30px; border-radius: 10px; border: 2px solid #10b981;">
          <h2 style="color: #065f46; margin-bottom: 20px;">Congratulations, ${sellerName}!</h2>
          
          <p style="color: #047857; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your seller account for <strong>${companyName}</strong> has been approved! 
            You can now start listing products and selling on Amzify.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Next Steps:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Log in to your seller dashboard</li>
              <li>Complete your store profile</li>
              <li>Add your first products</li>
              <li>Start accepting orders</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/seller/login" 
               style="display: inline-block; background: #10b981; color: white; text-decoration: none; 
                      padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Access Seller Dashboard
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
            Welcome to the Amzify seller community! We're excited to have you on board.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Amzify. All rights reserved.</p>
          <p>Need help? Contact us at support@amzify.com</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Amzify Admin" <${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎉 Seller Account Approved - Welcome to Amzify!',
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Seller approval email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Seller approval email failed:', error);
      return false;
    }
  }

  async sendSellerRejectionEmail(email, sellerName, companyName, reason) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ef4444; margin: 0;">Amzify</h1>
          <p style="color: #6b7280; margin: 5px 0;">Seller Application Update</p>
        </div>
        
        <div style="background: #fef2f2; padding: 30px; border-radius: 10px; border: 2px solid #ef4444;">
          <h2 style="color: #991b1b; margin-bottom: 20px;">Application Status Update</h2>
          
          <p style="color: #7f1d1d; font-size: 16px; margin-bottom: 20px;">
            Dear ${sellerName},
          </p>

          <p style="color: #7f1d1d; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your interest in selling on Amzify. After careful review, 
            we regret to inform you that your seller application for <strong>${companyName}</strong> 
            has not been approved at this time.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="color: #1f2937; margin-bottom: 10px;">Reason:</h3>
            <p style="color: #4b5563; line-height: 1.6; margin: 0;">
              ${reason}
            </p>
          </div>

          <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            You may reapply in the future once you've addressed the concerns mentioned above. 
            If you have any questions, please don't hesitate to contact our support team.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:support@amzify.com" 
               style="display: inline-block; background: #ef4444; color: white; text-decoration: none; 
                      padding: 12px 24px; border-radius: 8px; font-weight: bold;">
              Contact Support
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
          <p>© 2024 Amzify. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Amzify Admin" <${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Seller Application Status - Amzify',
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Seller rejection email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Seller rejection email failed:', error);
      return false;
    }
  }
}

export default new EmailService();