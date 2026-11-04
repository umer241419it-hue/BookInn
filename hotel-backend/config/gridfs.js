const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket = null;

/**
 * Returns the GridFSBucket instance for the "roomImages" bucket.
 * Uses the existing Mongoose connection — no extra DB connection is created.
 * Must be called only after connectDB() has resolved.
 */
const getGridFSBucket = () => {
  if (!bucket) {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected. Cannot access GridFS.");
    }
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "roomImages" });
  }
  return bucket;
};

/**
 * Resets the cached bucket reference.
 * Call this if the mongoose connection is re-established.
 */
const resetBucket = () => {
  bucket = null;
};

module.exports = { getGridFSBucket, resetBucket };
