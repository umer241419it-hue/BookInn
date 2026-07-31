const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

// GET /api/bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestPhone, checkIn, checkOut } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    // Verify the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Re-check availability using the SAME shared overlap logic
    const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);
    const isBooked = bookedRoomIds.some((id) => id.toString() === roomId.toString());

    if (isBooked) {
      return res.status(409).json({ error: "Room is not available for the selected dates" });
    }

    // Create the booking
    const booking = await Booking.create({
      roomId,
      guestName,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/bookings/:id
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllBookings, createBooking, cancelBooking };
