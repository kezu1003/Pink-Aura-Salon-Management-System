let transporter = null;
try {
 
  const m = await import("../nodemailer.js").catch(() => null) 
          || await import("./nodemailer.js").catch(() => null);
  transporter = m?.default || null;
} catch {  }

export async function sendMailSafe(opts = {}) {
  if (!transporter) return { ok: false, skipped: true };
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Pink Aura" <no-reply@yourdomain.com>`,
      ...opts,
    });
    return { ok: true };
  } catch (e) {
    console.error("Mail error:", e.message);
    return { ok: false, error: e.message };
  }
}
