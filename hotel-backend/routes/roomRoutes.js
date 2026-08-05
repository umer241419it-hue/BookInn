const express = require("express");
const router = express.Router();
const {
  getAllRooms,
  getAvailableRooms,
  createRoomType,
  updateRoomType,
  deleteRoomType,
} = require("../controllers/roomController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);

// Admin-only Room Management Endpoints
router.post("/", protect, adminOnly, createRoomType);
router.put("/:typeKey", protect, adminOnly, updateRoomType);
router.delete("/:typeKey", protect, adminOnly, deleteRoomType);

module.exports = router;
