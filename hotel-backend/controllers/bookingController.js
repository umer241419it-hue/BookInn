const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

// GET /api/bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("roomId")
      .populate("userId", "name email role");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bookings/my-bookings (Protected)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/bookings (Protected)
const createBooking = async (req, res) => {
  try {
    const { roomId, roomType, guestName, guestPhone, checkIn, checkOut } = req.body;
    const userId = req.user.id; // Automatically pulled from protect middleware

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "Invalid checkIn or checkOut date format" });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    let targetRoomId = roomId;

    if (!targetRoomId && roomType) {
      // Find all rooms matching the requested category/type
      const roomsOfType = await Room.find({ type: roomType });
      if (roomsOfType.length === 0) {
        return res.status(404).json({ error: `Room category '${roomType}' not found` });
      }

      // Re-check booked room IDs fresh at booking creation time
      const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);
      const bookedSet = new Set(bookedRoomIds.map((id) => id.toString()));

      // Automatically pick an available room of that category
      const availableRoom = roomsOfType.find((r) => !bookedSet.has(r._id.toString()));

      if (!availableRoom) {
        return res.status(409).json({ error: `No '${roomType}' rooms are available for the selected dates` });
      }

      targetRoomId = availableRoom._id;
    } else if (targetRoomId) {
      // Verify specific room exists and is available (for backward compatibility if specific roomId passed)
      const room = await Room.findById(targetRoomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);
      const isBooked = bookedRoomIds.some((id) => id.toString() === targetRoomId.toString());

      if (isBooked) {
        return res.status(409).json({ error: "Room is not available for the selected dates" });
      }
    } else {
      return res.status(400).json({ error: "Either roomType or roomId is required to place a booking" });
    }

    // Create the booking attached to the authenticated user and allocated room
    const booking = await Booking.create({
      roomId: targetRoomId,
      userId,
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

// DELETE /api/bookings/:id (Protected - User can cancel own, Admin can cancel any)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Authorization check: user can only cancel own booking unless admin
    const isOwner = booking.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to cancel this booking" });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllBookings, getMyBookings, createBooking, cancelBooking };
