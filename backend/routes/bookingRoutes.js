const express = require('express');
const {
  getBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { createBookingValidator } = require('../validations/bookingValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.get('/', protect, authorize('Admin', 'Manager'), getBookings);
router.get('/my', protect, getMyBookings);
router.post('/', protect, createBookingValidator, validate, createBooking);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
