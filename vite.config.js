import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'otp-email-server',
        configureServer(server) {
          // Route: GET/POST /api/smtp-config
          server.middlewares.use('/api/smtp-config', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            
            if (req.method === 'GET') {
              const smtpUser = process.env.SMTP_USER || env.SMTP_USER || '';
              const smtpFromName = process.env.SMTP_FROM_NAME || env.SMTP_FROM_NAME || 'NYS Engineering Institute';
              const smtpPass = process.env.SMTP_PASS || env.SMTP_PASS || '';
              res.statusCode = 200;
              res.end(JSON.stringify({
                smtpUser,
                smtpFromName,
                isConfigured: !!(smtpUser && smtpPass),
              }));
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const { smtpUser, smtpPass, smtpFromName } = JSON.parse(body || '{}');
                  if (smtpUser !== undefined) process.env.SMTP_USER = smtpUser;
                  if (smtpPass !== undefined) process.env.SMTP_PASS = smtpPass;
                  if (smtpFromName !== undefined) process.env.SMTP_FROM_NAME = smtpFromName;

                  // Update .env file on disk
                  try {
                    const envPath = path.resolve(process.cwd(), '.env');
                    let content = '';
                    if (fs.existsSync(envPath)) {
                      content = fs.readFileSync(envPath, 'utf8');
                    }
                    
                    const setKey = (key, val) => {
                      const regex = new RegExp(`^${key}=.*$`, 'm');
                      if (regex.test(content)) {
                        content = content.replace(regex, `${key}=${val}`);
                      } else {
                        content += `\n${key}=${val}`;
                      }
                    };

                    if (smtpUser !== undefined) setKey('SMTP_USER', smtpUser);
                    if (smtpPass !== undefined) setKey('SMTP_PASS', smtpPass);
                    if (smtpFromName !== undefined) setKey('SMTP_FROM_NAME', smtpFromName || 'NYSEI Data Protection Office');
                    if (!content.includes('SMTP_HOST=')) content += '\nSMTP_HOST=smtp.gmail.com';
                    if (!content.includes('SMTP_PORT=')) content += '\nSMTP_PORT=465';

                    fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
                  } catch (e) {
                    console.error('Failed to write .env file:', e);
                  }

                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, message: 'SMTP settings updated successfully!' }));
                } catch (err) {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ success: false, message: err.message }));
                }
              });
              return;
            }
          });

          server.middlewares.use('/api/send-otp', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { email, otp, fullName } = JSON.parse(body || '{}');

                if (!email || !otp) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, message: 'Email and OTP are required' }));
                  return;
                }

                // Check SMTP credentials from environment
                const smtpUser = process.env.SMTP_USER || env.SMTP_USER;
                const smtpPass = process.env.SMTP_PASS || env.SMTP_PASS;
                const smtpFromName = process.env.SMTP_FROM_NAME || env.SMTP_FROM_NAME || 'NYSEI Data Protection Office';
                const smtpHost = process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com';
                const smtpPort = parseInt(process.env.SMTP_PORT || env.SMTP_PORT || '465', 10);

                if (smtpUser && smtpPass) {
                  const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpPort === 465,
                    auth: {
                      user: smtpUser,
                      pass: smtpPass,
                    },
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
                              🔒 2FA Security Code
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
                    `
                  });
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'OTP processed successfully' }));
              } catch (err) {
                console.error('SMTP Email Error:', err);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, warning: err.message }));
              }
            });
          });
        }
      }
    ],
  };
});