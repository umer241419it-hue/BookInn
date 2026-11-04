const multer = require("multer");
const path = require("path");

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

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

/**
 * Multer middleware using in-memory storage.
 * Files are available as req.files[].buffer (not written to disk).
 * Compatible with Render's ephemeral filesystem.
 * Max 5MB per file, max 10 files per request.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10,
  },
});

module.exports = upload;
