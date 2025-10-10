import ContactMessage from "../models/ContactMessage.js";


export const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone = "", subject, message } = req.body || {};
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    await ContactMessage.create({ name, email, phone, subject, message });
    return res.json({ success: true });
  } catch (err) {
    console.error("createContactMessage error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**  get all contact messages */

export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

/**  delete */

export const deleteMessage = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};

/**  reply to message  */

export const replyToMessage = async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body)
      return res.status(400).json({ success: false, message: "Missing fields" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Pink Aura Admin" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
    });

    res.json({ success: true, message: "Reply sent successfully" });
  } catch (err) {
    console.error("replyToMessage error:", err);
    res.status(500).json({ success: false, message: "Failed to send reply" });
  }
};