const Booking = require("../models/Booking");

/**
 * Find all room IDs that have a confirmed booking overlapping the given date range.
 *
 * Overlap logic (strict < and >):
 *   An existing booking conflicts when it starts BEFORE the requested checkout
 *   AND ends AFTER the requested checkin.
 *   Same-day checkout/checkin is allowed (checkout morning, checkin afternoon).
 *
 * @param {Date} checkIn  - requested check-in date
 * @param {Date} checkOut - requested check-out date
 * @returns {Array<ObjectId>} array of room IDs that are booked (unavailable)
 */
const getBookedRoomIds = async (checkIn, checkOut) => {
  const conflictingBookings = await Booking.find({
    status: { $ne: "cancelled" },
    checkIn: { $lt: checkOut },   // existing starts before our checkout
    checkOut: { $gt: checkIn },   // existing ends after our checkin
  }).select("roomId");

  return conflictingBookings
    .map((b) => b.roomId)
    .filter(Boolean);
};


module.exports = { getBookedRoomIds };
