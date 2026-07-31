const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

/**
 * Helper to group array of Room documents by type into category summaries.
 */
const groupRoomsByType = (rooms) => {
  const grouped = rooms.reduce((acc, room) => {
    const key = room.type;
    if (!acc[key]) {
      acc[key] = {
        type: room.type,
        price: room.price,
        capacity: room.capacity,
        count: 0,
        roomIds: [],
      };
    }
    acc[key].count += 1;
    acc[key].roomIds.push(room._id);
    return acc;
  }, {});

  return Object.values(grouped);
};

// GET /api/rooms (Guest category list)
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    const grouped = groupRoomsByType(rooms);
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD (Guest search)
const getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: "checkIn and checkOut query params are required" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "Invalid checkIn or checkOut date format" });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    // Get IDs of rooms that are booked during this range
    const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);

    // Get all rooms NOT in that set
    const availableRooms = await Room.find({ _id: { $nin: bookedRoomIds } });

    // Group by category type for guest display
    const grouped = groupRoomsByType(availableRooms);
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllRooms, getAvailableRooms };
