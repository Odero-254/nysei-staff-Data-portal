// src/components/SmtpStatusPanel.jsx
import { useSmtpStatus } from '../hooks/useSmtpStatus';

export function SmtpStatusPanel() {
  const { loading, error, data } = useSmtpStatus();

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Checking SMTP status…</div>;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-sm text-red-800">
        Could not load SMTP status: {error}
      </div>
    );
  }

  if (!data?.isConfigured) {
    return (
      <div className="p-4 border border-amber-300 bg-amber-50 rounded-lg">
        <h3 className="font-semibold text-amber-900"> SMTP is not configured</h3>
        <p className="text-sm text-amber-800 mt-1">
          OTP emails will not be sent until these environment variables are set in
          the production server and the app is redeployed:
        </p>
        <ul className="text-sm text-amber-900 mt-2 list-disc list-inside font-mono">
          <li>SMTP_HOST</li>
          <li>SMTP_PORT</li>
          <li>SMTP_USER</li>
          <li>SMTP_PASS</li>
          <li>SMTP_FROM_NAME</li>
        </ul>
        <p className="text-xs text-amber-700 mt-3">
          Production Server → Project → Settings → Environment Variables → add each → Redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-green-300 bg-green-50 rounded-lg">
      <h3 className="font-semibold text-green-900"> SMTP is configured</h3>
      <div className="text-sm text-green-800 mt-2 space-y-1">
        <div><span className="font-medium">Sending from:</span> {data.smtpUser}</div>
        <div><span className="font-medium">Display name:</span> {data.smtpFromName}</div>
      </div>
      <p className="text-xs text-green-700 mt-3">
        To change these, update the environment variables in the production server dashboard
        and redeploy. SMTP credentials can only be changed server-side for security.
      </p>
    </div>
  );
}