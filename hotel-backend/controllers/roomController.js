const Room = require("../models/Room");
const Booking = require("../models/Booking");
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

// GET /api/rooms (Category summary list)
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

// POST /api/rooms (Admin: Create new room type)
const createRoomType = async (req, res) => {
  try {
    const { type, price, capacity, totalRooms } = req.body;

    if (!type || !type.trim()) {
      return res.status(400).json({ error: "Room Type name cannot be empty" });
    }

    const priceNum = Number(price);
    const capacityNum = Number(capacity);
    const countNum = Number(totalRooms);

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: "Price per night must be greater than 0" });
    }

    if (isNaN(capacityNum) || capacityNum < 1) {
      return res.status(400).json({ error: "Guest capacity must be at least 1" });
    }

    if (isNaN(countNum) || countNum < 1) {
      return res.status(400).json({ error: "Total rooms available must be at least 1" });
    }

    const trimmedType = type.trim();

    // Check if room type already exists
    const existing = await Room.findOne({ type: new RegExp(`^${trimmedType}$`, "i") });
    if (existing) {
      return res.status(400).json({ error: `Room type '${trimmedType}' already exists` });
    }

    // Prefix for room numbers
    const prefix = trimmedType.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "RM";
    const timestamp = Date.now().toString().slice(-4);

    const roomsToCreate = [];
    for (let i = 1; i <= countNum; i++) {
      roomsToCreate.push({
        number: `${prefix}-${timestamp}-${i}`,
        type: trimmedType,
        price: priceNum,
        capacity: capacityNum,
      });
    }

    await Room.insertMany(roomsToCreate);

    res.status(201).json({
      message: `Room type '${trimmedType}' created successfully with ${countNum} rooms`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/rooms/:typeKey (Admin: Update existing room type)
const updateRoomType = async (req, res) => {
  try {
    const { typeKey } = req.params;
    const { type, price, capacity, totalRooms } = req.body;

    if (!type || !type.trim()) {
      return res.status(400).json({ error: "Room Type name cannot be empty" });
    }

    const priceNum = Number(price);
    const capacityNum = Number(capacity);
    const countNum = Number(totalRooms);

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: "Price per night must be greater than 0" });
    }

    if (isNaN(capacityNum) || capacityNum < 1) {
      return res.status(400).json({ error: "Guest capacity must be at least 1" });
    }

    if (isNaN(countNum) || countNum < 1) {
      return res.status(400).json({ error: "Total rooms available must be at least 1" });
    }

    const decodedOriginalType = decodeURIComponent(typeKey);
    const trimmedNewType = type.trim();

    // Find all physical rooms for this type
    const existingRooms = await Room.find({ type: decodedOriginalType });

    if (!existingRooms || existingRooms.length === 0) {
      return res.status(404).json({ error: `Room type '${decodedOriginalType}' not found` });
    }

    // If type name is changing, ensure new name doesn't collide with another existing category
    if (decodedOriginalType.toLowerCase() !== trimmedNewType.toLowerCase()) {
      const collision = await Room.findOne({ type: new RegExp(`^${trimmedNewType}$`, "i") });
      if (collision) {
        return res.status(400).json({ error: `Room type '${trimmedNewType}' already exists` });
      }
    }

    // Update details (type name, price, capacity) across all existing rooms
    await Room.updateMany(
      { type: decodedOriginalType },
      { $set: { type: trimmedNewType, price: priceNum, capacity: capacityNum } }
    );

    const currentCount = existingRooms.length;

    if (countNum > currentCount) {
      // Need to add (countNum - currentCount) new room instances
      const diff = countNum - currentCount;
      const prefix = trimmedNewType.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "RM";
      const timestamp = Date.now().toString().slice(-4);

      const newRooms = [];
      for (let i = 1; i <= diff; i++) {
        newRooms.push({
          number: `${prefix}-${timestamp}-ADD${i}`,
          type: trimmedNewType,
          price: priceNum,
          capacity: capacityNum,
        });
      }
      await Room.insertMany(newRooms);
    } else if (countNum < currentCount) {
      // Need to reduce inventory by (currentCount - countNum)
      const toRemoveCount = currentCount - countNum;

      const currentRoomIds = existingRooms.map((r) => r._id);

      // Find room IDs with active/future bookings
      const bookedRoomIdsRaw = await Booking.distinct("roomId", {
        roomId: { $in: currentRoomIds },
        status: { $in: ["confirmed", "pending"] },
        checkOut: { $gte: new Date() },
      });
      const bookedRoomIdStrs = new Set(bookedRoomIdsRaw.map((id) => id.toString()));

      // Unbooked rooms that can be safely deleted
      const deletableRooms = existingRooms.filter((r) => !bookedRoomIdStrs.has(r._id.toString()));

      if (deletableRooms.length < toRemoveCount) {
        return res.status(400).json({
          error: `Cannot reduce total rooms to ${countNum} because ${bookedRoomIdStrs.size} rooms currently have active or future bookings.`,
        });
      }

      // Delete up to toRemoveCount unbooked rooms
      const idsToDelete = deletableRooms.slice(0, toRemoveCount).map((r) => r._id);
      await Room.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.status(200).json({ message: `Room type '${trimmedNewType}' updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/rooms/:typeKey (Admin: Delete room type if no active bookings exist)
const deleteRoomType = async (req, res) => {
  try {
    const { typeKey } = req.params;
    const decodedType = decodeURIComponent(typeKey);

    const rooms = await Room.find({ type: decodedType });
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ error: `Room type '${decodedType}' not found` });
    }

    const roomIds = rooms.map((r) => r._id);

    // Check for active or future bookings
    const activeBookings = await Booking.find({
      roomId: { $in: roomIds },
      status: { $in: ["confirmed", "pending"] },
      checkOut: { $gte: new Date() },
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        error: `Cannot delete room type '${decodedType}' because there are ${activeBookings.length} active or upcoming booking(s) associated with it.`,
      });
    }

    // Delete physical rooms
    await Room.deleteMany({ type: decodedType });

    res.status(200).json({ message: `Room type '${decodedType}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRooms,
  getAvailableRooms,
  createRoomType,
  updateRoomType,
  deleteRoomType,
};
