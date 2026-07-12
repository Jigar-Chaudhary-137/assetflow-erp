const express = require('express');
const {
  createBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBookings,
  getBookingById
} = require('../controllers/bookingController');
const { 
  createBookingValidator, 
  updateBookingStatusValidator 
} = require('../validations/bookingValidation');
const validate = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

router.post('/', protect, createBookingValidator, validate, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/approve', protect, authorize('Admin', 'Manager'), approveBooking);
router.post('/:id/reject', protect, authorize('Admin', 'Manager'), updateBookingStatusValidator, validate, rejectBooking);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;
