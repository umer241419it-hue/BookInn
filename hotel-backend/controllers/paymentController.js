const Razorpay = require("razorpay");
const crypto = require("crypto");
const Booking = require("../models/Booking");

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || key_id.includes("YOUR_KEY_ID")) {
    throw new Error(
      "Razorpay API keys are not configured. Please add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file."
    );
  }

  return new Razorpay({ key_id, key_secret });
};

// POST /api/payments/create-order (Protected)
const createOrder = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    let finalAmountInINR = amount;
    let booking = null;

    if (bookingId) {
      booking = await Booking.findById(bookingId).populate("roomId");
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (!finalAmountInINR && booking.roomId && booking.roomId.price) {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        const nights = Math.max(
          1,
          Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
        );
        finalAmountInINR = nights * booking.roomId.price;
      }
    }

    if (!finalAmountInINR || isNaN(finalAmountInINR) || finalAmountInINR <= 0) {
      return res.status(400).json({ error: "Valid amount or booking details required to create payment order" });
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(finalAmountInINR * 100);

    const razorpay = getRazorpayInstance();

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${bookingId || Date.now()}`,
      notes: {
        bookingId: bookingId ? bookingId.toString() : "",
      },
    };

    const order = await razorpay.orders.create(options);

    if (booking) {
      booking.razorpayOrderId = order.id;
      await booking.save();
    }

    res.status(201).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
      amountINR: finalAmountInINR,
    });
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
  }
};

// POST /api/payments/verify (Protected)
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        error: "Missing required payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.includes("YOUR_KEY_SECRET")) {
      return res.status(500).json({
        error: "Razorpay Key Secret is not configured in server .env file",
      });
    }

    // Cryptographic HMAC SHA256 verification algorithm as per Razorpay documentation
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body.toString())
      .digest("hex");

    const isSignatureValid = expectedSignature === razorpay_signature;

    // Find target booking
    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId).populate("roomId");
    } else if (razorpay_order_id) {
      booking = await Booking.findOne({ razorpayOrderId: razorpay_order_id }).populate("roomId");
    }

    if (isSignatureValid) {
      if (booking) {
        booking.paymentStatus = "paid";
        booking.status = "confirmed";
        booking.razorpayOrderId = razorpay_order_id;
        booking.razorpayPaymentId = razorpay_payment_id;

        // Store captured amountPaid
        if (booking.roomId && booking.roomId.price) {
          const checkInDate = new Date(booking.checkIn);
          const checkOutDate = new Date(booking.checkOut);
          const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
          booking.amountPaid = nights * booking.roomId.price;
        } else if (req.body.amount) {
          booking.amountPaid = req.body.amount;
        }

        await booking.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        booking,
      });
    } else {
      if (booking) {
        booking.paymentStatus = "failed";
        await booking.save();
      }

      return res.status(400).json({
        success: false,
        error: "Invalid payment signature verification failed",
        booking,
      });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ error: error.message || "Payment verification failed server-side" });
  }
};

module.exports = { createOrder, verifyPayment };
