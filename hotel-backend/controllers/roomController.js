const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { getBookedRoomIds } = require("../utils/availability");
const { getGridFSBucket } = require("../config/gridfs");
const { ObjectId } = require("mongoose").mongo;
const crypto = require("crypto");

/**
 * Helper to group array of Room documents by type into category summaries.
 * Accepts optional bookedRoomIds array to calculate date-specific availability status.
 */
const groupRoomsByType = (rooms, bookedRoomIds = []) => {
  const bookedSet = new Set(bookedRoomIds.map((id) => id.toString()));

  const grouped = rooms.reduce((acc, room) => {
    const key = room.type;
    const isBooked = bookedSet.has(room._id.toString());

    if (!acc[key]) {
      acc[key] = {
        type: room.type,
        price: room.price,
        capacity: room.capacity,
        totalCount: 0,
        availableCount: 0,
        isAvailable: true,
        count: 0,
        roomIds: [],
        availableRoomIds: [],
        images: room.images && room.images.length > 0 ? room.images : [],
      };
    }

    acc[key].totalCount += 1;
    acc[key].roomIds.push(room._id);

    // Merge any images if present on room document
    if ((!acc[key].images || acc[key].images.length === 0) && room.images && room.images.length > 0) {
      acc[key].images = room.images;
    }

    if (!isBooked) {
      acc[key].availableCount += 1;
      acc[key].availableRoomIds.push(room._id);
    }

    acc[key].isAvailable = acc[key].availableCount > 0;
    // 'count' property is set to availableCount if availability check run, else totalCount
    acc[key].count = bookedRoomIds.length > 0 ? acc[key].availableCount : acc[key].totalCount;

    return acc;
  }, {});

  return Object.values(grouped);
};

/**
 * Helper: upload a file buffer to GridFS.
 * Returns the GridFS file _id (ObjectId) on success.
 */
const uploadBufferToGridFS = (bucket, buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    uploadStream.on("finish", () => resolve(uploadStream.id));
    uploadStream.on("error", reject);
    uploadStream.end(buffer);
  });
};

/**
 * Helper: delete GridFS files referenced by an array of image URLs.
 *
 * Only processes URLs matching the `/api/rooms/images/<fileId>` pattern.
 * Leaves external URLs (http/https) and legacy `/uploads/...` paths untouched.
 *
 * Reference-count safety: before deleting each GridFS file, checks whether any
 * OTHER Room document still references the same URL. If so, skips the delete
 * so that the file remains available to those rooms. This handles the case
 * where the same GridFS URL appears in multiple room records.
 */
const deleteGridFSImages = async (images) => {
  if (!Array.isArray(images) || images.length === 0) return;
  const bucket = getGridFSBucket();
  // Deduplicate the list — a URL need only be checked once
  const uniqueUrls = [...new Set(images.filter(
    (u) => typeof u === "string" && u.startsWith("/api/rooms/images/")
  ))];
  for (const url of uniqueUrls) {
    const fileIdStr = url.split("/api/rooms/images/")[1];
    try {
      // Check whether any Room document still references this URL
      const refCount = await Room.countDocuments({ images: url });
      if (refCount > 0) {
        // Another room still holds this reference — do not delete
        console.log(
          `GridFS: skipping delete of ${fileIdStr} — still referenced by ${refCount} room document(s)`
        );
        continue;
      }
      const fileId = new ObjectId(fileIdStr);
      await bucket.delete(fileId);
    } catch (err) {
      // Log but don't throw — file may already be gone or ID is malformed
      console.warn(`GridFS delete warning for ${fileIdStr}:`, err.message);
    }
  }
};

// GET /api/rooms (Category summary list)
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    const grouped = groupRoomsByType(rooms, []);
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

    // Fetch ALL rooms so frontend displays all room categories with availability status (AVAILABLE vs BOOKED)
    const allRooms = await Room.find();

    const grouped = groupRoomsByType(allRooms, bookedRoomIds);
    res.status(200).json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/rooms/stats (Admin: Dashboard total rooms, booked rooms, and monthly revenue)
const getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();

    // Distinct rooms with active/future confirmed or pending bookings
    const now = new Date();
    const bookedRoomIdsRaw = await Booking.distinct("roomId", {
      status: { $in: ["confirmed", "pending"] },
      checkOut: { $gte: now },
    });

    const bookedRoomsCount = bookedRoomIdsRaw.length;
    const availableRoomsCount = Math.max(0, totalRooms - bookedRoomsCount);

    const totalBookingsCount = await Booking.countDocuments();
    const cancelledBookingsCount = await Booking.countDocuments({ status: "cancelled" });

    // Monthly Revenue: Valid paid non-cancelled bookings created in current calendar month (createdAt)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyPaidBookings = await Booking.find({
      status: { $ne: "cancelled" },
      paymentStatus: "paid",
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate("roomId");

    const monthlyRevenue = monthlyPaidBookings.reduce((sum, b) => {
      if (typeof b.amountPaid === "number" && b.amountPaid > 0) {
        return sum + b.amountPaid;
      }
      if (b.roomId && b.roomId.price) {
        const cIn = new Date(b.checkIn);
        const cOut = new Date(b.checkOut);
        const nights = Math.max(1, Math.ceil((cOut - cIn) / (1000 * 60 * 60 * 24)));
        return sum + nights * b.roomId.price;
      }
      return sum;
    }, 0);

    res.status(200).json({
      totalRooms,
      bookedRooms: bookedRoomsCount,
      availableRooms: availableRoomsCount,
      totalBookings: totalBookingsCount,
      cancelledBookings: cancelledBookingsCount,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// POST /api/rooms (Admin: Create new room type)
const createRoomType = async (req, res) => {
  try {
    const { type, price, capacity, totalRooms, images } = req.body;

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

    // Clean images array
    const imagesArray = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
      : [];

    // Check if room type already exists
    const existing = await Room.findOne({ type: new RegExp(`^${trimmedType}$`, "i") });
    if (existing) {
      return res.status(400).json({ error: `Room type '${trimmedType}' already exists` });
    }

    const roomsToCreate = [];
    for (let i = 1; i <= countNum; i++) {
      roomsToCreate.push({
        type: trimmedType,
        price: priceNum,
        capacity: capacityNum,
        images: imagesArray,
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
    const { type, price, capacity, totalRooms, images } = req.body;

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

    // Clean images array
    const imagesArray = Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim().length > 0)
      : [];

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

    // Capture old images (all rooms in a type share the same images array) before update
    const oldImages = existingRooms[0].images || [];

    // Update details (type name, price, capacity, images) across all existing rooms
    await Room.updateMany(
      { type: decodedOriginalType },
      { $set: { type: trimmedNewType, price: priceNum, capacity: capacityNum, images: imagesArray } }
    );

    // Clean up GridFS files for images that were removed by the admin
    const removedImages = oldImages.filter((url) => !imagesArray.includes(url));
    if (removedImages.length > 0) {
      await deleteGridFSImages(removedImages);
    }

    const currentCount = existingRooms.length;

    if (countNum > currentCount) {
      // Need to add (countNum - currentCount) new room instances
      const diff = countNum - currentCount;

      const newRooms = [];
      for (let i = 1; i <= diff; i++) {
        newRooms.push({
          type: trimmedNewType,
          price: priceNum,
          capacity: capacityNum,
          images: imagesArray,
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

    // Collect all GridFS-stored images from all rooms of this type, deduplicate, then delete.
    // Rooms in the same type share identical image URLs — deduplication prevents redundant
    // GridFS deletes (each ObjectId must only be deleted once).
    const allImages = [...new Set(rooms.flatMap((r) => r.images || []))];
    await deleteGridFSImages(allImages);

    // Delete physical rooms
    await Room.deleteMany({ type: decodedType });

    res.status(200).json({ message: `Room type '${decodedType}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/rooms/upload (Admin: Upload room images to GridFS)
const uploadRoomImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files provided for upload." });
    }

    const bucket = getGridFSBucket();
    const imageUrls = [];

    for (const file of req.files) {
      const ext = file.originalname.split(".").pop().toLowerCase() || "jpg";
      const randomHex = crypto.randomBytes(6).toString("hex");
      const filename = `room-${Date.now()}-${randomHex}.${ext}`;

      const fileId = await uploadBufferToGridFS(bucket, file.buffer, filename, file.mimetype);
      imageUrls.push(`/api/rooms/images/${fileId.toString()}`);
    }

    res.status(200).json({
      success: true,
      message: `${imageUrls.length} image(s) uploaded successfully.`,
      imageUrls,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/rooms/images/:fileId (Public: Stream image from GridFS)
const getImage = async (req, res) => {
  try {
    const { fileId } = req.params;

    let objectId;
    try {
      objectId = new ObjectId(fileId);
    } catch {
      return res.status(400).json({ error: "Invalid image ID." });
    }

    const bucket = getGridFSBucket();

    // Check if file exists
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "Image not found." });
    }

    const file = files[0];

    // Set headers
    res.set("Content-Type", file.contentType || "image/jpeg");
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.set("Content-Length", file.length);

    // Stream the file
    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on("error", (err) => {
      console.error("GridFS stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream image." });
      }
    });
    downloadStream.pipe(res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = {
  getAllRooms,
  getAvailableRooms,
  getRoomStats,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  uploadRoomImages,
  getImage,
  deleteGridFSImages,
};
