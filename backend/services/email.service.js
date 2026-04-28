const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendPasswordResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"JobPortal" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password — JobPortal',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:12px;">
        <h2 style="color:#1d4ed8;margin-bottom:8px;">Reset Your Password</h2>
        <p style="color:#374151;margin-bottom:24px;">
          You requested a password reset. Click the button below to set a new password.
          This link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Reset Password
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
        <p style="color:#9ca3af;font-size:11px;">JobPortal — AI Job Portal &amp; Resume Analyzer</p>
      </div>
    `,
  });
};
