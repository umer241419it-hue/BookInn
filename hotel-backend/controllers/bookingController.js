const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { getBookedRoomIds } = require("../utils/availability");

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
 * Schema enum: ['none', 'pending', 'processing', 'processed', 'failed']
 * - 'processed' -> 'processed'
 * - 'failed' -> 'failed'
 * - 'pending' -> 'pending'
 * - 'created' or anything else -> 'processing'
 */
const mapRazorpayRefundStatus = (razorpayStatus) => {
  if (!razorpayStatus) return "processing";
  const status = razorpayStatus.toString().toLowerCase().trim();
  if (status === "processed") return "processed";
  if (status === "failed") return "failed";
  if (status === "pending") return "pending";
  return "processing";
};

/**
 * Option B: Immediate Short Background Polling for Refund Status Transition
 * Polls Razorpay API every 2.5 seconds (up to 10 iterations = 25s max) to detect when status
 * transitions from 'pending'/'processing' to 'processed' or 'failed', updating MongoDB immediately.
 */
const pollRefundStatusAsync = (bookingId, razorpayRefundId) => {
  if (!bookingId || !razorpayRefundId) return;

  console.log("[Synchronization Started]", {
    bookingId: bookingId.toString(),
    refundId: razorpayRefundId,
    timestamp: new Date().toISOString(),
  });

  let iterations = 0;
  const maxIterations = 10;
  const intervalMs = 2500;

  const timer = setInterval(async () => {
    iterations++;
    try {
      const razorpay = getRazorpayInstance();
      const rf = await razorpay.refunds.fetch(razorpayRefundId);

      const fetchedStatus = rf ? rf.status : "unknown";
      console.log("[Current Razorpay Refund Status]", {
        bookingId: bookingId.toString(),
        refundId: razorpayRefundId,
        pollStep: `${iterations}/${maxIterations}`,
        fetchedStatus,
      });

      const mappedStatus = mapRazorpayRefundStatus(fetchedStatus);

      if (mappedStatus === "processed" || mappedStatus === "failed" || iterations >= maxIterations) {
        clearInterval(timer);

        console.log("[MongoDB Update Attempted]", {
          bookingId: bookingId.toString(),
          refundId: razorpayRefundId,
          targetStatus: mappedStatus,
        });

        const updateData = { refundStatus: mappedStatus };
        if (rf && rf.amount) {
          updateData.refundAmount = rf.amount / 100;
        }

        await Booking.updateOne({ _id: bookingId }, updateData);

        console.log("[MongoDB Update Successful]", {
          bookingId: bookingId.toString(),
          status: mappedStatus,
        });

        console.log("[Synchronization Completed]", {
          bookingId: bookingId.toString(),
          refundId: razorpayRefundId,
          finalStatus: mappedStatus,
          iterationsRun: iterations,
        });
      }
    } catch (err) {
      console.error(`[Refund Poll Error] Iteration ${iterations} for ${razorpayRefundId}:`, err.message);
      if (iterations >= maxIterations) {
        clearInterval(timer);
      }
    }
  }, intervalMs);
};

/**
 * Fallback helper to sync any pending/processing refunds during list queries.
 */
const syncPendingRefunds = async (bookingsList) => {
  const pendingItems = bookingsList.filter(
    (b) => (b.refundStatus === "processing" || b.refundStatus === "pending") && (b.razorpayRefundId || b.razorpayPaymentId)
  );

  if (!pendingItems || pendingItems.length === 0) return;

  try {
    const razorpay = getRazorpayInstance();
    for (const b of pendingItems) {
      if (b.razorpayRefundId) {
        console.log("[Query Sync] Fetching refund status for:", b.razorpayRefundId);
        const rf = await razorpay.refunds.fetch(b.razorpayRefundId);
        if (rf && rf.status) {
          const mapped = mapRazorpayRefundStatus(rf.status);
          if (mapped !== b.refundStatus) {
            b.refundStatus = mapped;
            await Booking.updateOne({ _id: b._id }, { refundStatus: mapped });
            console.log(`[Query Sync] Booking ${b._id} refundStatus updated to ${mapped}`);
          }
        }
      } else if (b.razorpayPaymentId) {
        console.log("[Query Sync] Checking payment refunds list for:", b.razorpayPaymentId);
        const refundsList = await razorpay.refunds.all({ payment_id: b.razorpayPaymentId });
        if (refundsList && refundsList.items && refundsList.items.length > 0) {
          const rf = refundsList.items[0];
          const mapped = mapRazorpayRefundStatus(rf.status);
          b.razorpayRefundId = rf.id;
          b.refundStatus = mapped;
          b.refundAmount = rf.amount ? rf.amount / 100 : b.refundAmount;
          await Booking.updateOne(
            { _id: b._id },
            {
              razorpayRefundId: rf.id,
              refundStatus: mapped,
              refundAmount: b.refundAmount,
            }
          );
          console.log(`[Query Sync] Booking ${b._id} synced with refund ${rf.id} (${mapped})`);
        }
      }
    }
  } catch (err) {
    console.error("Query auto-sync pending refunds error:", err.message);
  }
};

// GET /api/bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("roomId")
      .populate("userId", "name email role");
    await syncPendingRefunds(bookings);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bookings/my-bookings (Protected)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("roomId");
    await syncPendingRefunds(bookings);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/bookings (Protected)
const createBooking = async (req, res) => {
  try {
    const { roomId, roomType, guestName, guestPhone, checkIn, checkOut } = req.body;
    const userId = req.user.id;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: "Invalid checkIn or checkOut date format" });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "checkOut must be after checkIn" });
    }

    let targetRoomId = roomId;

    if (!targetRoomId && roomType) {
      const roomsOfType = await Room.find({ type: roomType });
      if (roomsOfType.length === 0) {
        return res.status(404).json({ error: `Room category '${roomType}' not found` });
      }

      const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);
      const bookedSet = new Set(bookedRoomIds.map((id) => id.toString()));
      const availableRoom = roomsOfType.find((r) => !bookedSet.has(r._id.toString()));

      if (!availableRoom) {
        return res.status(409).json({ error: `No '${roomType}' rooms are available for the selected dates` });
      }

      targetRoomId = availableRoom._id;
    } else if (targetRoomId) {
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

// DELETE /api/bookings/:id (Protected - User can cancel own, Admin can cancel any)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("roomId");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isOwner = booking.userId.toString() === req.user.id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to cancel this booking" });
    }

    // IDEMPOTENCY CHECK
    if (booking.refundStatus === "processed" || (booking.razorpayRefundId && booking.status === "cancelled")) {
      console.log("[Refund Idempotency Hit]", {
        bookingId: booking._id,
        razorpayRefundId: booking.razorpayRefundId,
      });

      const updatedBooking = await Booking.findById(booking._id)
        .populate("roomId")
        .populate("userId", "name email role");

      return res.status(200).json({
        message: "This booking has already been refunded.",
        alreadyRefunded: true,
        booking: updatedBooking,
      });
    }

    let refundFailed = false;
    let refundErrorMessage = "";
    let createdRefundId = null;

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

      if (amountToRefund > 0) {
        booking.refundAmount = amountToRefund;
      }

      if (!booking.razorpayPaymentId) {
        booking.refundStatus = "failed";
        refundFailed = true;
        refundErrorMessage = "Missing Razorpay Payment ID on paid booking.";
      } else if (amountToRefund <= 0) {
        booking.refundStatus = "failed";
        refundFailed = true;
        refundErrorMessage = "Invalid refund amount (calculated amount <= 0).";
      } else {
        // Log Stage 1: Refund Request Created
        console.log("[Refund Request Created]", {
          bookingId: booking._id.toString(),
          paymentId: booking.razorpayPaymentId,
          amountToRefund,
        });

        try {
          const razorpay = getRazorpayInstance();
          const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
            amount: Math.round(amountToRefund * 100),
          });

          // Log Stage 2: Initial Razorpay Response
          console.log("[Initial Razorpay Response]", {
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount ? refund.amount / 100 : amountToRefund,
          });

          createdRefundId = refund.id;
          booking.razorpayRefundId = refund.id;
          booking.refundStatus = mapRazorpayRefundStatus(refund.status);
          booking.refundAmount = refund.amount ? refund.amount / 100 : amountToRefund;
          booking.refundedAt = new Date();
        } catch (refundError) {
          const errDesc =
            refundError.error?.description ||
            refundError.description ||
            refundError.message ||
            (typeof refundError === "string" ? refundError : "Razorpay API Error");

          console.error("[Refund API Error]", {
            bookingId: booking._id,
            errorMessage: errDesc,
          });

          const errLower = errDesc.toLowerCase();
          if (errLower.includes("refunded already") || errLower.includes("already refunded") || errLower.includes("fully refunded")) {
            try {
              const razorpay = getRazorpayInstance();
              const refundsList = await razorpay.refunds.all({ payment_id: booking.razorpayPaymentId });
              const existingRefund = refundsList.items && refundsList.items.length > 0 ? refundsList.items[0] : null;

              if (existingRefund) {
                createdRefundId = existingRefund.id;
                booking.razorpayRefundId = existingRefund.id;
                booking.refundStatus = mapRazorpayRefundStatus(existingRefund.status);
                booking.refundAmount = existingRefund.amount ? existingRefund.amount / 100 : amountToRefund;
                booking.refundedAt = new Date();
                refundFailed = false;
              } else {
                booking.refundStatus = "failed";
                refundFailed = true;
                refundErrorMessage = `Razorpay error: ${errDesc}`;
              }
            } catch (recoveryErr) {
              booking.refundStatus = "failed";
              refundFailed = true;
              refundErrorMessage = `Razorpay error: ${errDesc} (recovery failed: ${recoveryErr.message})`;
            }
          } else {
            booking.refundStatus = "failed";
            refundFailed = true;
            refundErrorMessage = `Razorpay API error: ${errDesc}`;
          }
        }
      }
    }

    booking.status = "cancelled";
    await booking.save();

    console.log("[MongoDB Initial Save Successful]", {
      bookingId: booking._id.toString(),
      status: booking.status,
      refundStatus: booking.refundStatus,
      razorpayRefundId: booking.razorpayRefundId,
    });

    // Trigger Option B background polling if a refund was created and is pending/processing
    if (createdRefundId && (booking.refundStatus === "processing" || booking.refundStatus === "pending")) {
      pollRefundStatusAsync(booking._id, createdRefundId);
    }

    const updatedBooking = await Booking.findById(booking._id)
      .populate("roomId")
      .populate("userId", "name email role");

    if (refundFailed) {
      return res.status(200).json({
        message: `Booking cancelled successfully, but automatic refund failed (${refundErrorMessage}). Manual follow-up required.`,
        refundError: refundErrorMessage,
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
