const express = require("express");
const {
  getNotifications,
  getNotificationById,
  readNotification,
  readAllNotifications,
  deleteNotification,
  clearNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getNotifications);
router.delete("/", protect, deleteAllNotifications);
router.patch("/read-all", protect, readAllNotifications);
router.delete("/", protect, clearNotifications);
router.get("/:id", protect, getNotificationById);
router.patch("/:id/read", protect, readNotification);
router.delete("/:id", protect, deleteNotification);

module.exports = router;
