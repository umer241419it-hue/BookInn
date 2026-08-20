const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Define absolute path to uploads directory inside hotel-backend
const uploadDir = path.join(__dirname, "../uploads");

// Ensure directory exists at boot
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Configure disk storage with unique sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : ".jpg";
    const randomHex = crypto.randomBytes(6).toString("hex");
    const safeName = `room-${Date.now()}-${randomHex}${ext}`;
    cb(null, safeName);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (ALLOWED_MIME_TYPES.includes(mime) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type '${file.originalname}'. Only JPG, JPEG, PNG, and WEBP image files are allowed.`
      ),
      false
    );
  }
};

// Max 5MB per file, max 10 files per request
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10,
  },
});

module.exports = upload;
