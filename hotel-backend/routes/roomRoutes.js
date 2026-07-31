const express = require("express");
const router = express.Router();
const { getAllRooms, getAvailableRooms } = require("../controllers/roomController");

router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);

module.exports = router;
