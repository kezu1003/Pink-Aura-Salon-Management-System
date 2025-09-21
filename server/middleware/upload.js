import multer from "multer";
import path from "path";
import fs from "fs";

const adsDir = path.resolve("uploads", "ads");
fs.mkdirSync(adsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, adsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ok.includes(ext)) return cb(new Error("Only image files are allowed"));
  cb(null, true);
};

export const uploadAdImage = multer({ storage, fileFilter }).single("image");

export const handleMulterError = (err, _req, res, next) => {
  if (!err) return next();
  res.status(400).json({ success: false, message: err.message });
};
