import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Send a branded verification OTP email.
 */
export const sendEmailOtp = async (to: string, otp: string): Promise<void> => {
  const html = `
    <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f172a;border-radius:16px;color:#f1f5f9;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="font-size:24px;color:#93c5fd;margin:0;">⚖️ LexFirma</h1>
        <p style="color:#94a3b8;font-size:14px;margin-top:4px;">India's Trusted Legal Platform</p>
      </div>
      <div style="background:#1e293b;border-radius:12px;padding:24px;text-align:center;">
        <p style="color:#cbd5e1;font-size:15px;margin:0 0 16px;">Your email verification code is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#60a5fa;padding:12px 0;">
          ${otp}
        </div>
        <p style="color:#64748b;font-size:13px;margin-top:16px;">
          This code expires in <strong style="color:#f59e0b;">10 minutes</strong>.
          <br/>Do not share this code with anyone.
        </p>
      </div>
      <p style="color:#475569;font-size:12px;text-align:center;margin-top:20px;">
        If you did not request this, please ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"LexFirma" <${process.env.MAIL_USER}>`,
    to,
    subject: 'LexFirma — Verify Your Email Address',
    html,
  });
};
