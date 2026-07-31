const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getMyBookings,
  createBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/my-bookings", protect, getMyBookings);
router.get("/", protect, adminOnly, getAllBookings);
router.post("/", protect, createBooking);
router.delete("/:id", protect, cancelBooking);

module.exports = router;
