const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: [true, "Resource (Asset) reference is required"],
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee reference is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      required: true,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      trim: true,
      minlength: [5, "Purpose must be at least 5 characters"],
      maxlength: [200, "Purpose cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
bookingSchema.index({ resourceId: 1 });
bookingSchema.index({ employeeId: 1 });
bookingSchema.index(
  { resourceId: 1, status: 1, startTime: 1, endTime: 1 },
  { name: "idx_bookings_overlap_check" },
);

module.exports = mongoose.model("Booking", bookingSchema);
