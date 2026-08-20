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
} = require("../controllers/roomController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);
router.get("/stats", protect, adminOnly, getRoomStats);

// Admin-only Room Management Endpoints
router.post("/upload", protect, adminOnly, upload.array("images", 10), uploadRoomImages);
router.post("/", protect, adminOnly, createRoomType);
router.put("/:typeKey", protect, adminOnly, updateRoomType);
router.delete("/:typeKey", protect, adminOnly, deleteRoomType);

module.exports = router;


