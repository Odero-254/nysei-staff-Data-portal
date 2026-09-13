// api/smtp-config.js
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const smtpUser = process.env.SMTP_USER || '';
  const smtpFromName = process.env.SMTP_FROM_NAME || 'NYSEI Data Protection Office';
  const smtpPass = process.env.SMTP_PASS || '';

  res.status(200).json({
    smtpUser,
    smtpFromName,
    isConfigured: !!(smtpUser && smtpPass),
  });
}