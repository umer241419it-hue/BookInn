require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use(errorHandler);

connectDB().then(async () => {
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
});
