const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

// GET /api/rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
const getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut query params are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    // Get IDs of rooms that are booked during this range
    const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);

    // Return all rooms NOT in that set
    const availableRooms = await Room.find({ _id: { $nin: bookedRoomIds } });
    res.status(200).json(availableRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllRooms, getAvailableRooms };
