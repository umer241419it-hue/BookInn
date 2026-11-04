const express = require("express");
const router = express.Router();
const {
  getAllRooms,
  getAvailableRooms,
  getRoomStats,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  uploadRoomImages,
  getImage,
} = require("../controllers/roomController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);
router.get("/stats", protect, adminOnly, getRoomStats);

// Public image retrieval from GridFS — must come before /:typeKey to avoid route conflict
router.get("/images/:fileId", getImage);

// Admin-only Room Management Endpoints
router.post("/upload", protect, adminOnly, upload.array("images", 10), uploadRoomImages);
router.post("/", protect, adminOnly, createRoomType);
router.put("/:typeKey", protect, adminOnly, updateRoomType);
router.delete("/:typeKey", protect, adminOnly, deleteRoomType);

module.exports = router;
