const express = require("express");
const router = express.Router();
const { getAllBookings, createBooking, cancelBooking } = require("../controllers/bookingController");

router.get("/", getAllBookings);
router.post("/", createBooking);
router.delete("/:id", cancelBooking);

module.exports = router;
