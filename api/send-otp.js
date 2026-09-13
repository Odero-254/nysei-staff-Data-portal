// api/send-otp.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp, fullName } = req.body || {};

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFromName = process.env.SMTP_FROM_NAME || 'NYSEI Data Protection Office';
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({ success: false, message: 'SMTP not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpUser}>`,
      to: email,
      subject: `[NYSEI Portal] Your 2FA Verification Code: ${otp}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #C8D4CB; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header Bar -->
          <div style="background: #1B3A2D; color: #ffffff; padding: 24px 20px; text-align: center; border-bottom: 4px solid #C8922A;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">National Youth Service</h1>
            <h2 style="margin: 4px 0 0 0; font-size: 14px; font-weight: 400; color: #C8922A; text-transform: uppercase; letter-spacing: 1px;">Engineering Institute — Staff Portal</h2>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px;">
            <div style="margin-bottom: 16px;">
              <span style="font-size: 11px; font-weight: 700; color: #1B3A2D; text-transform: uppercase; letter-spacing: 1px; background: #EFF4F1; padding: 4px 10px; border-radius: 20px; border: 1px solid #C8D4CB;">
                2FA Security Code
              </span>
            </div>

            <p style="font-size: 15px; color: #1A2A22; margin: 0 0 12px 0; font-weight: 600;">Dear ${fullName || 'Staff Member'},</p>
            <p style="font-size: 14px; color: #4A5A50; margin: 0 0 20px 0; line-height: 1.5;">
              You have requested access to view or update staff records on the NYSEI Data Platform. Use the 6-digit verification code below to complete your authentication:
            </p>

            <!-- OTP Code Display Box -->
            <div style="background: #F3F5F2; border: 2px dashed #C8922A; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <div style="font-size: 11px; color: #5A7060; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; font-weight: 700;">Your Verification OTP</div>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1B3A2D; font-family: monospace;">${otp}</div>
              <div style="font-size: 11px; color: #8B1A1A; margin-top: 8px; font-weight: 600;">⏱️ Code expires in 10 minutes</div>
            </div>

            <div style="background: #EFF6FF; border: 1px solid #93C5FD; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px;">
              <p style="font-size: 12px; color: #1E3A8A; margin: 0; line-height: 1.4;">
                <strong>Security Alert:</strong> If you did not request this verification code, please ignore this email or notify your system administrator immediately.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #EFF4F1; padding: 16px 20px; text-align: center; border-top: 1px solid #C8D4CB; font-size: 11px; color: #5A7060;">
            National Youth Service Engineering Institute &copy; Official Staff Data Portal
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('SMTP Email Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}