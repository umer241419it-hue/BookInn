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

    // Create the booking attached to the authenticated user and allocated room (initially pending payment)
    const booking = await Booking.create({
      roomId: targetRoomId,
      userId,
      guestName,
      guestPhone,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      status: "pending",
      paymentStatus: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id).populate("roomId");

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Razorpay = require("razorpay");

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret || key_id.includes("YOUR_KEY_ID")) {
    throw new Error("Razorpay API keys are not configured properly in server environment.");
  }
  return new Razorpay({ key_id, key_secret });
};

/**
 * Map Razorpay refund API statuses to Booking Mongoose Schema enum values:
 * Schema enum: ['none', 'processing', 'processed', 'failed']
 * - 'processed' -> 'processed'
 * - 'failed' -> 'failed'
 * - 'created', 'pending', or anything else -> 'processing'
 */
const mapRazorpayRefundStatus = (razorpayStatus) => {
  if (!razorpayStatus) return "processing";
  const status = razorpayStatus.toString().toLowerCase().trim();
  if (status === "processed") return "processed";
  if (status === "failed") return "failed";
  return "processing";
};

// DELETE /api/bookings/:id (Protected - User can cancel own, Admin can cancel any)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("roomId");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Authorization check: user can only cancel own booking unless admin
    const isOwner = booking.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to cancel this booking" });
    }

    let refundFailed = false;

    // Process Razorpay refund if paid
    if (booking.paymentStatus === "paid") {
      let amountToRefund = Number(booking.amountPaid);
      if (!amountToRefund || isNaN(amountToRefund) || amountToRefund <= 0) {
        if (booking.roomId && typeof booking.roomId.price === "number" && booking.roomId.price > 0) {
          const checkInDate = new Date(booking.checkIn);
          const checkOutDate = new Date(booking.checkOut);
          const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
          amountToRefund = nights * booking.roomId.price;
        } else {
          amountToRefund = 0;
        }
      }

      // Always save calculated refundAmount so manual follow-up has exact figure
      if (amountToRefund > 0) {
        booking.refundAmount = amountToRefund;
      }

      if (!booking.razorpayPaymentId || amountToRefund <= 0) {
        // Missing payment transaction ID or unresolvable amount -> mark refund failed
        booking.refundStatus = "failed";
        refundFailed = true;
      } else {
        try {
          const razorpay = getRazorpayInstance();
          const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
            amount: Math.round(amountToRefund * 100), // amount in paise
          });

          booking.razorpayRefundId = refund.id;
          booking.refundStatus = mapRazorpayRefundStatus(refund.status);
          booking.refundAmount = refund.amount ? refund.amount / 100 : amountToRefund;
          booking.refundedAt = new Date();
        } catch (refundError) {
          console.error("Razorpay Refund API Error:", refundError);
          const errDesc =
            refundError.error?.description ||
            refundError.description ||
            refundError.message ||
            "";

          // If payment was already refunded at Razorpay (e.g. previous call succeeded but DB save failed), recover refund details
          const errLower = errDesc.toLowerCase();
          if (errLower.includes("refunded already") || errLower.includes("already refunded") || errLower.includes("fully refunded")) {
            try {
              const razorpay = getRazorpayInstance();
              const refundsList = await razorpay.refunds.all({ payment_id: booking.razorpayPaymentId });
              const existingRefund = refundsList.items && refundsList.items.length > 0 ? refundsList.items[0] : null;
              if (existingRefund) {
                booking.razorpayRefundId = existingRefund.id;
                booking.refundStatus = mapRazorpayRefundStatus(existingRefund.status);
                booking.refundAmount = existingRefund.amount
                  ? existingRefund.amount / 100
                  : amountToRefund;
                booking.refundedAt = new Date();
                refundFailed = false;
              } else {
                booking.refundStatus = "failed";
                refundFailed = true;
              }
            } catch (recoveryErr) {
              console.error("Recovery fetch failed:", recoveryErr);
              booking.refundStatus = "failed";
              refundFailed = true;
            }
          } else {
            booking.refundStatus = "failed";
            refundFailed = true;
          }
        }
      }
    }

    // Mark status cancelled regardless of refund result
    booking.status = "cancelled";
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("roomId")
      .populate("userId", "name email role");

    if (refundFailed) {
      return res.status(200).json({
        message: "Booking cancelled successfully, but automatic Razorpay refund failed. Manual refund follow-up required.",
        booking: updatedBooking,
      });
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllBookings, getMyBookings, createBooking, cancelBooking };
