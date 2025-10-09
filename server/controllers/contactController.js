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
