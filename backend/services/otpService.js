import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import emailService from './emailService.js';

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

class OtpService {
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailOtp(email) {
    try {
      // Invalidate any existing OTP for this email
      await prisma.emailOtp.deleteMany({
        where: { email }
      });

      const otp = this.generateOtp();
      const otpHash = await bcrypt.hash(otp, 10);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      // Store hashed OTP
      await prisma.emailOtp.create({
        data: {
          email,
          otp_hash: otpHash,
          expires_at: expiresAt,
          attempts: 0
        }
      });

      // Send OTP via email (skip in development if email not configured)
      try {
        await emailService.sendOtpEmail(email, otp);
      } catch (emailError) {
        console.log(`Development mode: OTP for ${email} is ${otp}`);
        if (process.env.NODE_ENV === 'production') {
          throw emailError;
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyEmailOtp(email, otp) {
    try {
      const otpRecord = await prisma.emailOtp.findFirst({
        where: { 
          email,
          expires_at: { gt: new Date() }
        }
      });

      if (!otpRecord) {
        throw new Error('OTP not found or expired');
      }

      if (otpRecord.attempts >= MAX_ATTEMPTS) {
        await prisma.emailOtp.delete({
          where: { id: otpRecord.id }
        });
        throw new Error('Maximum verification attempts exceeded');
      }

      const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);

      if (!isValidOtp) {
        // Increment attempts
        await prisma.emailOtp.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 }
        });
        throw new Error('Invalid OTP');
      }

      // OTP is valid - mark user as verified and delete OTP
      await prisma.$transaction([
        prisma.users.updateMany({
          where: { email },
          data: { is_verified: true }
        }),
        prisma.emailOtp.delete({
          where: { id: otpRecord.id }
        })
      ]);

      return { success: true };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }
}

export default new OtpService();